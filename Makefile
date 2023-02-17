NODE_ENV=development
ARCH=x64
PLATFORM=linux

BUILD_ARTIFACT_DIR=./build
BUILD_ARTIFACT_VENV=$(BUILD_ARTIFACT_DIR)/.venv
ifeq ($(PLATFORM),windows)
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

requirements.lock: poetry
	poetry export --without dev > "$(BUILD_ARTIFACT_REQUIREMENTS_LOCK)"

packaged-python-venv: poetry
	poetry run virtualenv --always-copy "$(BUILD_ARTIFACT_VENV)"

packaged-python-library: packaged-python-venv requirements.lock
	"$(BUILD_ARTIFACT_PYTHON)" -m pip install -r "$(BUILD_ARTIFACT_REQUIREMENTS_LOCK)"

packaged-python: packaged-python-library
	"$(BUILD_ARTIFACT_PYTHON)" -m pip uninstall -y pip

yarn: yarn.lock package.json
	yarn install --frozen-lockfile

packaged-resources: yarn
	mkdir -p build/fonts
	cp "node_modules/figlet/fonts/$(LOGO_FONT).flf" "$(BUILD_ARTIFACT_FONTS)/$(LOGO_FONT).flf"

webpack: yarn webpack.config.ts
	yarn webpack

electron-package: packaged-python packaged-resources webpack forge.config.ts
	yarn electron-forge package -- --arch $(ARCH) --platform $(PLATFORM)

electron-make: packaged-python packaged-resources webpack forge.config.ts
	yarn electron-forge make -- --arch $(ARCH) --platform $(PLATFORM)

yarn-test: poetry yarn packaged-resources
	yarn test

package: electron-package

test: yarn-test

.PHONY: clean
clean:
	rm -rf .venv
	rm -rf node_modules
	rm -rf build
