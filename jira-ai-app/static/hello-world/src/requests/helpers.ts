/**
 * @function removeMarkdown
 *
 * @description
 * Parse the markdown and returns a string
 * Source: https://github.com/danestves/markdown-to-text/blob/main/index.ts. Copied, because problems with executing have arisen.
 *
 * @param markdown - The markdown string to parse
 * @param listUnicodeChar
 * @param stripListLeaders
 * @param gfm
 * @param useImgAltText
 * @param preserveLinks
 *
 * @returns The parsed plain text
 */
const removeMarkdown = (
    markdown: string,
    listUnicodeChar: boolean, // default is false
    stripListLeaders: boolean, // default is true
    gfm: boolean, // default is true
    useImgAltText: boolean, // default is true
    preserveLinks: boolean // default is false
) => {

    let output = markdown || "";

    // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
    output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, "");

    try {
        if (stripListLeaders) {
            if (listUnicodeChar)
                output = output.replace(
                    /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
                    listUnicodeChar + " $1"
                );
            else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, "$1");
        }
        if (gfm) {
            output = output
                // Header
                .replace(/\n={2,}/g, "\n")
                // Fenced codeblocks
                .replace(/~{3}.*\n/g, "")
                // Strikethrough
                .replace(/~~/g, "")
                // Fenced codeblocks
                .replace(/`{3}.*\n/g, "");
        }
        if(preserveLinks) {
            // Remove inline links while preserving the links
            output = output.replace(/\[(.*?)\][\[\(](.*?)[\]\)]/g, "$1 ($2)")
        }
        output = output
            // Remove HTML tags
            .replace(/<[^>]*>/g, "")
            // Remove setext-style headers
            .replace(/^[=\-]{2,}\s*$/g, "")
            // Remove footnotes?
            .replace(/\[\^.+?\](\: .*?$)?/g, "")
            .replace(/\s{0,2}\[.*?\]: .*?$/g, "")
            // Remove images
            .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, useImgAltText ? "$1" : "")
            // Remove inline links
            .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, "$1")
            // Remove blockquotes
            .replace(/^\s{0,3}>\s?/g, "")
            .replace(/(^|\n)\s{0,3}>\s?/g, "\n\n")
            // Remove reference-style links?
            .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, "")
            // Remove atx-style headers
            .replace(
                /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
                "$1$2$3"
            )
            // Remove emphasis (repeat the line to remove double emphasis)
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
            // Remove code blocks
            .replace(/(`{3,})(.*?)\1/gm, "$2")
            // Remove inline code
            .replace(/`(.+?)`/g, "$1")
            // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
            .replace(/\n{2,}/g, "\n\n");
    } catch (e) {
        console.error(e);

        return markdown;
    }
    return output;
};

export default removeMarkdown;