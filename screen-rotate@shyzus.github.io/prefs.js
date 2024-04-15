/* prefs.js
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

    const shellMenuGroup = new Adw.PreferencesGroup();
    shellMenuGroup.set_title('GNOME Shell Menu Settings');
    page.add(shellMenuGroup);

    const oskSettingsGroup = new Adw.PreferencesGroup();
    oskSettingsGroup.set_title('On-Screen-Keyboard Settings');
    page.add(oskSettingsGroup);

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
      subtitle: 'Valid offset range: 0 to 3. Default is 0\nExperiment with this in case\
 orientation is incorrect due to the display being mounted in a non-landscape orientation\
 e.g PineTab2 or GPD Pocket 3'
    });

    orientationGroup.add(setOffsetRow);

    const enableManualFlipRow = new Adw.ActionRow({
      title: 'Enable manual flip',
      subtitle: 'Enable a toggle in the GNOME Shell System Menu to manually flip between landscape and portrait.'
    });
    shellMenuGroup.add(enableManualFlipRow);

    const hideLockRotateRow = new Adw.ActionRow({
      title: 'Hide the "Auto Rotate" quick toggle'
    });
    shellMenuGroup.add(hideLockRotateRow);

    const landscapeOskRow = new Adw.ActionRow({
      title: 'Show OSK in landscape orientation'
    });
    oskSettingsGroup.add(landscapeOskRow);

    const portraitRightOskRow = new Adw.ActionRow({
      title: 'Show OSK in portrait (right) orientation'
    });
    oskSettingsGroup.add(portraitRightOskRow);

    const portraitLeftOskRow = new Adw.ActionRow({
      title: 'Show OSK in portrait (left) orientation'
    });
    oskSettingsGroup.add(portraitLeftOskRow);

    const landscapeFlippedOskRow = new Adw.ActionRow({
      title: 'Show OSK in landscape (flipped) orientation'
    });
    oskSettingsGroup.add(landscapeFlippedOskRow);

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

    const setOffsetSpinButton = Gtk.SpinButton.new_with_range(0, 3, 1);
    setOffsetSpinButton.value = window._settings.get_int('orientation-offset');

    const manualFlipSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('manual-flip'),
      valign: Gtk.Align.CENTER,
    });

    const hideLockRotateSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('hide-lock-rotate'),
      valign: Gtk.Align.CENTER,
    });

    const landscapeOskCheckButton = new Gtk.CheckButton({
      active: window._settings.get_boolean('landscape-osk'),
      valign: Gtk.Align.CENTER
    });

    const portraitRightOskCheckButton = new Gtk.CheckButton({
      active: window._settings.get_boolean('portrait-right-osk'),
      valign: Gtk.Align.CENTER
    });

    const portraitLeftOskCheckButton = new Gtk.CheckButton({
      active: window._settings.get_boolean('portrait-left-osk'),
      valign: Gtk.Align.CENTER
    });

    const landscapeFlippedOskCheckButton = new Gtk.CheckButton({
      active: window._settings.get_boolean('landscape-flipped-osk'),
      valign: Gtk.Align.CENTER
    });

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

    window._settings.bind('manual-flip',
      manualFlipSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

     window._settings.bind('hide-lock-rotate',
      hideLockRotateSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('landscape-osk',
      landscapeOskCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('portrait-right-osk',
      portraitRightOskCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('portrait-left-osk',
      portraitLeftOskCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);

    window._settings.bind('landscape-flipped-osk',
      landscapeFlippedOskCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);

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

    enableManualFlipRow.add_suffix(manualFlipSwitch);
    enableManualFlipRow.activatable_widget = manualFlipSwitch;

    hideLockRotateRow.add_suffix(hideLockRotateSwitch);
    hideLockRotateRow.activatable_widget = hideLockRotateSwitch;

    landscapeOskRow.add_suffix(landscapeOskCheckButton);
    landscapeOskRow.activatable_widget = landscapeOskCheckButton;

    portraitRightOskRow.add_suffix(portraitRightOskCheckButton);
    portraitRightOskRow.activatable_widget = portraitRightOskCheckButton;

    portraitLeftOskRow.add_suffix(portraitLeftOskCheckButton);
    portraitLeftOskRow.activatable_widget = portraitLeftOskCheckButton;

    landscapeFlippedOskRow.add_suffix(landscapeFlippedOskCheckButton);
    landscapeFlippedOskRow.activatable_widget = landscapeFlippedOskCheckButton;

    toggleLoggingRow.add_suffix(toggleLoggingSwitch);
    toggleLoggingRow.activatable_widget = toggleLoggingSwitch;
  }
}
