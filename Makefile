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
OUT_ARTIFACT_DIR=./out/mdocx-$(PLATFORM)-$(ARCH)
MDOCX_linux=mdocx
MDOCX_win32=mdocx.exe
MDOCX_darwin=mdocx.app/Contents/MacOS/mdocx
OUT_ARTIFACT_MDOCX=$(OUT_ARTIFACT_DIR)/$(MDOCX_$(PLATFORM))

ifeq ($(PLATFORM),darwin)
CMD_MDOCX=sudo $(OUT_ARTIFACT_MDOCX)
else
CMD_MDOCX=$(OUT_ARTIFACT_MDOCX)
endif

.venv: poetry.lock poetry.toml pyproject.toml
	poetry install --no-root

build/mdocx: .venv
	poetry run pyinstaller python/mdocx.py --onefile
	rm -rf $(BUILD_ARTIFACT_DIR)/mdocx
	mv dist/mdocx $(BUILD_ARTIFACT_DIR)/

node_modules: yarn.lock package.json
	yarn install --frozen-lockfile

build/fonts: node_modules
	mkdir -p build/fonts
	cp "node_modules/figlet/fonts/$(LOGO_FONT).flf" "$(BUILD_ARTIFACT_FONTS)/$(LOGO_FONT).flf"

build/webpack: node_modules webpack.config.ts typescript
	yarn webpack

$(OUT_ARTIFACT_DIR): node_modules build/mdocx build/fonts build/webpack forge.config.ts
	yarn electron-forge package -- --arch $(ARCH) --platform $(PLATFORM)

out/make: node_modules build/mdocx build/fonts build/webpack forge.config.ts
	yarn electron-forge make -- --arch $(ARCH) --platform $(PLATFORM)

.PHONY: jest
jest: node_modules build/mdocx typescript
	yarn test

.PHONY: command-test
command-test: $(OUT_ARTIFACT_DIR)
	$(CMD_MDOCX) convert example/example.md -t example/example-style.docx

.PHONY: package
package: $(OUT_ARTIFACT_DIR)

.PHONY: test
test: jest command-test

.PHONY: clean
clean:
	rm -rf .venv
	rm -rf node_modules
	rm -rf build
	rm -rf dist
