import {requestJira, view} from "@forge/bridge";
import {replaceNewlines, convertPlainTextToADF} from "../requests/helpers.js";


///////////////////////////////// This file can be named 'api_requests'



/*
A couple of sentences about pagination: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#pagination
 */

/**
 * Gets ID of current project. Uses `context`.
 * @return {Promise<*>} ID of current project
 */
export const getCurrentProjectId = async() => {
  const context = await view.getContext();
  const currentProjectId = context.extension.project.id;

  return currentProjectId;
}

/**
 * Fetches all boards for current project, that the user has permission to view.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-rest-agile-1-0-board-get)
 * about API call used, its parameters and returned values
 * @return {Promise<any[]>} array of boards
 */
// also can set the board type parameter in request; it can be 'simple', 'scrum', 'kanban'
export const fetchAllBoardsForProject = async() => {
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

  let boardsArray = Array.from(boards.values());


  const context = await view.getContext();
  const currentProjectId = context.extension.project.id; // is string

  // Filter boards to get ones that belong only to current project
  // We can't use `projectKeyOrId` API request parameter
  // as said in https://community.atlassian.com/t5/Jira-questions/Re-Re-API-to-retrieve-list-of-all-boards/qaq-p/1333686/comment-id/613080#M613080
  // because it considers only "reference to a project" (according to docs), but not fully affiliation

  let boardsArrayForProject = boardsArray.filter((b) =>
    b.location.projectId === Number(currentProjectId)
  );

  return boardsArrayForProject;
}


/**
 * Returns all not-DONE issues of type 'Story'/'Task' from a board, for a given board ID.
 * For each issue these fields are fetched: id, key, issuetype, status, summary, description
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-rest-agile-1-0-board-boardid-issue-get)
 * aboutI API call, its parameters and returned values
 * @param boardId
 * @return {Promise<any[]>} array of issues
 * (issue is **`{id, key, issuetype, status, summary, description, subtasks}`** object)
 */
export const fetchAllNotDoneStoriesTasksForBoard = async (boardId) => {
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


// maybe replace issueId by issueKey???
/**
 * Returns all subtasks of given issue from a given board.
 * For each subtask these fields are fetched: `id`, `key`.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-rest-agile-1-0-board-boardid-issue-get)
 * aboutI API call, its parameters and returned values
 * @param boardId
 * @param issueId
 * @return {Promise<any[]>} array of subtasks
 * (issue is **`{id, key}`** object)
 */
export const fetchAllSubtasksForIssueForBoard = async (boardId, issueId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const issues = new Map(); // map of pairs [issuedId, issue]

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(
      `/rest/agile/1.0/board/${boardId}/issue?startAt=${startAt}&jql=(parent=${issueId})+and+(type=Subtask) \
    &fields=id,key,parent&maxResults=50`);
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

/**
 * Fetches issue, in particular with given fields: `ID`, `key`, `issuetype`, `status`, `summary`, `description`, `subtasks`.
 *
 * Description of returned issue is in the *Jira Wiki format*.
 * @param issueIdOrKey
 * @return {Promise<any>}
 */
export const fetchIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/agile/1.0/issue/${issueIdOrKey}?fields=id,key,issuetype,status,summary,description,subtasks`);

  return await response.json();
}


/**
 * Fetches issue with all fields.
 *
 * The main difference from `fetchIssue()` method is that there `description` of returned issue is in the *Atlassian Document Format*.
 *
 * [Details] (https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get)
 * about API call used.
 * @param issueIdOrKey
 * @return {Promise<any>}
 */
export const fetchIssueNewApi = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/api/3/issue/${issueIdOrKey}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  return await response.json();
}


/**
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-types/#api-rest-api-3-issuetype-project-get)
 * about used API call and returned object.
 * @param projectId
 * @return {Promise<any>} Array (without paging) of all issue types in project
 */
export const fetchAllIssueTypesForProject = async(projectId) => {
  const response = await requestJira(`/rest/api/3/issuetype/project?projectId=${projectId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  return await response.json();
}


/**
 * Finds ID of issue type with given name for given project.
 * @param issueTypeName is name of  wanted issue type. Default possible values: `Story`, `Task`, `Subtask`.
 * @param projectId
 * @return {Promise<*|null>} ID of issue type, or `null` if issue type with given name does not exist.
 */
export const fetchIssueTypeIdForProject = async(issueTypeName, projectId) => {
  const allIssueTypes = await fetchAllIssueTypesForProject(projectId);

  const issueType = allIssueTypes.find((t) => (t.name === issueTypeName));
  if(issueType === undefined || issueType === null){
    return null;
  }

  return issueType.id;
}



/**
 * Creates subtask as a child of Issue with given `parentIssueId`.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post)
 * about used API call, parameters and returned object
 * @param parentIssueId is ID of parent issue (Story/Task)
 * @param subtask is `{task, description}` subtask object, that will be created. Note, that `task` is summary.
 * @return {Promise<void>} `{id, key}` object for created Subtask,
 * but returns null if project does not have issueType with name "Subtask"
 */
export const createSubtask = async(parentIssueId, subtask) => {
  const currentProjectId = await getCurrentProjectId();
  const issueTypeId = await fetchIssueTypeIdForProject('Subtask', currentProjectId);

  if(issueTypeId === null){
    return null;
  }

  const bodyData = {
    fields: {
      summary: replaceNewlines(subtask.task),
      description: convertPlainTextToADF(subtask.description),

      issuetype: {
        id: issueTypeId
      },

      parent: {
        id: `${parentIssueId}`
      },

      project: {
        id: currentProjectId
      }
    }
  };

  const response = await requestJira(`/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  return(await response.json());
}


/**
 * Creates user story with given params.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post)
 * about used API call, parameters and returned object
 * @param userStory is `{summary, description}` object, that will be created.
 * @return {Promise<void>} `{id, key}` object for created User Story,
 * but returns null if project does not have issue type with name "Story"
 */
export const createUserStory = async(userStory) => {
  const currentProjectId = await getCurrentProjectId();
  const issueTypeId = await fetchIssueTypeIdForProject('Story', currentProjectId);

  if(issueTypeId === null){
    return null;
  }

  const bodyData = {
    fields: {
      summary: replaceNewlines(userStory.summary),
      description: convertPlainTextToADF(userStory.description),

      issuetype: {
        id: issueTypeId
      },

      project: {
        id: currentProjectId
      }
    }
  };

  const response = await requestJira(`/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  return(await response.json());
}




/**
 * Deletes given issue (Story/Task/Subtask) together with all its subtasks.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-delete)
 * about used API call
 * @param issueIdOrKey
 * @return
 */
export const deleteIssue = async(issueIdOrKey) => {
  const response = await requestJira(`/rest/api/3/issue/${issueIdOrKey}?deleteSubtasks=true`, {
    method: 'DELETE'
  });

  return response;
}


/**
 * Changes parent issue of given issue
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
 * about used API call.
 * @param issueId
 * @param parentId
 * @return {Promise<ResponseObject|string|void>}
 */
export const changeIssueParent = async(issueId, parentId) => {
  const bodyData = {
    fields: {
      parent: {
        id: `${parentId}`
      },
    }
  };

  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  return response;
}