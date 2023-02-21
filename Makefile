NODE_ENV?=development
ARCH?=x64
PLATFORM?=linux
TAG?=

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
RELEASE_VERSION=$(patsubst v%,%,$(TAG))
RELEASE_ZIP_ARTIFACT=./out/make/zip/$(PLATFORM)/$(ARCH)/mdocx-$(PLATFORM)-$(ARCH)-$(RELEASE_VERSION).zip
RELEASE_RPM_ARTIFACT_x64=./out/make/rpm/$(ARCH)/mdocx-$(RELEASE_VERSION)-1.x86_64.rpm
RELEASE_DEB_ARTIFACT_x64=./out/make/deb/$(ARCH)/mdocx_$(RELEASE_VERSION)_amd64.deb
RELEASE_ARTIFACTS_linux_x64=$(RELEASE_ZIP_ARTIFACT) $(RELEASE_RPM_ARTIFACT_$(ARCH)) $(RELEASE_DEB_ARTIFACT_$(ARCH))
RELEASE_ARTIFACTS_win32_x64=$(RELEASE_ZIP_ARTIFACT)
RELEASE_ARTIFACTS_darwin_x64=$(RELEASE_ZIP_ARTIFACT)
RELEASE_ARTIFACTS=$(RELEASE_ARTIFACTS_$(PLATFORM)_$(ARCH))

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
	yarn install --frozen-lockfile --production=false

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

.PHONY: all
all: test out/make

.PHONY: release
release: out/make
	gh release upload $(TAG) $(RELEASE_ARTIFACTS) --clobber

.PHONY: clean
clean:
	rm -rf .venv
	rm -rf node_modules
	rm -rf build
	rm -rf dist
