/* prefs.js
* Copyright (C) 2022  kosmospredanie, shyzus, Shinigaminai
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

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init () {}

function buildPrefsWidget () {
  this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.screen-rotate');

    // Create a parent widget that we'll return from this function
  const prefsWidget = new Gtk.Grid({
    margin_top: 10,
    margin_bottom: 10,
    margin_start: 10,
    margin_end: 10,
    column_spacing: 12,
    row_spacing: 12,
    visible: true,
  });

  // Add a simple title and add it to the prefsWidget
  const title = new Gtk.Label({
    label: `<b>${Me.metadata.name} Preferences</b>`,
    halign: Gtk.Align.START,
    use_markup: true,
    visible: true,
  });
  prefsWidget.attach(title, 0, 0, 2, 1);

  // Create a label & switch for `flip-rotation-direction-horizontal`
  const flipRotationHorizontalLabel = new Gtk.Label({
    label: 'Invert horizontal rotation:',
    halign: Gtk.Align.START,
    visible: true,
  });
  // Create a label & switch for `flip-rotation-direction-vertical`
  const flipRotationVerticalLabel = new Gtk.Label({
    label: 'Invert vertical rotation:',
    halign: Gtk.Align.START,
    visible: true,
  });
  // Create a label & switch for `flip-orientation`
  const flipOrientationLabel = new Gtk.Label({
    label: 'Flip orientation(default=Landscape):',
    halign: Gtk.Align.START,
    visible: true,
  });

  prefsWidget.attach(flipRotationHorizontalLabel, 0, 1, 1, 1);
  prefsWidget.attach(flipRotationVerticalLabel, 0, 2, 1, 1);
  prefsWidget.attach(flipOrientationLabel, 0, 3, 1, 1);

  this.flipHorizontalRotationSwitch = new Gtk.Switch({
    halign: Gtk.Align.END,
    visible: true,
  });

  this.flipVerticalRotationSwitch = new Gtk.Switch({
    halign: Gtk.Align.END,
    visible: true,
  });

  this.flipOrientationSwitch = new Gtk.Switch({
    halign: Gtk.Align.END,
    visible: true,
  });

  prefsWidget.attach(this.flipHorizontalRotationSwitch, 1, 1, 1, 1);
  prefsWidget.attach(this.flipVerticalRotationSwitch, 1, 2, 1, 1);
  prefsWidget.attach(this.flipOrientationSwitch, 1, 3, 1, 1);


  // Bind the switch to the `flip-horizontal-rotation-direction` key
  this.settings.bind('flip-horizontal-rotation-direction', this.flipHorizontalRotationSwitch,
    'active', Gio.SettingsBindFlags.DEFAULT,
  );

  // Bind the switch to the `flip-horizontal-rotation-direction` key
  this.settings.bind('flip-vertical-rotation-direction', this.flipVerticalRotationSwitch,
    'active', Gio.SettingsBindFlags.DEFAULT,
  );

  // Bind the switch to the `flip-orientation` key
  this.settings.bind('flip-orientation', this.flipOrientationSwitch,
    'active', Gio.SettingsBindFlags.DEFAULT,
  );

  // Return our widget which will be added to the window
  return prefsWidget;
}
