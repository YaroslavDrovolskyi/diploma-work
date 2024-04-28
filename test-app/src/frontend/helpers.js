import {requestJira} from "@forge/bridge";



export const getAllBoards = async() => {
  const response = await /*api.asUser().*/ requestJira('/rest/agile/1.0/board'); // latest <-> 1.0 // asApp <-> asUser

  console.log(`Response (getAllBoards()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getMyself = async() => {
  const response = await /*api.asUser().*/ requestJira('/rest/api/3/myself');

  console.log(`Response (getMyself()): ${response.status} ${response.statusText}`);
  console.log(JSON.stringify(await response));
  return await response.json();
}

export const getBoard = async(boardId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}`);

  console.log(`Response (getBoard()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getIssuesForBacklog = async(boardId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}/backlog`);

  console.log(`Response (getIssuesForBacklog()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getIssuesForBoard = async(boardId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}/issue`);

  console.log(`Response (getIssuesForBoard()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getAllSprints = async(boardId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}/sprint`);

  console.log(`Response (getAllSprints()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getBoardIssuesForSprint = async(boardId, sprintId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}/sprint/${sprintId}/issue`);

  console.log(`Response (getBoardIssuesForSprint()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/agile/1.0/issue/${issueIdOrKey}`);

  console.log(`Response (getIssue()): ${response.status} ${response.statusText}`);
  return await response.json();
}


export const getIssuePlainText = async(issueId) => {
  const requestBody = {
    context: {
      issue: {
        id: issueId
      }
    },
    expression: "{description: issue.description.plainText}"
  };


  const response = await requestJira(`/rest/api/3/expression/eval`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log(`Response (getIssuePlainText()): ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Replaces any sequence of whitespace characters (only if it has at least one newline (\n) character) with '. '
 * The purpose of this function is to help to convert text from Jira wiki markup to plain format.
 * @param str
 * @return {string}
 */
export const replaceNewlines = (str) => {
  return str.replaceAll(new RegExp('\\.?\\s*\\n+\\s*', 'g'), ". ");
}

const j2m = require('jira2md');
const { markdownToTxt } = require('markdown-to-txt');

/**
 * Deletes all formatting from Jira Wiki markup-formatted string. For example, \*\*text** will be converted to text.
 * <br/>
 * Also replaces each sequence of whitespace characters (only if it has at least one newline (\n) character) with '. '.
 * Dot is inserted in order to logically separate two texts that previously were on separate lines.
 * @param wikiText
 * @return {string}
 */
export const convertJiraWikiMarkupToPlainText = (wikiText) => {
  const mdText = j2m.to_markdown(wikiText);
  const plainTextWithNewlines = markdownToTxt(mdText);
  return replaceNewlines(plainTextWithNewlines);
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



/*
const { GoogleGenerativeAI } = require("@google/generative-ai"); // import

// initialize Generative Model
//const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
const genAI = new GoogleGenerativeAI('AIzaSyCOg-SHfvbdK_phTbeoW3faeeO-N9QPIgw');

export const getGeminiAnswer = async() => {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
  // console.log(text);
}


 */
  //


//