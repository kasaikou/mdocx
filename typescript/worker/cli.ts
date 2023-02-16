import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const logoFont = 'Diet Cola';
type cliOptions = {
  debugMode: boolean;
  resourceDir: string;
};

async function cli(options: cliOptions) {
  figlet.parseFont(
    logoFont,
    fs.readFileSync(
      path.resolve(
        path.join(options.resourceDir, `build/fonts/${logoFont}.flf`)
      ),
      { encoding: 'utf-8' }
    )
  );
  console.log(chalk.yellowBright(figlet.textSync('mdocx', 'Diet Cola')));
}

export default cli;
