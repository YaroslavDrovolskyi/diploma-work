import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, useProductContext } from '@forge/react';
import { invoke, requestJira } from '@forge/bridge';
import {getAllBoards} from '../resolvers/index.js';


const App = () => {
//  const context = useProductContext();
  const [allBoards, setAllBoards] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);

  const loadData = async () => {
    setAllBoards(await getAllBoards());
    console.log(`After first request`);

    const userInfoRes = await api.asUser().requestJira(route`/rest/api/3/myself`);
    console.log(`User info Response: ${userInfoRes.status} ${userInfoRes.statusText}`);
    setUserInfo(await userInfoRes.json());
    console.log(`After second request`);
  };

  React.useEffect(() => {
      loadData();
  }, []);

  // let allDataReceived = (allBoards != null) && (userInfo != null)
  // conditional rendering of page
  if(allBoards == null){
    return (
      <>
        <Text>Hello world!</Text>
        <Text>
          Result now will be delivered
        </Text>
      </>
    );
  }

  console.log(allBoards);
  console.log(userInfo);
  return (

    <>
      <Text>Hello world!</Text>
      <Text>
        User info: {JSON.stringify(userInfo)}
      </Text>
      <Text>
        All boards: {JSON.stringify(allBoards)}
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
