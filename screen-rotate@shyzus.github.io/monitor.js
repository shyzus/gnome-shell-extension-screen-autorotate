/* monitor.js
*
* Copyright (C) 2024  kosmospredanie, efosmark, shyzus
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

export class Monitor {
  constructor(variant) {
    let unpacked = variant.unpack();
    this.connector = unpacked[0].unpack()[0].unpack();

    let modes = unpacked[1].unpack();
    for (let mode_idx in modes) {
      let mode = modes[mode_idx].unpack();
      let id = mode[0].unpack();
      let mode_props = mode[6].unpack();
      if ('is-current' in mode_props) {
        let is_current = mode_props['is-current'].unpack().get_boolean();
        if (is_current) {
          this.current_mode_id = id;
          break;
        }
      }
    }

    let props = unpacked[2].unpack();
    if ('is-underscanning' in props) {
      this.is_underscanning = props['is-underscanning'].unpack().get_boolean();
    } else {
      this.is_underscanning = false;
    }
    if ('is-builtin' in props) {
      this.is_builtin = props['is-builtin'].unpack().get_boolean();
    } else {
      this.is_builtin = false;
    }
  }
}
