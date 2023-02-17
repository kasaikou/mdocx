NODE_ENV=development
ARCH=x64
PLATFORM=linux

BUILD_ARTIFACT_DIR=./build
BUILD_ARTIFACT_VENV=$(BUILD_ARTIFACT_DIR)/.venv
ifeq ($(PLATFORM),win32)
BUILD_ARTIFACT_PYTHON=$(BUILD_ARTIFACT_VENV)/Scripts/python
else
BUILD_ARTIFACT_PYTHON=$(BUILD_ARTIFACT_VENV)/bin/python
endif
BUILD_ARTIFACT_REQUIREMENTS_LOCK=$(BUILD_ARTIFACT_DIR)/requirements.lock
BUILD_ARTIFACT_FONTS=$(BUILD_ARTIFACT_DIR)/fonts
BUILD_ARTIFACT_WEBPACK=$(BUILD_ARTIFACT_DIR)/webpack
LOGO_FONT=Diet Cola
OUT_ARTIFACT_DIR=out/mdocx-$(PLATFORM)-$(ARCH)


poetry: poetry.lock poetry.toml pyproject.toml
	poetry install --no-root

build/mdocx: poetry
	poetry run pyinstaller python/mdocx.py --onefile
	rm -rf $(BUILD_ARTIFACT_DIR)/mdocx
	mv dist/mdocx $(BUILD_ARTIFACT_DIR)/

yarn: yarn.lock package.json
	yarn install --frozen-lockfile

packaged-resources: yarn
	mkdir -p build/fonts
	cp "node_modules/figlet/fonts/$(LOGO_FONT).flf" "$(BUILD_ARTIFACT_FONTS)/$(LOGO_FONT).flf"

webpack: yarn webpack.config.ts
	yarn webpack

electron-package: build/mdocx packaged-resources webpack forge.config.ts
	yarn electron-forge package -- --arch $(ARCH) --platform $(PLATFORM)

electron-make: build/mdocx packaged-resources webpack forge.config.ts
	yarn electron-forge make -- --arch $(ARCH) --platform $(PLATFORM)

yarn-test: build/mdocx yarn packaged-resources
	yarn test

package: electron-package

test: yarn-test

.PHONY: clean
clean:
	rm -rf .venv
	rm -rf node_modules
	rm -rf build
