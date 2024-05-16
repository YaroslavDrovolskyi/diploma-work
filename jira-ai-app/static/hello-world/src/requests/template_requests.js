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
 * Fetches all issue fields *(including custom fields)* for application instance
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-fields/#api-rest-api-3-field-get)
 * about API call used
 * @return {Promise<any>} list of fields. Field is `{id, key, name, untranslatedName, custom `*(bool)*`, ...}` object.
 */
export const fetchAllIssueFields = async() => {
  const response = await requestJira(`/rest/api/3/field`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  return await response.json();
}


// use "Story point estimate" for story point estimate
/**
 * Finds issue field with given `untranslatedName`.
 *
 * Inspired by [comment](https://community.developer.atlassian.com/t/confirm-variancy-of-jira-cloud-issue-field-keys-for-custom-fields/21134/2)
 * on forum (can't use hardcoded ID for custom fields, because custom fields may have different IDs on every instance).
 * @param untranslatedName
 * @return found field `{id, key, name, untranslatedName, custom `*(bool)*`, ...}` object,
 * or `undefined` if field with given `untranslatedName` does not exist.
 */
export const getIssueFieldByUntranslatedName = async(untranslatedName) => {
  const fields = await fetchAllIssueFields();

  return await fields.find((f) => f.untranslatedName === untranslatedName);
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
 * about API call, its parameters and returned values
 * @param boardId
 * @return {Promise<any[]>} array of issues
 * (issue is **`{id, key, fields: {issuetype, status, summary, description, subtasks}}`** object)
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
 * about API call, its parameters and returned values
 * @param boardId
 * @param issueId
 * @return {Promise<any[]>} array of subtasks
 * (subtask is **`{id, key}`** object)
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


/**
 * Returns all not-DONE issues of type 'Story'/'Task' from a board backlog, for a given board ID.
 * For each issue these fields are fetched: id, key, issuetype, status, summary, description
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-rest-agile-1-0-board-boardid-backlog-get)
 * about API call, its parameters and returned values
 * @param boardId
 * @return {Promise<any[]>} array of issues
 * (issue is **`{id, key, fields: {issuetype, status, summary, description, priority,`
 * *getIssueFieldByUntranslatedName("Story point estimate").id* `}}`** object)
 */
export const fetchAllNotDoneStoriesTasksForBoardBacklog = async (boardId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const issues = new Map(); // map of pairs [issuedId, issue]
  const estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;
  // because it is custom field

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(
      `/rest/agile/1.0/board/${boardId}/backlog?startAt=${startAt}&jql=status!=Done+and+(type=Story+or+type=Task) \
    &fields=id,key,issuetype,status,summary,description,subtasks,priority,${estimateFieldId}&maxResults=50`);
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


/**
 * Fetches all not-CLOSED (active, future) sprints for a given board ID.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-rest-agile-1-0-board-boardid-sprint-get)
 * about API call, its parameters and returned values
 * @param boardId is ID of board (string or number)
 * @return {Promise<any[]>} array of sprints
 * (sprint is **`{id, name, state, goal, originBoardId, ...}`** object)
 */
export const fetchAllNotClosedSprintsForBoard = async (boardId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const sprints = new Map(); // map of pairs [sprintId, sprint]

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(
      `/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt} \
    &maxResults=50&state=active,future`);
    let response = await resp.json();

    // add fetched sprints to map
    for (const sprint of response.values){
      sprints.set(sprint.id, sprint); // if issue is already present in map, the more recent version of it is set
      startAt++;
    }

    if(response.values.length === 0){ // instead of, we can take response.isLast into account
      continueFetching = false;
    }
  }

  return Array.from(sprints.values());
}



/**
 * Returns all not-DONE User stories and Tasks for given sprint.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-sprint/#api-rest-agile-1-0-sprint-sprintid-issue-get)
 * about API call, its parameters and returned values.
 * @param sprintId
 * @return {Promise<any[]>} array of issues
 * (issue is **`{id, key, fields: {issuetype, status, summary, description, priority,`
 * *getIssueFieldByUntranslatedName("Story point estimate").id* `}}`** object)
 */
export const fetchAllNotDoneStoriesTasksForSprint = async (sprintId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const issues = new Map(); // map of pairs [issuedId, issue]

  // fetch ID of necessary field, because it is custom field (so IDs on different instances are different)
  const estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;


  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(
      `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&jql=status!=Done+and+(type=Story+or+type=Task) \
    &fields=id,key,issuetype,status,summary,description,subtasks,priority,${estimateFieldId}&maxResults=50`);
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
 * Fetches all priorities that are available in given project.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-priorities/#api-rest-api-3-priority-search-get)
 * about API call used
 * @param projectId is string
 * @return {Promise<any[]>} array of priorities. Priority is `{id, name, description, isDefault, ...}` object.
 */
export const fetchAllPrioritiesForProject = async(projectId) => {
  // map is necessary for not duplicating objects if some of them was received more than once
  // due to paging issues (for example shift because of object insertion on server)
  const priorities = new Map(); // map of pairs [priorityId, priority]

  let continueFetching = true;
  let startAt = 0;

  // make request while fetched page is not empty
  while(continueFetching){
    const resp = await requestJira(`/rest/api/3/priority/search?projectId=${projectId}&startAt=${startAt}&maxResults=50`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    let response = await resp.json();

    // add fetched priorities to map
    for (const priority of response.values){
      priorities.set(priority.id, priority); // if issue is already present in map, the more recent version of it is set
      startAt++;
    }

    if(response.values.length === 0){ // instead of, we can take response.isLast into account
      continueFetching = false;
    }
  }

  return Array.from(priorities.values());
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
 * Deletes given issue (Story/Task/Subtask) and all its subtasks.
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


/**
 * Changes summary and description of given issue.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
 * about used API call.
 * @param issueId is ID or key of issue that we need to change
 * @param newSummary is new summary
 * @param newDescription is new description
 * @return {Promise<any>}
 */
export const changeIssueSummaryDescription = async(issueId, newSummary, newDescription) => {
  const bodyData = {
    fields: {
      summary: replaceNewlines(newSummary),
      description: convertPlainTextToADF(newDescription)
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



/**
 * @Warning It will work only if field 'Priority' is enabled for User stories and Tasks (in project settings)
 *
 * Changes priority of given issue
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
 * about used API call.
 *
 * @param issueId is string
 * @param newPriorityId is string
 */
export const changeIssuePriority = async(issueId, newPriorityId) => {
  const bodyData = {
    fields: {
      priority: {
        id: `${newPriorityId}`
      }
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

/**
 * Changes story point estimate of given issue
 *
 * [Details](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put)
 * about used API call.
 * @param issueId is string
 * @param newEstimate is integer positive number, can be null
 */
export const changeIssueStoryPointEstimate = async(issueId, newEstimate) => {
  const estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;

  const bodyData = {
    fields: {

    }
  };
  bodyData.fields[`${estimateFieldId}`] = newEstimate;

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


/**
 * Creates Sprint with given params.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-sprint/#api-rest-agile-1-0-sprint-post)
 * about used API call, parameters and returned object
 * @param sprint is **`{name, goal}`** object, that will be created.
 * @param originBoardId is board ID.
 * @return {Promise<void>} **`{id, name, goal, state, originBoardId, startDate, endDate}`** object for created Sprint.
 */
export const createSprint = async(originBoardId, sprint) => {
  const bodyData = {
    name: sprint.name,
    goal: sprint.goal,
    originBoardId: originBoardId
  };

  const response = await requestJira(`/rest/agile/1.0/sprint`, {
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
 * Moves issues to sprint.
 *
 * Works either moving from backlog, either from other sprint.
 *
 * [Details](https://developer.atlassian.com/cloud/jira/software/rest/api-group-sprint/#api-rest-agile-1-0-sprint-sprintid-issue-post)
 * about used API call, parameters and returned object
 * @param sprintId is ID of sprint
 * @param issuesIds is array of IDs of issues that need to be moved to given sprint. Each ID is string.
 * *Example*: `["10078", "10002"]`.
 * @return {Promise<void>} **`{status, statusText}`** response object.
 */
export const moveIssuesToSprint = async(sprintId, issuesIds) => {
  const bodyData = {
    "issues": issuesIds
  };

  const response = await requestJira(`/rest/agile/1.0/sprint/${sprintId}/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  return response;
}