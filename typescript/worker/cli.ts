import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import minimist from 'minimist';

const logoFont = 'Diet Cola';
type cliOptions = {
  debugMode: boolean;
  resourceDir: string;
  arguments?: string[];
};

async function loadFont(resourceDir: string) {
  figlet.parseFont(
    logoFont,
    fs.readFileSync(
      path.resolve(path.join(resourceDir, `build/fonts/${logoFont}.flf`)),
      { encoding: 'utf-8' }
    )
  );
}

async function printFiglet(expr: string, loadingFontPromise: Promise<void>) {
  await loadingFontPromise;
  return figlet.textSync(expr, logoFont);
}

async function cli(options: cliOptions) {
  const loadingFont = loadFont(options.resourceDir);

  // parse arguments
  const args = minimist(
    options.arguments ? options.arguments : process.argv.slice(1),
    {
      string: ['template'],
      boolean: ['help', 'quit', 'verbose'],
      alias: {
        t: 'template',
        h: 'help',
        q: 'quiet',
        v: 'verbose',
      },
      default: {
        help: false,
        quite: false,
        verbose: false,
      },
    }
  );

  if (args.help == true) {
    console.error(`
      ${chalk.yellowBright(await printFiglet('mdocx', loadingFont))}

      default style: 
        mdocx (options...) <sub command> (sub command args...)

      sub commands:
        convert: generate docx file from markdown.
          mdocx (options...) convert <convert markdown file> [...]

      options:
        -t, --template: the file of template docx.
        -q, --quiet: no output (not implemented).
        -v, --verbose: output verbose messages (not implemented).

    `);
    return 1;
  }

  const quiet = args.quiet == true && args.verbose != true;
  const verbose = args.verbose == true;

  if (args._.length < 1) {
    console.error('sub command is required');
    return 2;
  }

  switch (args._[0]) {
    case 'convert': {
      if (args._.length < 2) {
        console.error('convert markdown file is required');
        return 2;
      }
      const template: string | undefined = args.template
        ? args.template
        : undefined;
      if (template === undefined) {
        console.error(
          'warning: template file is not selected: use default style'
        );
      }

      const sources = args._.slice(1);
      for (const source of sources) {
        console.log(`${source} with template ${template}`);
        // TODO: write it!
      }
    }
  }

  console.log(chalk.yellowBright(await printFiglet('mdocx', loadingFont)));
}

export default cli;
