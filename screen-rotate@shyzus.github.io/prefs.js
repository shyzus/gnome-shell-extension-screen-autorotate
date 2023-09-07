/* prefs.js
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

import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MyExtensionPreferences extends ExtensionPreferences {

  fillPreferencesWindow(window) {
    window._settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    window.add(page);

    const orientationGroup = new Adw.PreferencesGroup();
    orientationGroup.set_title('Orientation Settings')
    page.add(orientationGroup);

    const debugGroup = new Adw.PreferencesGroup();
    debugGroup.set_title('Debug Settings');
    page.add(debugGroup);

    const invertHorizontalRow = new Adw.ActionRow({
      title: 'Invert horizontal rotation'
    });
    orientationGroup.add(invertHorizontalRow);

    const invertVerticalRow = new Adw.ActionRow({
      title: 'Invert vertical rotation'
    });
    orientationGroup.add(invertVerticalRow);

    const flipOrientationRow = new Adw.ActionRow({
      title: 'Flip orientation',
      subtitle: 'e.g: Landscape to Portrait. Default is Landscape'
    });
    orientationGroup.add(flipOrientationRow);

    const setOffsetRow = new Adw.ActionRow({
      title: 'Set orientation offset',
      subtitle: 'Valid offset range: -3 to 3. Default is 0\nExperiment with this in case\
 orientation is incorrect due to the display being mounted in a non-landscape orientation\
 e.g PineTab2 or GPD Pocket 3'
    });

    orientationGroup.add(setOffsetRow);

    const toggleLoggingRow = new Adw.ActionRow({
      title: 'Enable debug logging',
      subtitle: 'Use "journalctl /usr/bin/gnome-shell -f" to see log output.'
    });
    debugGroup.add(toggleLoggingRow);

    const invertHorizontalRotationSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('invert-horizontal-rotation-direction'),
      valign: Gtk.Align.CENTER,
    });

    const invertVerticalRotationSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('invert-vertical-rotation-direction'),
      valign: Gtk.Align.CENTER,
    });

    const flipOrientationSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('flip-orientation'),
      valign: Gtk.Align.CENTER,
    });

    const setOffsetSpinButton = Gtk.SpinButton.new_with_range(-3, 3, 1);
    setOffsetSpinButton.value = window._settings.get_int('orientation-offset');

    const toggleLoggingSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('debug-logging'),
      valign: Gtk.Align.CENTER
    });

    window._settings.bind('invert-horizontal-rotation-direction',
      invertHorizontalRotationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('invert-vertical-rotation-direction',
      invertVerticalRotationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('flip-orientation',
      flipOrientationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('orientation-offset',
      setOffsetSpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('debug-logging',
      toggleLoggingSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

    invertHorizontalRow.add_suffix(invertHorizontalRotationSwitch);
    invertHorizontalRow.activatable_widget = invertHorizontalRotationSwitch;

    invertVerticalRow.add_suffix(invertVerticalRotationSwitch);
    invertVerticalRow.activatable_widget = invertVerticalRotationSwitch;

    flipOrientationRow.add_suffix(flipOrientationSwitch);
    flipOrientationRow.activatable_widget = flipOrientationSwitch;

    setOffsetRow.add_suffix(setOffsetSpinButton);
    setOffsetRow.activatable_widget = setOffsetSpinButton;

    toggleLoggingRow.add_suffix(toggleLoggingSwitch);
    toggleLoggingRow.activatable_widget = toggleLoggingSwitch;
  }
}