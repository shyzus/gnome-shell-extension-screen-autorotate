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

const { GObject, Gtk, Gio, Adw } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() { }

function fillPreferencesWindow(window) {
  const settings = ExtensionUtils.getSettings();

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
    active: settings.get_boolean('invert-horizontal-rotation-direction'),
    valign: Gtk.Align.CENTER,
  });

  const invertVerticalRotationSwitch = new Gtk.Switch({
    active: settings.get_boolean('invert-vertical-rotation-direction'),
    valign: Gtk.Align.CENTER,
  });

  const flipOrientationSwitch = new Gtk.Switch({
    active: settings.get_boolean('flip-orientation'),
    valign: Gtk.Align.CENTER,
  });

  const setOffsetSpinButton = Gtk.SpinButton.new_with_range(-3, 3, 1);
  setOffsetSpinButton.value = settings.get_int('orientation-offset');

  const toggleLoggingSwitch = new Gtk.Switch({
    active: settings.get_boolean('debug-logging'),
    valign: Gtk.Align.CENTER
  });

  settings.bind('invert-horizontal-rotation-direction',
    invertHorizontalRotationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  settings.bind('invert-vertical-rotation-direction',
    invertVerticalRotationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  settings.bind('flip-orientation',
    flipOrientationSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  settings.bind('orientation-offset',
    setOffsetSpinButton, 'value', Gio.SettingsBindFlags.DEFAULT);

  settings.bind('debug-logging',
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

  window._settings = settings;

  // this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.screen-rotate');

  //   // Create a parent widget that we'll return from this function
  // const prefsWidget = new Gtk.Grid({
  //   margin_top: 10,
  //   margin_bottom: 10,
  //   margin_start: 10,
  //   margin_end: 10,
  //   column_spacing: 12,
  //   row_spacing: 12,
  //   visible: true,
  // });

  // // Add a simple title and add it to the prefsWidget
  // const title = new Gtk.Label({
  //   label: `<b>${Me.metadata.name} Preferences</b>`,
  //   halign: Gtk.Align.START,
  //   use_markup: true,
  //   visible: true,
  // });
  // prefsWidget.attach(title, 0, 0, 2, 1);

  // // Create a label & switch for `flip-rotation-direction-horizontal`
  // const flipRotationHorizontalLabel = new Gtk.Label({
  //   label: 'Invert horizontal rotation:',
  //   halign: Gtk.Align.START,
  //   visible: true,
  // });
  // // Create a label & switch for `flip-rotation-direction-vertical`
  // const flipRotationVerticalLabel = new Gtk.Label({
  //   label: 'Invert vertical rotation:',
  //   halign: Gtk.Align.START,
  //   visible: true,
  // });
  // // Create a label & switch for `flip-orientation`
  // const flipOrientationLabel = new Gtk.Label({
  //   label: 'Flip orientation(default=Landscape):',
  //   halign: Gtk.Align.START,
  //   visible: true,
  // });

  // const portraitDisplayFlipLabel = new Gtk.Label({
  //   label: 'Mirrored Portrait Display (ex: GPD Pocket 3):',
  //   halign: Gtk.Align.START,
  //   visible: true,
  // });

  // prefsWidget.attach(flipRotationHorizontalLabel, 0, 1, 1, 1);
  // prefsWidget.attach(flipRotationVerticalLabel, 0, 2, 1, 1);
  // prefsWidget.attach(flipOrientationLabel, 0, 3, 1, 1);
  // prefsWidget.attach(portraitDisplayFlipLabel, 0, 4, 1, 1);

  // this.flipHorizontalRotationSwitch = new Gtk.Switch({
  //   halign: Gtk.Align.END,
  //   visible: true,
  // });

  // this.flipVerticalRotationSwitch = new Gtk.Switch({
  //   halign: Gtk.Align.END,
  //   visible: true,
  // });

  // this.flipOrientationSwitch = new Gtk.Switch({
  //   halign: Gtk.Align.END,
  //   visible: true,
  // });

  // this.portraitDisplayFlipSwitch = new Gtk.Switch({
  //   halign: Gtk.Align.END,
  //   visible: true,
  // });

  // prefsWidget.attach(this.flipHorizontalRotationSwitch, 1, 1, 1, 1);
  // prefsWidget.attach(this.flipVerticalRotationSwitch, 1, 2, 1, 1);
  // prefsWidget.attach(this.flipOrientationSwitch, 1, 3, 1, 1);
  // prefsWidget.attach(this.portraitDisplayFlipSwitch, 1, 4, 1, 1);

  // // Bind the switch to the `flip-horizontal-rotation-direction` key
  // this.settings.bind('flip-horizontal-rotation-direction', this.flipHorizontalRotationSwitch,
  //   'active', Gio.SettingsBindFlags.DEFAULT,
  // );

  // // Bind the switch to the `flip-horizontal-rotation-direction` key
  // this.settings.bind('flip-vertical-rotation-direction', this.flipVerticalRotationSwitch,
  //   'active', Gio.SettingsBindFlags.DEFAULT,
  // );

  // // Bind the switch to the `flip-orientation` key
  // this.settings.bind('flip-orientation', this.flipOrientationSwitch,
  //   'active', Gio.SettingsBindFlags.DEFAULT,
  // );

  // this.settings.bind('portrait-display-flipped', this.portraitDisplayFlipSwitch, 
  //   'active', Gio.SettingsBindFlags.DEFAULT,
  // );

  // // Return our widget which will be added to the window
  // return prefsWidget;
}
