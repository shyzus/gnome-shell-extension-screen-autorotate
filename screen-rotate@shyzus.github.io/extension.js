/* extension.js
* Copyright (C) 2023  kosmospredanie, shyzus, Shinigaminai
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import Gio from 'gi://Gio';

import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js';

import * as Rotator from './rotator.js'

const ORIENTATION_LOCK_SCHEMA = 'org.gnome.settings-daemon.peripherals.touchscreen';
const ORIENTATION_LOCK_KEY = 'orientation-lock';

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const { GLib, Gio, GObject } = imports.gi;

const Main = imports.ui.main;
const SystemActions = imports.misc.systemActions;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Rotator = Me.imports.rotator;
const Config = imports.misc.config;
const [major] = Config.PACKAGE_VERSION.split('.');
const shellVersion = Number.parseInt(major);
const PopupMenu = imports.ui.popupMenu;
const QuickSettings = imports.ui.quickSettings;
const QuickSettingsMenu = imports.ui.main.panel.statusArea.quickSettings;

// Orientation names must match those provided by net.hadess.SensorProxy
const Orientation = Object.freeze({
  'normal': 0,
  'left-up': 1,
  'bottom-up': 2,
  'right-up': 3
});

var interval = null;

const ManualOrientationMenuToggle = GObject.registerClass(
  class ManualOrientationMenuToggle extends QuickSettings.QuickMenuToggle {
    _init() {
      super._init({
        title: 'Manual Orientation',
        iconName: 'selection-mode-symbolic',
        toggleMode: true,
      });

      this.menu.setHeader('selection-mode-symbolic', 'Manual Orientation');

      this._itemsSection = new PopupMenu.PopupMenuSection();
      this._itemsSection.addAction('Landscape', () => {
        log('landscape');
        Rotator.rotate_to(0);
      });
      this._itemsSection.addAction('Portrait', () => {
        log('portrait');
        Rotator.rotate_to(1);
      });
      this._itemsSection.addAction('Landscape Inverted', () => {
        log('landscape inverted');
        Rotator.rotate_to(2);
      });
      this._itemsSection.addAction('Portrait Inverted', () => {
        log('portrait inverted');
        Rotator.rotate_to(3);
      });
      this.menu.addMenuItem(this._itemsSection);

      // Add an entry-point for more settings
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      const settingsItem = this.menu.addAction('More Settings',
        () => ExtensionUtils.openPrefs());

      // Ensure the settings are unavailable when the screen is locked
      settingsItem.visible = Main.sessionMode.allowSettings;
      this.menu._settingsActions[Extension.uuid] = settingsItem;
    }
  }
)

class SensorProxy {
  constructor(rotate_cb) {
    this._rotate_cb = rotate_cb;
    this._proxy = null;
    this._enabled = false;
    this._watcher_id = Gio.bus_watch_name(
      Gio.BusType.SYSTEM,
      'net.hadess.SensorProxy',
      Gio.BusNameWatcherFlags.NONE,
      this.appeared.bind(this),
      this.vanished.bind(this)
    );
  }

  destroy() {
    Gio.bus_unwatch_name(this._watcher_id);
    if (this._enabled) this.disable();
    this._proxy = null;
  }

  enable() {
    this._enabled = true;
    if (this._proxy === null) return;
    this._proxy.call_sync('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
  }

  disable() {
    this._enabled = false;
    if (this._proxy === null) return;
    this._proxy.call_sync('ReleaseAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
  }

  appeared(connection, name, name_owner) {
    this._proxy = Gio.DBusProxy.new_for_bus_sync(
      Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
      'net.hadess.SensorProxy', '/net/hadess/SensorProxy', 'net.hadess.SensorProxy',
      null);
    this._proxy.connect('g-properties-changed', this.properties_changed.bind(this));
    if (this._enabled) {
      this._proxy.call_sync('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
    }
  }

  vanished(connection, name) {
    this._proxy = null;
  }

  properties_changed(proxy, changed, invalidated) {
    if (!this._enabled) return;
    let properties = changed.deep_unpack();
    for (let [name, value] of Object.entries(properties)) {
      if (name != 'AccelerometerOrientation') continue;
      let target = value.unpack();
      this._rotate_cb(target);
    }
  }
}

class ScreenAutorotate {
  constructor(settings) {
    this._system_actions = SystemActions.getDefault();
    this._settings = settings;
    this._system_actions_backup = null;
    this._override_system_actions();
    this._orientation_settings = new Gio.Settings({ schema_id: ORIENTATION_LOCK_SCHEMA });
    this._orientation_settings.connect('changed::' + ORIENTATION_LOCK_KEY, this._orientation_lock_changed.bind(this));

    this._sensor_proxy = new SensorProxy(this.rotate_to.bind(this));

    this._state = false; // enabled or not
    this._manual_orientation = this._settings.get_boolean('manual-orientation');
    this._manual_orientation_toggle_menu = null;

    let locked = this._orientation_settings.get_boolean(ORIENTATION_LOCK_KEY);
    if (!locked) this.enable();
  }

  _override_system_actions() {
    this._system_actions_backup = {
      '_updateOrientationLock': this._system_actions._updateOrientationLock
    };

    this._system_actions._updateOrientationLock = function() {
      this._actions.get('lock-orientation').available = true;
      this.notify('can-lock-orientation');
    };

    this._system_actions._updateOrientationLock();
  }

  _restore_system_actions() {
    if (this._system_actions_backup === null) return;
    this._system_actions._updateOrientationLock = this._system_actions_backup['_updateOrientationLock'];
    this._system_actions._updateOrientationLock();
    this._system_actions_backup = null;
  }

  _orientation_lock_changed() {
    let locked = this._orientation_settings.get_boolean(ORIENTATION_LOCK_KEY);
    if (this._state == locked) {
      this.toggle();
    }
  }

  destroy() {
    this._sensor_proxy.destroy();
    this._orientation_settings = null;
    this._manual_orientation_toggle_menu.destroy();
    this._manual_orientation_toggle_menu = null;
    this._restore_system_actions();
  }

  toggle() {
    if (this._state) {
      this.disable();
    } else {
      this.enable();
    }
  }
  enable() {
    this._sensor_proxy.enable();
    this._state = true;
    this._manual_orientation_toggle_menu = new ManualOrientationMenuToggle();
    QuickSettingsMenu._addItems([this._manual_orientation_toggle_menu]);
    QuickSettingsMenu.menu._grid.set_child_below_sibling(this._manual_orientation_toggle_menu,
      QuickSettingsMenu._powerProfiles.quickSettingsItems[0]);
  }

  disable() {
    this._sensor_proxy.disable();
    this._state = false;
  }

  rotate_to(orientation) {
    const sensor = Orientation[orientation];
    const invert_horizontal_direction = this._settings.get_boolean('invert-horizontal-rotation-direction');
    const invert_vertical_direction = this._settings.get_boolean('invert-vertical-rotation-direction');
    const offset = this._settings.get_int('orientation-offset');
    let target = sensor; // Default to sensor output.

    switch (sensor) {
      case 0:
        // sensor reports landscape
        if (invert_horizontal_direction) {
          target = 2;
        }
        break;
      case 1:
        // sensor reports portrait
        if (invert_vertical_direction) {
          target = 3;
        }
        break;
      case 2:
        // sensor reports landscape-inverted
        if (invert_horizontal_direction) {
          target = 0;
        }
        break;
      case 3:
        // sensor reports portrait-inverted
        if (invert_vertical_direction) {
          target = 1;
        }
        break;
    }

    target = (target + offset) % 4;
    if (this._settings.get_boolean('debug-logging')) {
      console.debug(`sensor=${Orientation[orientation]}`);
      console.debug(`offset=${offset}`);
      console.debug(`target=${target}`);
    }
    Rotator.rotate_to(target);
  }
}

export default class ScreenAutoRotateExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._ext = new ScreenAutorotate(this._settings);
  }

  disable() {
    /*
        Comment for unlock-dialog usage:
        The unlock-dialog sesson-mode is usefull for this extension as it allows
        the user to rotate their screen or lock rotation after their device may
        have auto-locked. This provides the ability to log back in regardless of 
        the orientation of the device in tablet mode.
    */
    this._settings = null;
    this._ext.destroy();
    this._ext = null;
  }
}

