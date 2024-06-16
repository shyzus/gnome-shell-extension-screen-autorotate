/* sensorProxy.js
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

import Gio from 'gi://Gio';

export class SensorProxy {
  constructor(rotate_cb) {
    this._rotate_cb = rotate_cb;
    this._proxy = null;
    this._enabled = false;
    this._watcher_id = Gio.bus_watch_name(
      Gio.BusType.SYSTEM,
      'net.hadess.SensorProxy',
      Gio.BusNameWatcherFlags.NONE,
      this.appeared.bind(this),
      this.vanished.bind(this)
    );
  }

  destroy() {
    Gio.bus_unwatch_name(this._watcher_id);
    if (this._enabled) this.disable();
    this._proxy = null;
  }

  enable() {
    this._enabled = true;
    if (this._proxy === null) return;
    this._proxy.call_sync('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
  }

  disable() {
    this._enabled = false;
    if (this._proxy === null) return;
    this._proxy.call_sync('ReleaseAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
  }

  appeared(_connection, _name, _name_owner) {
    this._proxy = Gio.DBusProxy.new_for_bus_sync(
      Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
      'net.hadess.SensorProxy', '/net/hadess/SensorProxy', 'net.hadess.SensorProxy',
      null);
    this._proxy.connect('g-properties-changed', this.properties_changed.bind(this));
    if (this._enabled) {
      this._proxy.call_sync('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, -1, null);
    }
  }

  vanished(_connection, _name) {
    this._proxy = null;
  }

  properties_changed(proxy, changed, _invalidated) {
    if (!this._enabled) return;
    let properties = changed.deep_unpack();
    for (let [name, value] of Object.entries(properties)) {
      if (name !== 'AccelerometerOrientation') continue;
      let target = value.unpack();
      this._rotate_cb(target);
    }
  }
}
