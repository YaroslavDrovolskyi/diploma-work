import React, { useEffect, useState } from 'react';
import ForgeReconciler, {Box, Heading, Stack, Strong, Text, useProductContext} from '@forge/react';
import { route } from '@forge/api';
// import {getAllBoards, getMyself} from '../index';
import {invoke, requestJira} from "@forge/bridge";
import {
  convertJiraWikiMarkupToPlainText,
  getAllBoards,
  getAllSprints,
  getBoard,
  getBoardIssuesForSprint, getGeminiAnswer, getIssue, getIssuePlainText,
  getIssuesForBacklog,
  getIssuesForBoard,
  getMyself, replaceMarkdownWhitespaces
} from "./helpers";


const j2m = require('jira2md');
const { markdownToTxt } = require('markdown-to-txt');


const App = () => {
//  const context = useProductContext();
  const [allBoards, setAllBoards] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [board, setBoard] = React.useState(null);
  const [issuesForBacklog, setIssuesForBacklog] = React.useState(null);
  const [issuesForBoard, setIssuesForBoard] = React.useState(null);
  const [allSprints, setAllSprints] = React.useState(null);
  const [boardIssuesForSprint, setBoardIssuesForSprint] = React.useState(null);
  const [userStory, setUserStory] = React.useState(null);
  const [task, setTask] = React.useState(null);
  const [subtask, setSubtask] = React.useState(null);
  const [issuePlainText, setIssuePlainText] = React.useState(null);
  const [geminiAnswer, setGeminiAnswer] = React.useState(null);

  const loadData = async () => {
    setAllBoards(await getAllBoards());
    setUserInfo(await getMyself());
    setBoard(await getBoard(1));
    setIssuesForBacklog(await getIssuesForBacklog(1));
    setIssuesForBoard(await getIssuesForBoard(1));
    setAllSprints(await getAllSprints(1));
    setBoardIssuesForSprint(await getBoardIssuesForSprint(1,10));
    setUserStory(await getIssue("TP-14"));
    setTask(await getIssue("TP-3"));
    setSubtask(await getIssue("TP-17"));
    setIssuePlainText(await getIssuePlainText(10013));

    let geminiResult = await invoke('getGeminiAnswer1', { a: 'my-invoke-variable' });
    setGeminiAnswer(geminiResult);
    console.log(geminiResult);
  };

  React.useEffect(() => {
      loadData().then(r => console.log('loadData() finished'));
  }, []);



   let allDataReceived = (allBoards != null) && (userInfo != null) &&
     (board != null) && (issuesForBacklog != null) && (issuesForBoard != null) &&
     (allSprints != null) && (boardIssuesForSprint != null) &&
     (userStory != null) && (task != null) && (subtask != null) &&
     (issuePlainText != null) &&
     (geminiAnswer != null);

  // conditional rendering of page
  if(!allDataReceived){
    return (
      <>
        <Text>Hello world!</Text>
        <Text>
          Result now will be delivered
        </Text>
      </>
    );
  }

  const wikiText = issuePlainText.value.description;
  console.log(wikiText);
  console.log(convertJiraWikiMarkupToPlainText(wikiText));

  return (
    <>
     <Text>{JSON.stringify(geminiAnswer)}</Text>


    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


const DisplayIssues = ({text, issues}) => {
  return(
    <>
      <Heading as={"h3"}>{text}</Heading>
      <Stack space={"space.200"}>
        {issues.issues.map((issue, index) => (
          <Stack space={"space.0"}>
            <Strong>{index+1}</Strong>
            <Text>Key: {issue.key}</Text>
            <Text>Id: {issue.id}</Text>
            <Text>Type: {issue.fields.issuetype.name}</Text>
            <Text>Summary: {issue.fields.summary}</Text>
            <Text>Status: {issue.fields.status.name}</Text>
            <Text></Text>
          </Stack>
        ))}
      </Stack>
    </>
  );
}

// fetch product context and extract service desk key
//    const projectKey = context.extension.project.key;


/*

<DisplayIssues text={"Issues for BACKLOG"} issues={issuesForBacklog}/>
<DisplayIssues text={"Issues for BOARD"} issues={issuesForBoard}/>

<Text>
  All boards: {JSON.stringify(allBoards)}
</Text>

<Text>
  Board: {JSON.stringify(board)}
</Text>

<Text>
  All sprints: {JSON.stringify(allSprints)}
</Text>

<Text>
  Board issues for sprint: {JSON.stringify(boardIssuesForSprint)}
</Text>




 <Text>
        User info: {JSON.stringify(userInfo)}
      </Text>

      <Strong>User Story: </Strong>
      <Text>{JSON.stringify(userStory)}</Text>

      <Strong>Task: </Strong>
      <Text>{JSON.stringify(task)}</Text>

      <Strong>Subtask: </Strong>
      <Text>{JSON.stringify(subtask)}</Text>

      <Strong>Issue with plain fields: </Strong>
      <Text>{JSON.stringify(issuePlainText)}</Text>
      <Text>{issuePlainText.value.description}</Text>


 */
