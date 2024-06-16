/* extension.js
* Copyright (C) 2024  kosmospredanie, shyzus, Shinigaminai
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

import Gio from 'gi://Gio';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js';

import * as Rotator from './rotator.js'
import { Orientation } from './orientation.js';
import { ManualOrientationIndicator } from './manualOrientationIndicator.js';
import { SensorProxy } from './sensorProxy.js';

const ORIENTATION_LOCK_SCHEMA = 'org.gnome.settings-daemon.peripherals.touchscreen';
const ORIENTATION_LOCK_KEY = 'orientation-lock';
const A11Y_APPLICATIONS_SCHEMA = 'org.gnome.desktop.a11y.applications';
const SHOW_KEYBOARD = 'screen-keyboard-enabled';

export default class ScreenAutoRotateExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._system_actions = SystemActions.getDefault();
    this._system_actions_backup = null;
    this._override_system_actions();

    this._a11yApplicationsSettings = new Gio.Settings({schema_id: A11Y_APPLICATIONS_SCHEMA});
    this._orientation_settings = new Gio.Settings({ schema_id: ORIENTATION_LOCK_SCHEMA });
    this._orientation_settings.connect('changed::' + ORIENTATION_LOCK_KEY, this._orientation_lock_changed.bind(this));

    this._sensor_proxy = new SensorProxy(this.rotate_to.bind(this));

    this._state = false;

    let locked = this._orientation_settings.get_boolean(ORIENTATION_LOCK_KEY);
    if (!locked) {
      this.toggle_rotation_lock()
    }

    this._settings.connect('changed::manual-flip', (settings, key) => {
      if (settings.get_boolean(key)) {
        this._add_manual_flip();
      } else {
        this._remove_manual_flip();
      }
    });

    this._settings.connect('changed::hide-lock-rotate', (settings, key) => {
      this._set_hide_lock_rotate(settings.get_boolean(key));
    });

    if (this._settings.get_boolean('manual-flip')) {
      this._add_manual_flip();
    } else {
      this._remove_manual_flip();
    }

    /* Timeout needed due to unknown race condition causing 'Auto Rotate'
    *  Quick Toggle to be undefined for a brief moment.
    */
    this._timeoutId = setTimeout(() => {
      this._set_hide_lock_rotate(this._settings.get_boolean('hide-lock-rotate'));
    }, 1000);
  }

  toggle_rotation_lock() {
    if (this._state) {
      this._a11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, this._originala11yKeyboardSetting);
      this._originala11yKeyboardSetting = null;
      this._sensor_proxy.disable();
      this._state = false;
    } else {
      this._originala11yKeyboardSetting = this._a11yApplicationsSettings.get_boolean(SHOW_KEYBOARD);
      this._sensor_proxy.enable();
      this._state = true;
    }
  }

  _set_hide_lock_rotate(state) {
    const autoRotateIndicator = Main.panel.statusArea.quickSettings._autoRotate;

    if (state) {
      Main.panel.statusArea.quickSettings._indicators.remove_child(autoRotateIndicator);
      Main.panel.statusArea.quickSettings.menu._grid.remove_child(autoRotateIndicator.quickSettingsItems[0]);
    } else {
      Main.panel.statusArea.quickSettings._indicators.add_child(autoRotateIndicator);
      Main.panel.statusArea.quickSettings._addItemsBefore(
        autoRotateIndicator.quickSettingsItems,
        Main.panel.statusArea.quickSettings._rfkill.quickSettingsItems[0]
      );
    }
  }

  _add_manual_flip() {
    this.flipIndicator = new ManualOrientationIndicator(this);
    Main.panel.statusArea.quickSettings.addExternalIndicator(this.flipIndicator);
  }

  _remove_manual_flip() {
    if (this.flipIndicator !== null) {
      this.flipIndicator.destroy();
      this.flipIndicator = null;
    }
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
    if (this._state === locked) {
      this.toggle();
    }
  }

  _handle_osk(target) {
    const landscapeOsk = this._settings.get_boolean('landscape-osk');
    const portraitRightOsk = this._settings.get_boolean('portrait-right-osk');
    const portraitLeftOsk = this._settings.get_boolean('portrait-left-osk');
    const landscapeFlippedOsk = this._settings.get_boolean('landscape-flipped-osk');
    switch (target) {
      case 0:
        this._a11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, landscapeOsk);
        break;
      case 1:
        this._a11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, portraitLeftOsk);
        break;
      case 2:
        this._a11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, landscapeFlippedOsk);
        break;
      case 3:
        this._a11yApplicationsSettings.set_boolean(SHOW_KEYBOARD, portraitRightOsk);
        break;
    }
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
      console.log(`sensor=${Orientation[orientation]}`);
      console.log(`offset=${offset}`);
      console.log(`target=${target}`);
    }
    Rotator.rotate_to(target);
    this._handle_osk(target);
  }

  disable() {
    /*
        Comment for unlock-dialog usage:
        The unlock-dialog session-mode is useful for this extension as it allows
        the user to rotate their screen or lock rotation after their device may
        have auto-locked. This provides the ability to log back in regardless of 
        the orientation of the device in tablet mode.
    */
    this._settings = null;
    clearTimeout(this._timeoutId);
    this._timeoutId = null;
    this._remove_manual_flip();
    this._sensor_proxy.destroy();
    this._orientation_settings = null;
    this._a11yApplicationsSettings = null;
    this._restore_system_actions();
  }
}

