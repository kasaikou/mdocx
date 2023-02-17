import { ParseMarkdown } from './markdown';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

test('example', function () {
  const doc = ParseMarkdown(
    fs.readFileSync(
      path.resolve(path.join(__dirname, '../../example/example.md')),
      {
        encoding: 'utf-8',
      }
    ),
    path.resolve(path.join(__dirname, '../../example')),
    path.resolve(path.join(__dirname, '../../example/example.docx')),
    path.resolve(path.join(__dirname, '../../example/example-style.docx'))
  );

  const body = JSON.stringify(doc, null, 2);

  fs.writeFileSync(
    path.resolve(path.join(__dirname, '../../example/example.json')),
    body
  );
  try {
    const pythonPath = path.resolve(
      path.join(
        __dirname,
        '../..',
        process.platform === 'win32'
          ? '.venv/Scripts/python'
          : '.venv/bin/python'
      )
    );
    child_process.execSync(
      `${path.resolve(
        path.join(
          __dirname,
          process.platform === 'win32'
            ? '../../build/mdocx.exe'
            : '../../build/mdocx'
        )
      )}`,
      {
        input: body,
      }
    );
  } catch (e) {
    throw new Error(e.stderr.toString());
  }
});
