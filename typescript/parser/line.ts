import * as mdocx from './types';
import * as mathjax from './mathjax';

const reSpliter = /(\*\*.+\*\*|\*.+\*|\$.+\$|\[\^.+\])/;
const reBold = /^\*\*(.+)\*\*$/;
const reItalic = /^\*(.+)\*$/;
const reMathjax = /^\$(.+)\$$/;
const reReference = /^\[\^(.+)\]$/;

function parseText(text: string): mdocx.MdocxText[] {
  function parseTextInternal(
    text: string,
    options: mdocx.MdocxTextOptions
  ): mdocx.MdocxText[] {
    const splitedTexts = text.split(reSpliter);
    const result: mdocx.MdocxText[] = [];

    for (const splitedText of splitedTexts) {
      if (splitedText === undefined || splitedText === null) {
        continue;
      }

      const boldMatched = splitedText.match(reBold);
      if (boldMatched !== null) {
        result.push(
          ...parseTextInternal(boldMatched[1], { ...options, bold: true })
        );
        continue;
      }

      const italicMatched = splitedText.match(reItalic);
      if (italicMatched !== null) {
        result.push(
          ...parseTextInternal(italicMatched[1], { ...options, italic: true })
        );
        continue;
      }

      const mathjaxMatched = splitedText.match(reMathjax);
      if (mathjaxMatched !== null) {
        result.push({
          type: 'svg',
          svg: mathjax.mathjax2svg(mathjaxMatched[1]),
        });
        continue;
      }

      if (splitedText === null) {
        throw new Error('splitedText is null');
      }
      const referenceMatched = splitedText.match(reReference);
      if (referenceMatched !== null) {
        result.push({
          type: 'reference',
          key: referenceMatched[1],
        });
        continue;
      }

      result.push({
        type: 'normal',
        expression: splitedText,
        options: options,
      });
    }

    return result;
  }

  return parseTextInternal(text, {
    bold: false,
    italic: false,
  });
}

export { parseText };
