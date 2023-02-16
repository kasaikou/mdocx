import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {
    ignore:
      /(\.devcontainer|\.github|node_modules|\/\.|\.git|cmd|src|typescript|\.ts|poetry|\.toml|eslint)/,
    extraResource: [
      path.resolve(__dirname, 'build'),
      path.resolve(__dirname, 'python'),
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
};

export default config;
