import * as mdocx from "./types"
import { z } from "zod";
import YAML from 'yaml';
import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from "mathjax-full/js/input/tex";
import { SVG } from "mathjax-full/js/output/svg";
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';

const zodMarkdownHeader = z.object({
    title: z.string().default(""),
    description: z.string().optional(),
    author: z.string(),
});

function mathjax2svg(expression: string): string {

    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);

    const document = mathjax.document("", {
        InputJax: new TeX({ packages: AllPackages }),
        OutputJax: new SVG({ fontCache: "none" }),
    });

    return adaptor.innerHTML(document.convert(expression));
}

function parseText(text: string): mdocx.MdocxText[] {

    const reSpliter = /(\*\*.+\*\*|\*.+\*|\$.+\$|\[\^.+\])/;
    const reBold = /^\*\*(.+)\*\*$/;
    const reItalic = /^\*(.+)\*$/;
    const reMathjax = /^\$(.+)\$$/;
    const reReference = /^\[\^(.+)\]$/;

    function parseTextInternal(text: string, options: mdocx.MdocxTextOptions): mdocx.MdocxText[] {
        const splitedTexts = text.split(reSpliter);
        const result: mdocx.MdocxText[] = [];

        for (const splitedText of splitedTexts) {
            if (splitedText === undefined || splitedText === null) {
                continue;
            }

            const boldMatched = splitedText.match(reBold);
            if (boldMatched !== null) {
                result.push(...parseTextInternal(boldMatched[1], { ...options, bold: true }));
                continue;
            }

            const italicMatched = splitedText.match(reItalic);
            if (italicMatched !== null) {
                result.push(...parseTextInternal(italicMatched[1], { ...options, italic: true }));
                continue;
            }

            const mathjaxMatched = splitedText.match(reMathjax);
            if (mathjaxMatched !== null) {
                result.push({
                    type: "svg",
                    svg: mathjax2svg(mathjaxMatched[1]),
                });
                continue;
            }

            if (splitedText === null) {
                throw new Error("splitedText is null")
            }
            const referenceMatched = splitedText.match(reReference);
            if (referenceMatched !== null) {
                result.push({
                    type: "reference",
                    key: referenceMatched[1],
                });
                continue;
            }

            result.push({
                type: "normal",
                expression: splitedText,
                options: options,
            });
        }

        return result;
    }

    return parseTextInternal(text, {
        bold: false,
        italic: false,
    })
}

function ParseMarkdown(markdown: string): mdocx.MdocxDocument {

    const reEmpty = /^\s*$/;
    const reSeparator = /^---\s*$/;
    const reHeader = /^(#{1,6})\s+/;
    const reImage = /^!\[(.*)\]\((.+)\)$/;
    const reImageDescription = /^>\s/;
    const reReference = /^\[\^(.+)\]:\s+(.+)$/;
    const reMathjaxLq = /^\$\$/;
    const reMathjaxRq = /\$\$\s*$/;

    const mdlines = markdown.split(/\r\n|\n/);
    let lineIdx = 0;
    const header = function () {
        let isHeaderStarted = false;
        let headerBody = "";

        for (; lineIdx < mdlines.length; lineIdx++) {
            if (mdlines[lineIdx].match(reSeparator) !== null) {
                if (isHeaderStarted) {
                    lineIdx++;
                    break;
                } else {
                    isHeaderStarted = true;
                }
            } else if (isHeaderStarted) {
                headerBody += mdlines[lineIdx] + "\n";
            }
        }

        if (lineIdx == mdlines.length) {
            if (isHeaderStarted) {
                throw new Error("yaml header needs wrapped '---' separator lines");
            } else {
                throw new Error("yaml header is required");
            }
        }

        return zodMarkdownHeader.parse(YAML.parse(headerBody));
    }();

    const paragraph: mdocx.MdocxParagraph[] = [];
    const reference: mdocx.MdocxReference[] = [];
    for (; lineIdx < mdlines.length; lineIdx++) {
        const status: mdocx.MdocxParagraphStatus = {
            line: lineIdx + 1,
        }

        // empty paragraph
        if (mdlines[lineIdx].match(reEmpty) !== null) {
            continue;
        }

        // new page paragraph
        if (mdlines[lineIdx].match(reSeparator) !== null) {
            paragraph.push({
                status: status,
                content: {
                    type: "newpage",
                },
            });
            continue;
        }

        // header paragraph
        const headerMatched = mdlines[lineIdx].match(reHeader);
        if (headerMatched !== null) {
            const level = headerMatched[1].length - 1;
            const text = mdlines[lineIdx].replace(reHeader, "");
            if (level < 1) {
                // title
                header.title = header.title ? header.title : text;
            } else {
                // heading
                paragraph.push({
                    status: status,
                    content: {
                        type: "heading",
                        level: level,
                        text: parseText(mdlines[lineIdx].replace(reHeader, "")),
                    },
                });
            }
            continue;
        }

        // image paragraph
        const imageMatched = mdlines[lineIdx].match(reImage);
        if (imageMatched !== null) {
            let description = imageMatched[1];
            const filenames: string[] = [imageMatched[2]];

            for (; lineIdx + 1 < mdlines.length;) {
                const imageMatched = mdlines[lineIdx + 1].match(reImage);
                if (imageMatched !== null) {
                    description = imageMatched[1].length < 1 ?
                        description :
                        description + ", " + imageMatched[1];
                    filenames.push(imageMatched[2]);
                    lineIdx++;
                    continue;
                }

                const imageDescriptionMatched = mdlines[lineIdx + 1].match(reImageDescription);
                if (imageDescriptionMatched !== null) {
                    description = mdlines[lineIdx + 1].replace(reImageDescription, "");
                    lineIdx++;
                    break;
                }

                break;
            }

            if (description.length < 1) {
                throw new Error(`image description is required (@Line ${status.line})`);
            }

            paragraph.push({
                status: status,
                content: {
                    type: "image",
                    filenames: filenames,
                    description: parseText(description),
                },
            });

            continue;
        }

        // reference paragraph
        const referenceMatched = mdlines[lineIdx].match(reReference);
        if (referenceMatched !== null) {
            const key = referenceMatched[1];
            const description = referenceMatched[2];

            reference.push({
                status: status,
                key: key,
                displayName: "",
                description: parseText(description),
            });
            continue;
        }

        // mathjax paragraph
        if (mdlines[lineIdx].match(reMathjaxLq) !== null) {
            let expression = mdlines[lineIdx].replace(reMathjaxLq, "");
            if (expression.match(reMathjaxRq) !== null) {
                expression = expression.replace(reMathjaxRq, "");
            } else {
                for (; lineIdx + 1 < mdlines.length;) {
                    if (mdlines[lineIdx + 1].match(reMathjaxRq) !== null) {
                        expression += mdlines[lineIdx + 1].replace(reMathjaxRq, "");
                        lineIdx++;
                        break;
                    } else {
                        expression += mdlines[lineIdx + 1];
                        lineIdx++;
                    }
                }
            }

            paragraph.push({
                status: status,
                content: {
                    type: "mathjax",
                    svg: mathjax2svg(expression),
                }
            });

            continue;
        }

        paragraph.push({
            status: status,
            content: {
                type: "normal",
                text: parseText(mdlines[lineIdx]),
            },
        });
    }

    return {
        config: {
            title: header.title ? header.title : "No Name",
            description: header.description,
            authorName: header.author,
        },
        references: reference,
        paragraphs: paragraph,
    };
}

export { ParseMarkdown };