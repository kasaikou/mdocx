type MdocxTextOptions = {
    bold: boolean
    italic: boolean
}

type normalText = {
    type: "normal"
    expression: string
    options: MdocxTextOptions
};

type svgText = {
    type: "svg"
    svg: string
}

type referenceText = {
    type: "reference"
    key: string
}

type MdocxText = normalText | svgText | referenceText;

type MdocxMarkdownStatus = {
    line: number
}

type normalParagraphContent = {
    type: "normal"
    text: MdocxText[]
};

type imageParagraphContent = {
    type: "image"
    filenames: string[]
    description: MdocxText[]
};

type mathjaxSvgParagraphContent = {
    type: "mathjax"
    svg: string
};

type newpageParagraphContent = {
    type: "newpage"
}

type headingParagraphContent = {
    type: "heading"
    level: number
    text: MdocxText[]
}

type paragraphContent = normalParagraphContent | imageParagraphContent | mathjaxSvgParagraphContent | newpageParagraphContent | headingParagraphContent;

type MdocxParagraph = {
    status: MdocxMarkdownStatus
    content: paragraphContent
}

type MdocxDocumentConfig = {
    title: string
    description?: string
    authorName?: string
    styleTemplateFilename?: string
};

type MdocxReference = {
    key: string
    status: MdocxMarkdownStatus
    displayName: string
    description: MdocxText[]
};

type MdocxDocument = {
    config: MdocxDocumentConfig
    references: MdocxReference[]
    paragraphs: MdocxParagraph[]
};

export {
    MdocxDocument,
    MdocxParagraph,
    MdocxMarkdownStatus as MdocxParagraphStatus,
    MdocxReference,
    MdocxText,
    MdocxTextOptions,
}
