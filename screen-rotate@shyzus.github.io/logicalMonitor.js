/* logicalMonitor.js
*
* Copyright (C) 2024  kosmospredanie, shyzus
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

export class LogicalMonitor {
  constructor(variant) {
    let unpacked = variant.unpack();
    this.x = unpacked[0].unpack();
    this.y = unpacked[1].unpack();
    this.scale = unpacked[2].unpack();
    this.transform = unpacked[3].unpack();
    this.primary = unpacked[4].unpack();
    // [ [connector, vendor, product, serial]* ]
    this.monitors = unpacked[5].deep_unpack();
    this.properties = unpacked[6].unpack();
    for (let key in this.properties) {
      this.properties[key] = this.properties[key].unpack().unpack();
    }
  }
}
