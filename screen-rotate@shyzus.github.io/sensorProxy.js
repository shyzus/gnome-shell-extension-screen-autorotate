/* sensorProxy.js
* Copyright (C) 2025  kosmospredanie, shyzus
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
    console.log("Constructing sensors proxy.");
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
    console.log("Sensor proxy constructed.");
  }

  destroy() {
    console.log("Destroying sensor proxy.");
    Gio.bus_unwatch_name(this._watcher_id);
    if (this._enabled) this.disable();
    this._proxy = null;
    console.log("Sensor proxy destroyed.");
  }

  enable() {
    console.log("Enabling sensor proxy.");
    this._enabled = true;
    if (this._proxy === null) return;
    this._proxy.call('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, 100, null, null);
    console.log("Sensor proxy enabled.");
  }

  disable() {
    console.log("Disabling sensor proxy.");
    this._enabled = false;
    if (this._proxy === null) return;
    this._proxy.call('ReleaseAccelerometer', null, Gio.DBusCallFlags.NONE, 100, null, null);
    console.log("Sensor proxy disabled.");
  }

  appeared(_connection, _name, _name_owner) {
    console.log("Connecting to sensor proxy bus.");
    this._proxy = Gio.DBusProxy.new_for_bus_sync(
      Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
      'net.hadess.SensorProxy', '/net/hadess/SensorProxy', 'net.hadess.SensorProxy',
      null);
    this._proxy.connect('g-properties-changed', this.properties_changed.bind(this));
    console.log("Sensor proxy connected to bus.");
    if (this._enabled) {
      console.log("Claiming accelerometor.");
      this._proxy.call('ClaimAccelerometer', null, Gio.DBusCallFlags.NONE, 100, null, null);
      console.log("Accelerometer claimed.");
    }
  }

  vanished(_connection, _name) {
    console.log("Cleaning up disconnected proxy.");
    this._proxy = null;
    console.log("Disconnected proxy cleaned.");
  }

  get_accelerometer_orientation() {
    console.log("Getting accelerometer orientation.");
    let orientation = undefined; 
    if (this._enabled) {
      let variant = this._proxy.get_cached_property('AccelerometerOrientation');
      orientation = variant.unpack();
      variant.unref();
      return orientation;
    }

    console.log("Fetched accelerometer orientation: %s", orientation);

    return orientation;
  }

  properties_changed(proxy, changed, _invalidated) {
    if (!this._enabled) return;
    console.log("Properties change detected.");
    let properties = changed.deep_unpack();
    for (let [name, value] of Object.entries(properties)) {
      if (name !== 'AccelerometerOrientation') continue;
      let target = value.unpack();
      console.log("Accelerometer orientation has changed: %o", target);
      this._rotate_cb(target);
    }
  }
}
