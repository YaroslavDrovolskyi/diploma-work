import {requestJira} from "@forge/bridge";



const fetchAllBoards = async() => {
  const response = await requestJira(`/rest/agile/1.0/board`);

  console.log(`Response (getIssue()): ${response.status} ${response.statusText}`);
  return await response.json();
}

// it is template method
// use default board for project;
export const fetchAllItems = async (url) => {
  ///////////////// NEED to get board ID firstly. For that need to take the first

  let boardId = 1;
  // maybe, give possibility to choose the board ID.
  let response = await requestJira(
    `/rest/agile/1.0/board/${boardId}/issue?jql=status!=Done+and+(type=Story+or+type=Task) \
    &fields=id,key,issuetype,status,summary,description`);
  return await response.json();


  // make request while page is not empty
  // But how to request second, third etc. page ?? -- using startAt parameter

  // WE filter using JQL parameter (by fields: status (not DONE), project, type (User story or Task))

  // collect all items not in array, but in set with unique IDs

  // how to test paging handler? Artificially limit maxResults parameter
}
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#pagination


// We can't do it using Jira Expression API –because it foes not allow to get list of data.