import { ParseMarkdown } from './markdown';
import fs from 'fs';

test('example', function () {
  const doc = ParseMarkdown(
    fs.readFileSync('/workspace/example/example.md', { encoding: 'utf-8' }),
    '/workspace/example',
    '/workspace/example/example.docx',
    '/workspace/example/example-style.docx'
  );
  fs.writeFileSync(
    '/workspace/example/example.json',
    JSON.stringify(doc, null, 2)
  );
});
