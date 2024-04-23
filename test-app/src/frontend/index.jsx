import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, useProductContext } from '@forge/react';
import api, { route } from '@forge/api';
// import {getAllBoards, getMyself} from '../index';
import {requestJira} from "@forge/bridge";
import {getAllBoards, getBoard, getIssuesForBacklog, getMyself} from "./helpers";





const App = () => {
//  const context = useProductContext();
  const [allBoards, setAllBoards] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [board, setBoard] = React.useState(null);
  const [issuesForBacklog, setIssuesForBacklog] = React.useState(null);

  const loadData = async () => {
    setAllBoards(await getAllBoards());
    setUserInfo(await getMyself());
    setBoard(await getBoard(1));
    setIssuesForBacklog(await getIssuesForBacklog(1));
  };

  React.useEffect(() => {
      loadData().then(r => console.log('loadData() finished'));
  }, []);

  // let allDataReceived = (allBoards != null) && (userInfo != null)
  // conditional rendering of page
/*  if(allBoards == null){
    return (
      <>
        <Text>Hello world!</Text>
        <Text>
          Result now will be delivered
        </Text>
      </>
    );
  }

 */
  return (

    <>
      <Text>
        User info: {JSON.stringify(userInfo)}
      </Text>
      <Text>
        All boards: {JSON.stringify(allBoards)}
      </Text>
      <Text>
        Board: {JSON.stringify(board)}
      </Text>
      <Text>
        Issues for backlog: {JSON.stringify(issuesForBacklog)}
      </Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// fetch product context and extract service desk key
//    const projectKey = context.extension.project.key;
