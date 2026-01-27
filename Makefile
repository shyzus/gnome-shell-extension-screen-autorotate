.PHONY: all clean extension potfile install prefs enable disable reset info show updatepo newpo zip-file help

GETTEXT_DOMAIN = gnome-shell-extension-screen-rotate
NAME = Screen Rotate
SETTINGS_SCHEMA = org.gnome.shell.extensions.screen-rotate
UUID = screen-rotate@shyzus.github.io
EXTENSION_DIR = screen-rotate@shyzus.github.io

# Files and directories to build into extension.
PACKAGE_FILES = \
	$(EXTENSION_DIR)/displayConfigState.js \
	$(EXTENSION_DIR)/extension.js \
	$(EXTENSION_DIR)/logicalMonitor.js \
	$(EXTENSION_DIR)/manualOrientationIndicator.js \
	$(EXTENSION_DIR)/manualOrientationMenuToggle.js \
	$(EXTENSION_DIR)/metadata.json \
	$(EXTENSION_DIR)/monitor.js \
	$(EXTENSION_DIR)/orientation.js \
	$(EXTENSION_DIR)/prefs.js \
	$(EXTENSION_DIR)/rotator.js \
	$(EXTENSION_DIR)/sensorProxy.js

# Directories to scan for .js files.
# `make potfile` uses xgettext to extract strings to build the .pot template.
I18N_DIRS = $(EXTENSION_DIR)/

# If VERSION is provided via CLI, suffix ZIP_NAME with _$(VERSION).
# Otherwise, inject git commit SHA (if available) into metadata.json.
COMMIT = $(if $(VERSION),,$(shell git rev-parse HEAD 2>/dev/null))
ZIP_NAME = $(UUID)$(if $(VERSION),_$(VERSION),)

ifeq ($(strip $(DESTDIR)),)
	INSTALLTYPE = local
	INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
else
	INSTALLTYPE = system
	SHARE_PREFIX = $(DESTDIR)/usr/share
	INSTALLBASE = $(SHARE_PREFIX)/gnome-shell/extensions
endif

