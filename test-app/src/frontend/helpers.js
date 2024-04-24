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
  //


//