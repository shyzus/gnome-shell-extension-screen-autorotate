# Screen Rotate

A GNOME extension to enable screen rotation regardless of touch mode.

This extension uses Mutter's D-Bus API, so it works on both X11 and Wayland.

## License
Original project was licensed under GPL V2. With the inactivity of the current 
maintainer kosmospredanie. This fork has been upgraded to GPL V3.

Copyright (C) 2024  kosmospredanie, shyzus, Shinigaminai, efosmark, BlackDuck888

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
    
## History
This is a fork of an [existing repository](https://github.com/kosmospredanie/gnome-shell-extension-screen-autorotate) owned by [@kosmospredanie](https://github.com/kosmospredanie). Due to a long period of inactivity this fork was created see this [issue](https://github.com/kosmospredanie/gnome-shell-extension-screen-autorotate/issues/10) for more details.

## Requirements

- iio-sensor-proxy

## Install

### From extensions.gnome.org

[GNOME Shell Extensions](https://extensions.gnome.org/extension/5389/screen-rotate/)

### From git

```
git clone https://github.com/shyzus/gnome-shell-extension-screen-autorotate.git
cd gnome-shell-extension-screen-autorotate
cp -r screen-rotate@shyzus.github.io ~/.local/share/gnome-shell/extensions
```
