import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.+(spec|test).+(ts|tsx)'],
};

export default config;
