/* displayConfigState.js
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

import GLib from 'gi://GLib';

import { Monitor } from './monitor.js'
import { LogicalMonitor } from './logicalMonitor.js'

export class DisplayConfigState {
  constructor(result) {
    let unpacked = result.unpack();

    this.serial = unpacked[0].unpack();

    this.monitors = [];
    let monitors = unpacked[1].unpack();
    monitors.forEach(monitor_packed => {
      let monitor = new Monitor(monitor_packed);
      this.monitors.push(monitor);
    });

    this.logical_monitors = [];
    let logical_monitors = unpacked[2].unpack();
    logical_monitors.forEach(lmonitor_packed => {
      let lmonitor = new LogicalMonitor(lmonitor_packed);
      this.logical_monitors.push(lmonitor);
    });

    this.properties = unpacked[3].unpack();
    for (let key in this.properties) {
      this.properties[key] = this.properties[key].unpack().unpack();
    }
  }

  get builtin_monitor() {
    for (let monitor of this.monitors) {
      if (monitor.is_builtin) {
        return monitor;
      }
    }
    return null;
  }

  get_monitor(connector) {
    for (let monitor of this.monitors) {
      if (monitor.connector === connector) {
        return monitor;
      }
    }
    return null;
  }

  get_logical_monitor_for(connector) {
    for (let log_monitor of this.logical_monitors) {
      for (let lm_monitor of log_monitor.monitors) {
        if (connector === lm_monitor[0]) {
          return log_monitor;
        }
      }
    }
    return null;
  }

  pack_to_apply(method) {
    let packing = [this.serial, method, [], {}];
    let logical_monitors = packing[2];
    let properties = packing[3];

    this.logical_monitors.forEach(lmonitor => {
      let lmonitor_pack = [
        lmonitor.x,
        lmonitor.y,
        lmonitor.scale,
        lmonitor.transform,
        lmonitor.primary,
        []
      ];
      let monitors = lmonitor_pack[5];
      for (let log_monitor of lmonitor.monitors) {
        let connector = log_monitor[0];
        let monitor = this.get_monitor(connector);
        monitors.push([
          connector,
          monitor.current_mode_id,
          {
            'enable_underscanning': new GLib.Variant('b', monitor.is_underscanning)
          }
        ]);
      }
      logical_monitors.push(lmonitor_pack);
    });

    if ('layout-mode' in this.properties) {
      properties['layout-mode'] = new GLib.Variant('b', this.properties['layout-mode']);
    }

    return new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', packing);
  }
}
