import {requestJira, view} from "@forge/bridge";


///////////////////////////////// This file can be named 'api_requests'
//// file with Gemini requests can be named 'gemini_requests'



/*
A couple of sentences about pagination: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#pagination
 */

/**
 * Fetches all boards, that the user has permission to view.
 * @return {Promise<any[]>} array of boards
 */
// also can set the board type parameter in request; it can be 'simple', 'scrum', 'kanban'
export const fetchAllBoards = async() => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const boards = new Map(); // map of pairs [boardId, board]

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(`/rest/agile/1.0/board?startAt=${startAt}`);
    let response = await resp.json();

    // add fetched boards to map
    for (const board of response.values){
      boards.set(board.id, board); // if board is already present in map, the more recent version of it is set
      startAt++;
    }

    if(response.values.length === 0){ // instead of, we can take response.isLast into account
      continueFetching = false;
    }
  }

  return Array.from(boards.values());
}


/**
 * Returns all not-DONE issues of type 'Story'/'Task' from a board, for a given board ID.
 * For each issue these fields are fetched: id, key, issuetype, status, summary, description
 * @param boardId
 * @return {Promise<any[]>} array of issues
 */
export const fetchAllStoriesTasksForBoard = async (boardId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const issues = new Map(); // map of pairs [issuedId, issue]

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(
      `/rest/agile/1.0/board/${boardId}/issue?startAt=${startAt}&jql=status!=Done+and+(type=Story+or+type=Task) \
    &fields=id,key,issuetype,status,summary,description,subtasks&maxResults=50`);
    let response = await resp.json();

    // add fetched issues to map
    for (const issue of response.issues){
      issues.set(issue.id, issue); // if issue is already present in map, the more recent version of it is set
      startAt++;
    }

    if(response.issues.length === 0){ // instead of, we can take response.isLast into account
      continueFetching = false;
    }
  }

  return Array.from(issues.values());
}

/*
We can't fetch list of items using Jira Expression API and, accordingly, specify criteria;
because it does not allow to get list of data.
 */



export const fetchCurrentProject = async() => {
  const context = await view.getContext();
  const projectId = context.extension.project.id;

  const response = await requestJira(`/rest/api/3/project/${projectId}`);
  return await response.json();
}


export const fetchIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/agile/1.0/issue/${issueIdOrKey}?fields=id,key,issuetype,status,summary,description,subtasks`);

  return await response.json();
}