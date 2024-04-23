import {requestJira} from "@forge/bridge";


export const getAllBoards = async() => {
  const response = await /*api.asUser().*/ requestJira('/rest/agile/1.0/board'); // latest <-> 1.0 // asApp <-> asUser

  console.log(`Response (getAllBoards()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getMyself = async() => {
  const response = await /*api.asUser().*/ requestJira('/rest/api/3/myself');

  console.log(`Response (getMyself()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getBoard = async(boardId) => {
  const path = `/rest/agile/1.0/board/${boardId}`;
  console.log("Path: " + path);
  const response = await requestJira('/rest/agile/1.0/board/1');

  console.log(`Response (getBoard()): ${response.status} ${response.statusText}`);
  return await response.json();
}

export const getIssuesForBacklog = async(boardId) => {
  const response = await requestJira(`/rest/agile/1.0/board/${boardId}/backlog`);

  console.log(`Response (getBoard()): ${response.status} ${response.statusText}`);
  return await response.json();
}


//