define CLEAN_UP
@echo 'Cleaning up...'
@-rm -fR _build
@-rm -fR _po
@-rm -f ./$(EXTENSION_DIR)/schemas/gschemas.compiled
@-rm -f ./po/*.po~
@-rm -f ./po/*.mo
@echo "Done."
endef

all: extension

clean:
	$(CLEAN_UP)

extension: _compile-schemas _compile-translations

_compile-schemas: ./$(EXTENSION_DIR)/schemas/$(SETTINGS_SCHEMA).gschema.xml
	@command -v glib-compile-schemas >/dev/null 2>&1 || { echo "Error: glib-compile-schemas not found. Install 'glib2-devel' or 'libglib2.0-dev'."; exit 1; }
	@echo "Compiling $(SETTINGS_SCHEMA).gschema.xml..."
	@glib-compile-schemas --strict ./$(EXTENSION_DIR)/schemas/ || { echo "Error: glib-compile-schemas failed!."; exit 1; }
	@echo "Done."

# Prep .po files for compilation into .mo files.
# Omits untranslated messages, fuzzy messages (except the header entry), and obsolete messages from the output.
_buildpo:
	@command -v msgmerge >/dev/null 2>&1 || { echo "Error: msgmerge not found. Install 'gettext' package."; exit 1; }
	@-rm -fR ./_po
	@mkdir -p _po
	@echo "Updating po files..."
	@for PO_FILE in po/*.po; do \
		if [ -f "$$PO_FILE" ]; then \
			LANG=$$(basename "$$PO_FILE" .po); \
			msgmerge --for-msgfmt --no-location -q $$PO_FILE ./po/$(GETTEXT_DOMAIN).pot > _po/$$LANG.po; \
		fi; \
	done;
	@echo "Done."

_compile-translations: _buildpo
	@command -v msgfmt >/dev/null 2>&1 || { echo "Error: msgfmt not found. Install 'gettext' package."; exit 1; }
	@echo "Compiling translations..."
	@for PO_FILE in _po/*.po; do \
		if [ -f "$$PO_FILE" ]; then \
			LANG=$$(basename "$$PO_FILE" .po); \
			msgfmt -c "$$PO_FILE" -o "po/$$LANG.mo"; \
		fi; \
	done;
	@echo "Done."

potfile:
	@command -v xgettext >/dev/null 2>&1 || { echo "Error: xgettext not found. Install 'gettext' package."; exit 1; }
	@echo "Creating $(GETTEXT_DOMAIN).pot file..."
	@mkdir -p po
	@find $(I18N_DIRS) \( -name '*.js' -o -name '*.ui' \) | xargs \
	xgettext \
		--from-code=UTF-8 \
		--output=po/$(GETTEXT_DOMAIN).pot \
		--sort-by-file \
		--add-comments=TRANSLATORS \
		--package-name "$(NAME)"
	@echo "Done."

updatepo: potfile
	@command -v msgmerge >/dev/null 2>&1 || { echo "Error: msgmerge not found. Install 'gettext' package."; exit 1; }
	@echo "Updating po files..."
	@for PO_FILE in po/*.po; do \
		if [ -f "$$PO_FILE" ]; then \
			msgmerge -NU $$PO_FILE ./po/$(GETTEXT_DOMAIN).pot; \
		fi; \
	done;
	@echo "Done."
	$(CLEAN_UP)

# Create a new translation file for a language
newpo: potfile
	@if [ -z "$(LANG)" ]; then \
		echo "Error: LANG variable not set. Usage: make newpo LANG=ru"; \
		exit 1; \
	fi
	@command -v msginit >/dev/null 2>&1 || { echo "Error: msginit not found. Install 'gettext' package."; exit 1; }
	@echo "Creating new translation for $(LANG)..."
	@msginit --input=po/$(GETTEXT_DOMAIN).pot --output=po/$(LANG).po --locale=$(LANG)
	@echo "Done. Edit po/$(LANG).po to add translations."

install: _build
	@echo "Installing to $(INSTALLBASE)..."
	@rm -rf $(INSTALLBASE)/$(UUID)
	@mkdir -p $(INSTALLBASE)/$(UUID)
	@cp -r ./_build/* $(INSTALLBASE)/$(UUID)/
	@if [ "$(INSTALLTYPE)" = "system" ]; then \
		rm -r $(INSTALLBASE)/$(UUID)/schemas $(INSTALLBASE)/$(UUID)/locale; \
		mkdir -p $(SHARE_PREFIX)/glib-2.0/schemas $(SHARE_PREFIX)/locale; \
		cp -r ./$(EXTENSION_DIR)/schemas/*gschema.* $(SHARE_PREFIX)/glib-2.0/schemas; \
		cp -r ./_build/locale/* $(SHARE_PREFIX)/locale; \
	fi
	@echo "Done."
	$(CLEAN_UP)

prefs enable disable reset info show:
	gnome-extensions $@ $(UUID)

zip-file: _build
	@echo "Bundling zip file..."
	@cd _build; \
	zip -qr "$(ZIP_NAME).zip" . -x "schemas/gschemas.compiled"
	@mv _build/$(ZIP_NAME).zip ./
	@echo "Done."
	$(CLEAN_UP)

_build: all
	@echo "Building extension..."
	@-rm -fR ./_build
	@mkdir -p _build
	@cp $(PACKAGE_FILES) _build/
	@mkdir -p _build/schemas
	@cp $(EXTENSION_DIR)/schemas/*.xml _build/schemas/
	@cp $(EXTENSION_DIR)/schemas/gschemas.compiled _build/schemas/
	@mkdir -p _build/locale
	@for MO_FILE in po/*.mo; do \
		if [ -f "$$MO_FILE" ]; then \
			lf=_build/locale/`basename $$MO_FILE .mo`; \
			mkdir -p $$lf; \
			mkdir -p $$lf/LC_MESSAGES; \
			cp $$MO_FILE $$lf/LC_MESSAGES/$(GETTEXT_DOMAIN).mo; \
		fi; \
	done;
	@if [ -n "$(COMMIT)" ]; then \
		sed -i '/"uuid": .*/a \  "commit": "$(COMMIT)",' _build/metadata.json; \
	fi
	@echo "Done."

help:
	@echo "Available targets:"
	@echo "  all              - Build extension (compile schemas and translations)"
	@echo "  clean            - Remove build artifacts"
	@echo "  potfile          - Generate/update .pot translation template"
	@echo "  updatepo         - Update all .po files from .pot template"
	@echo "  newpo LANG=xx    - Create new translation file for language xx"
	@echo "  install          - Install extension (DESTDIR for system install)"
	@echo "  zip-file         - Create distributable zip file"
	@echo "  prefs            - Open extension preferences"
	@echo "  enable           - Enable the extension"
	@echo "  disable          - Disable the extension"
	@echo "  help             - Show this help message"
