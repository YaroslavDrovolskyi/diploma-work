import {requestJira} from "@forge/bridge";
// import j2m from "jira2md";

export const getIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/agile/1.0/issue/${issueIdOrKey}`);

  console.log(`Response (getIssue()): ${response.status} ${response.statusText}`);
  return await response.json();
}



export const getGeminiResponse = async() => {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: "Generate me 10 user stories (according to Scrum framework) for Instant messaging app"
          }
        ]
      }
    ]
  }


  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw'
      },
      body: JSON.stringify(requestBody)
    }
  );
//  const status = result.status;

  return await response.json();//.text;
}






const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');

export const getGeminiAnswerJs = async() => {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}


/**
 * Replaces any sequence of whitespace characters (only if it has at least one newline (\n) character) with '. '
 * The purpose of this function is to help to convert text from Jira wiki markup to plain format.
 * @param str
 * @return {string}
 */
const replaceNewlines = (str) => {
  return str.replaceAll(new RegExp('\\.?\\s*\\n+\\s*', 'g'), ". ");
}

//const j2m = require('jira2md');

// const { markdownToTxt } = require('markdown-to-txt');
const removeMarkdown = require("markdown-to-text");

/**
 * Deletes all formatting from Jira Wiki markup-formatted string. For example, \*\*text** will be converted to text.
 * <br/>
 * Also replaces each sequence of whitespace characters (only if it has at least one newline (\n) character) with '. '.
 * Dot is inserted in order to logically separate two texts that previously were on separate lines.
 * @param wikiText
 * @return {string}
 */
export const convertJiraWikiMarkupToPlainText = (wikiText) => {
//  const mdText = j2m.to_markdown(wikiText);
  const mdText = to_markdown(wikiText);
//  const plainTextWithNewlines = markdownToTxt(mdText);
  const plainTextWithNewlines = removeMarkdown(mdText);
  return replaceNewlines(plainTextWithNewlines);
}

/*
copy of J2M function. Copied because had problems with importing J2M library
(particularly, importing of 'marked' library has failed inside the J2M library)
 */
const to_markdown = (str) => {
  return (
    str
      // Un-Ordered Lists
      .replace(/^[ \t]*(\*+)\s+/gm, (match, stars) => {
        return `${Array(stars.length).join('  ')}* `;
      })
      // Ordered lists
      .replace(/^[ \t]*(#+)\s+/gm, (match, nums) => {
        return `${Array(nums.length).join('   ')}1. `;
      })
      // Headers 1-6
      .replace(/^h([0-6])\.(.*)$/gm, (match, level, content) => {
        return Array(parseInt(level, 10) + 1).join('#') + content;
      })
      // Bold
      .replace(/\*(\S.*)\*/g, '**$1**')
      // Italic
      .replace(/_(\S.*)_/g, '*$1*')
      // Monospaced text
      .replace(/\{\{([^}]+)\}\}/g, '`$1`')
      // Citations (buggy)
      // .replace(/\?\?((?:.[^?]|[^?].)+)\?\?/g, '<cite>$1</cite>')
      // Inserts
      .replace(/\+([^+]*)\+/g, '<ins>$1</ins>')
      // Superscript
      .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
      // Subscript
      .replace(/~([^~]*)~/g, '<sub>$1</sub>')
      // Strikethrough
      .replace(/(\s+)-(\S+.*?\S)-(\s+)/g, '$1~~$2~~$3')
      // Code Block
      .replace(
        /\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*?)\n?\{code\}/gm,
        '```$2$5\n```'
      )
      // Pre-formatted text
      .replace(/{noformat}/g, '```')
      // Un-named Links
      .replace(/\[([^|]+?)\]/g, '<$1>')
      // Images
      .replace(/!(.+)!/g, '![]($1)')
      // Named Links
      .replace(/\[(.+?)\|(.+?)\]/g, '[$1]($2)')
      // Single Paragraph Blockquote
      .replace(/^bq\.\s+/gm, '> ')
      // Remove color: unsupported in md
      .replace(/\{color:[^}]+\}([^]*?)\{color\}/gm, '$1')
      // panel into table
      .replace(/\{panel:title=([^}]*)\}\n?([^]*?)\n?\{panel\}/gm, '\n| $1 |\n| --- |\n| $2 |')
      // table header
      .replace(/^[ \t]*((?:\|\|.*?)+\|\|)[ \t]*$/gm, (match, headers) => {
        const singleBarred = headers.replace(/\|\|/g, '|');
        return `\n${singleBarred}\n${singleBarred.replace(/\|[^|]+/g, '| --- ')}`;
      })
      // remove leading-space of table headers and rows
      .replace(/^[ \t]*\|/gm, '|')
  );
  // // remove unterminated inserts across table cells
  // .replace(/\|([^<]*)<ins>(?![^|]*<\/ins>)([^|]*)\|/g, (_, preceding, following) => {
  //     return `|${preceding}+${following}|`;
  // })
  // // remove unopened inserts across table cells
  // .replace(/\|(?<![^|]*<ins>)([^<]*)<\/ins>([^|]*)\|/g, (_, preceding, following) => {
  //     return `|${preceding}+${following}|`;
  // });
}