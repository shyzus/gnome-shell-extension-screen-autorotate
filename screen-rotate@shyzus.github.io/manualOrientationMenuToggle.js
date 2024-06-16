/* manualOrientationMenuToggle.js
* Copyright (C) 2024 shyzus
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

import GObject from 'gi://GObject';

import { QuickMenuToggle } from 'resource:///org/gnome/shell/ui/quickSettings.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export const ManualOrientationMenuToggle = GObject.registerClass(
class ManualOrientationMenuToggle extends QuickMenuToggle {
    constructor(ext) {
      super({
        title: 'Rotate',
        iconName: 'object-rotate-left-symbolic',
        menuEnabled: true,
        toggleMode: true,
      });

      this.menu.setHeader('object-rotate-left-symbolic', 'Screen Rotate');

      this._section = new PopupMenu.PopupMenuSection();
      this.menu.addMenuItem(this._section);

      this.landscapeItem = new PopupMenu.PopupMenuItem('Landscape', {
        reactive: true,
        can_focus: true,
      });

      this.portraitLeftItem = new PopupMenu.PopupMenuItem('Portrait Left', {
        reactive: true,
        can_focus: true,
      });

      this.landscapeFlipItem = new PopupMenu.PopupMenuItem('Landscape Flipped', {
        reactive: true,
        can_focus: true,
      });

      this.portraitRightItem = new PopupMenu.PopupMenuItem('Portrait Right', {
        reactive: true,
        can_focus: true,
      });

      this.landscapeItem.connect('activate', () => {
        this._onItemActivate(this.landscapeItem);
        ext.rotate_to('normal');
      });
      this.portraitLeftItem.connect('activate', () => {
        this._onItemActivate(this.portraitLeftItem);
        ext.rotate_to('left-up');
      });
      this.landscapeFlipItem.connect('activate', () => {
        this._onItemActivate(this.landscapeFlipItem);
        ext.rotate_to('bottom-up');
      });
      this.portraitRightItem.connect('activate', () => {
        this._onItemActivate(this.portraitRightItem);
        ext.rotate_to('right-up');
      });

      this._section.addMenuItem(this.landscapeItem);
      this._section.addMenuItem(this.portraitLeftItem);
      this._section.addMenuItem(this.landscapeFlipItem);
      this._section.addMenuItem(this.portraitRightItem);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      this.menu.addSettingsAction('Extension Settings',
            'com.mattjakeman.ExtensionManager.desktop');

      this.connect('clicked', () => {
        if (this.checked === true) {
            ext.rotate_to('right-up');
        } else {
            ext.rotate_to('normal');
        }
      });
    }

    _onItemActivate(item) {
      this.landscapeItem.setOrnament(PopupMenu.Ornament.HIDDEN);
      this.portraitLeftItem.setOrnament(PopupMenu.Ornament.HIDDEN);
      this.landscapeFlipItem.setOrnament(PopupMenu.Ornament.HIDDEN);
      this.portraitRightItem.setOrnament(PopupMenu.Ornament.HIDDEN);

      item.setOrnament(PopupMenu.Ornament.CHECK);
    }
});

