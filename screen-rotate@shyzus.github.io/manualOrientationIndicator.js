/* manualOrientationIndicator.js
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

import { SystemIndicator } from 'resource:///org/gnome/shell/ui/quickSettings.js';

import { ManualOrientationMenuToggle } from './manualOrientationMenuToggle.js';

export const ManualOrientationIndicator = GObject.registerClass(
class ManualOrientationIndicator extends SystemIndicator {
    constructor(ext) {
        super();
        this.toggle = new ManualOrientationMenuToggle(ext);
        this.quickSettingsItems.push(this.toggle);
    }

    destroy() {
      this.quickSettingsItems.pop(this.toggle);
      this.toggle.destroy();
    }
});
