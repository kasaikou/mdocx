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
    child_process.execSync(
      `.venv/bin/python ${path.resolve(
        path.join(__dirname, '../../python/mdocx.py')
      )}`,
      {
        input: body,
      }
    );
  } catch (e) {
    throw new Error(e.stderr.toString());
  }
});
