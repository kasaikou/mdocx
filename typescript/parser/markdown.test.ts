import { ParseMarkdown } from './markdown';
import child_process from 'child_process';
import fs from 'fs';

test('example', function () {
  const doc = ParseMarkdown(
    fs.readFileSync('/workspace/example/example.md', { encoding: 'utf-8' }),
    '/workspace/example',
    '/workspace/example/example.docx',
    '/workspace/example/example-style.docx'
  );

  const body = JSON.stringify(doc, null, 2);

  fs.writeFileSync('/workspace/example/example.json', body);
  try {
    child_process.execSync(`.venv/bin/python /workspace/python/mdocx.py`, {
      input: body,
    });
  } catch (e) {
    throw new Error(e.stderr.toString());
  }
});
