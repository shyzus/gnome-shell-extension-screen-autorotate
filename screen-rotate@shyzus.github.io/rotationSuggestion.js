/* rotationSuggestion.js
* Copyright (C) 2026 dtrunk90
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
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const AUTO_HIDE_TIMEOUT_MS = 5000;
const BUTTON_SIZE = 56;
const BUTTON_MARGIN_X = 48;
const BUTTON_MARGIN_Y = 48;
const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';
const COLOR_SCHEME_KEY = 'color-scheme';

// Center of the button in the landscape-relative frame, for the requested
// corner (e.g. 'bottom-left'). This is the anchor `_reposition()` then
// rotates into whatever transform is actually applied.
function _landscape_corner_center(position, landscape_width, landscape_height) {
  const [v_side, h_side] = position.split('-');
  const cx = h_side === 'left'
    ? BUTTON_MARGIN_X + BUTTON_SIZE / 2
    : landscape_width - BUTTON_MARGIN_X - BUTTON_SIZE / 2;
  const cy = v_side === 'top'
    ? BUTTON_MARGIN_Y + BUTTON_SIZE / 2
    : landscape_height - BUTTON_MARGIN_Y - BUTTON_SIZE / 2;
  return [cx, cy];
}

// Some panels (e.g. handheld gaming PCs) are mounted natively in portrait and
// rely on a Meta.MonitorTransform to present landscape as the "normal" grip.
// To keep the button fixed to the same physical corner of the device rather
// than the same corner of whatever image is currently being displayed, we
// need to know which transform currently yields the landscape shape, then
// rotate our desired landscape-relative position into the active transform.
// This is derived from live monitor geometry rather than hardcoded, since it
// differs per device.
function _landscape_reference_transform(monitor, transform) {
  const current_parity = transform % 2;
  const is_landscape_shaped = monitor.width >= monitor.height;
  return is_landscape_shaped ? current_parity : 1 - current_parity;
}

// Transient button shown when the orientation sensor detects a change while
// rotation is locked, mirroring Android's "Rotate screen" suggestion pill.
export class RotationSuggestion {
  constructor(onActivate, ext) {
    this._on_activate = onActivate;
    this._ext = ext;
    this._button = null;
    this._hide_timeout_id = null;
    this._pending_target = null;
    this._current_transform = 0;
    this._position = null;
    this._monitors_changed_id = null;
    this._interface_settings = new Gio.Settings({ schema_id: INTERFACE_SCHEMA });
    this._color_scheme_changed_id = this._interface_settings.connect(
      `changed::${COLOR_SCHEME_KEY}`, this._update_color_scheme.bind(this));
  }

  // `position` is one of 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  // (never 'disabled' — the caller is expected to call hide() instead).
  show(target, appliedTransform, position) {
    this._pending_target = target;
    this._current_transform = appliedTransform;
    this._position = position;

    if (this._button === null) {
      this._build();
    }

    this._reposition();
    this._button.show();
    this._reset_hide_timeout();
  }

  hide() {
    this._pending_target = null;
    this._clear_hide_timeout();
    if (this._button !== null) {
      this._button.hide();
    }
  }

  _build() {
    const _ = this._ext.gettext.bind(this._ext);

    this._button = new St.Button({
      style_class: 'rotation-suggestion-button',
      child: new St.Icon({
        icon_name: 'object-rotate-left-symbolic',
        icon_size: 24,
      }),
      accessible_name: _('Rotate screen'),
      reactive: true,
      can_focus: true,
      track_hover: true,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    });

    this._button.connect('clicked', () => {
      const target = this._pending_target;
      this.hide();
      if (target !== null) {
        this._on_activate(target);
      }
    });

    this._button.connect('enter-event', () => this._clear_hide_timeout());
    this._button.connect('leave-event', () => this._reset_hide_timeout());
    this._button.connect('key-focus-in', () => this._clear_hide_timeout());
    this._button.connect('key-focus-out', () => this._reset_hide_timeout());

    this._button.set_pivot_point(0.5, 0.5);

    Main.layoutManager.addChrome(this._button, {});
    this._monitors_changed_id = Main.layoutManager.connect('monitors-changed', this._reposition.bind(this));
    this._update_color_scheme();
  }

  _update_color_scheme() {
    if (this._button === null) return;
    const dark = this._interface_settings.get_string(COLOR_SCHEME_KEY) !== 'prefer-light';
    this._button.remove_style_class_name(dark ? 'light' : 'dark');
    this._button.add_style_class_name(dark ? 'dark' : 'light');
  }

  _reposition() {
    if (this._button === null) return;
    const monitor = Main.layoutManager.primaryMonitor;
    if (!monitor) return;

    const reference = _landscape_reference_transform(monitor, this._current_transform);
    const is_landscape_shaped = monitor.width >= monitor.height;
    const landscape_width = is_landscape_shaped ? monitor.width : monitor.height;
    const landscape_height = is_landscape_shaped ? monitor.height : monitor.width;

    // Center of the button, anchored to the configured corner of the
    // landscape orientation, then rotated one quarter-turn at a time into
    // whatever transform is currently applied so it lands on the same
    // physical corner.
    let [cx, cy] = _landscape_corner_center(this._position, landscape_width, landscape_height);
    let w = landscape_width;
    let h = landscape_height;

    const steps = ((this._current_transform - reference) % 4 + 4) % 4;
    for (let i = 0; i < steps; i++) {
      [cx, cy, w, h] = [h - cy, cx, h, w];
    }

    this._button.set_position(
      Math.round(monitor.x + cx - BUTTON_SIZE / 2),
      Math.round(monitor.y + cy - BUTTON_SIZE / 2)
    );

    // Keep the button's contents (arrow icon) rotated in lockstep with its
    // position, so it always reads as if drawn for the landscape orientation,
    // rotated by the same number of quarter-turns used above. Same direction
    // by construction: if that direction is ever flipped for the portrait
    // case, this stays self-consistent with the position fix.
    this._button.rotation_angle_z = steps * 90;
  }

  _reset_hide_timeout() {
    this._clear_hide_timeout();
    this._hide_timeout_id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, AUTO_HIDE_TIMEOUT_MS, () => {
      this._hide_timeout_id = null;
      this.hide();
      return GLib.SOURCE_REMOVE;
    });
  }

  _clear_hide_timeout() {
    if (this._hide_timeout_id !== null) {
      GLib.source_remove(this._hide_timeout_id);
      this._hide_timeout_id = null;
    }
  }

  destroy() {
    this._clear_hide_timeout();
    if (this._monitors_changed_id !== null) {
      Main.layoutManager.disconnect(this._monitors_changed_id);
      this._monitors_changed_id = null;
    }
    if (this._color_scheme_changed_id !== null) {
      this._interface_settings.disconnect(this._color_scheme_changed_id);
      this._color_scheme_changed_id = null;
    }
    this._interface_settings = null;
    if (this._button !== null) {
      Main.layoutManager.removeChrome(this._button);
      this._button.destroy();
      this._button = null;
    }
    this._pending_target = null;
    this._ext = null;
  }
}