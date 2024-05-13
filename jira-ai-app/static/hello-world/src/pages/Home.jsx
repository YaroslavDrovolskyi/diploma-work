import {
  changeIssueParent, changeIssueSummaryDescription,
  createSubtask, createUserStory,
  deleteIssue,
  fetchAllBoardsForProject,
  fetchAllSubtasksForIssueForBoard,
  fetchIssueNewApi
} from "../requests/template_requests";
import {useEffect} from "react";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, convertPlainTextToADF, checkFieldsValidity} from "../requests/helpers.js";

export default function Home(){


  const loadData = async() => {

    /*

   Test to create subtask
    const createdSubtask = await createSubtask(10002, {
      task: "Task to get fresh AIR",
      description: "Open the window to get fresh\nAIR into your room"
    });
    console.log(`Created subtask: ${JSON.stringify(createdSubtask)}`);
 */

    /*
    const issue = await fetchIssueNewApi("TP-67");
    console.log(`Fetched issue: ${JSON.stringify(issue)}`);

     */

//    const allSubtasks = await fetchAllSubtaskForIssueForBoard("1", "10011");
//    console.log(`All subtasks: ${JSON.stringify(allSubtasks)}`);

//    await deleteIssue('TP-37');

    /*
    const createdUserStory = await createUserStory({
      summary: 'Summary of newly created UserStory',
      description: '1 2 \n3 \n 4 5\n6'
    });
    console.log(JSON.stringify(createdUserStory));

     */

    /*
    const createdSubtask = await createSubtask(10067, {
      task: 'Summary of\nnewly created Subtask',
      description: '1 2 \n3 \n 4 5\n6'
    });
    console.log(JSON.stringify(createdSubtask));

     */

    /*
    await deleteIssue('TP-69');
    await deleteIssue('TP-32');
    await deleteIssue('TP-71');

     */

    /*
    const response = await changeIssueParent("10069", "10067");
    console.log(`Response: ${response.status} ${response.statusText}`);
    
     */

    /*
    const response = await changeIssueSummaryDescription("10084", "New summary\nTP-85", "New" +
      "\ndescription\nOK");
    console.log(`Response: ${response.status} ${response.statusText}`);

     */
  };

//  const adf = convertPlainTextToADF("1 2 \n3 \n 4 5\n6");
//  console.log(JSON.stringify(adf));

  testHandleGeminiAnswer();

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);


  const selectedIssue = {
    id: "100",
    key: "TP-100",
    summary: "Some summary of selected issue",
    description: "Some description of selected issue"
  };

  const otherIssues = [
    {
      id: "1001",
      summary: "summary-1001",
      description: "description-1001\nSome description-1001"
    },
    {
      id: "1002",
      summary: "summary-1002",
      description: "description-1002\nSome description-1002"
    },
    {
      id: "1003",
      summary: "summary-1003",
      description: "description-1003\nSome description-1003"
    },
    {
      id: "1004",
      summary: "summary-1004",
      description: "description-1004\nSome description-1004"
    },
    {
      id: "1005",
      summary: "summary-1005",
      description: "description-1005\nSome description-1005"
    }
  ];



  const answerSplit = {
    action: "SPLIT",
    parts: [
      {
        summary: "summary 1",
        description: "description 1\ndescription 1 line 2"
      },
      {
        summary: "summary 2",
        description: "description 2"
      },
      {
        summary: "summary 3",
        description: "description 3"
      },
      {
        summary: "summary 4",
        description: "description 4"
      },
      {
        summary: "summary 5",
        description: "description 5"
      }
    ]
  };


  const answerMerge = {
    action: "MERGE",
    id: "1005",
    summary: "summary\n of merged issue",
    description: "description\nof merged issue"
  }

  const answerDelete = {
    action: "DELETE",
    reason: "Some reason line 1\nSome reason line 2"
  };

  const answerFix = {
    action: "FIX",
    summary: "new summary line 1\nnew summary line 2",
    description: "new description line 1\nnew description line 2"
  }



/*
  return(
    <>
      <DisplayRefinementSplitAdviceComponent selectedIssue={selectedIssue} answer={answerSplit}/>
    </>
  );

 */

/*
  return(
    <>
      <DisplayRefinementMergeAdviceComponent selectedIssue={selectedIssue} otherIssues={otherIssues} answer={answerMerge} />
    </>
  );
 */

/*
  return(
    <DisplayRefinementDeleteAdviceComponent selectedIssue={selectedIssue} answer={answerDelete}/>
  );

 */


  return(
    <DisplayRefinementFixAdviceComponent selectedIssue={selectedIssue} answer={answerFix}/>
  );


  /*
  return(
    <DisplayRefinementNoActionAdviceComponent selectedIssue={selectedIssue}/>
  )

   */
}

function DisplayRefinementSplitAdviceComponent({selectedIssue, answer}) {
  return (
    <>
      <h3>Generated advice (SPLIT):</h3>
      <form name="form-generated-advice-split-select-parts">
        <div className={"form-group container mb-3"}>
          <div className="row">
            <div className="col">

              {/* Display selected issue */}
              <b>Selected issue:</b>
              <div className={"row mb-3 border border-2 rounded"}>
                <div className="col">
                  <h4>{selectedIssue.key}</h4>
                  <p className={"mb-0"}><b>ID:</b> {selectedIssue.id}</p>
                  <p className={"mb-0"}><b>Summary:</b> {selectedIssue.summary}</p>
                  {selectedIssue.description !== undefined && selectedIssue.description !== null &&
                    <p className={"mb-0"}><b>Description:</b> {
                      convertJiraWikiMarkupToPlainText(selectedIssue.description)
                    }</p>
                  }
                </div>
              </div>

              {/* Display generated parts */}
              <b>Parts to be SPLIT into:</b>
              <p className={"mb-0"}>Select parts (at least 1) you want to create instead of selected issue. Apply is irreversible.</p>
              <p className={"mb-0"}>You can edit generated parts</p>
              <p>Applying of refinement is irreversible.
                After applying, <b>selected issue will be deleted</b>, its subtasks will become children of first selected part</p>
              {answer.parts.map((part, index) => (
                <div className={"row mb-3 border border-2 rounded"}>

                  {/* Column for checkbox */}
                  <div className="col-1 d-flex flex-row justify-content-center align-items-center">
                    <input className={"form-check-input"} type="checkbox"
                           id={`generated-advice-split-checkbox-part-${index}`}/>
                  </div>

                  {/* Column for part data */}
                  <div className="col">
                    <div className="row">
                      <h5>{index + 1}</h5>
                    </div>

                    {/* Summary */}
                    <div className="row mb-1">
                      <div className="col-2">
                        <b className={"mb-0"}>Summary:</b>
                      </div>
                      <div className="col">
                        <input type="text" className="form-control mb-0"
                               id={`generated-advice-split-summary-part-${index}`}
                               defaultValue={replaceNewlines(part.summary)}/>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="row">
                      <div className="col-2">
                        <b className={"mb-0"}>Description:</b>
                      </div>
                      <div className="col">
                            <textarea className="form-control mb-0"
                                      id={`generated-advice-split-description-part-${index}`}
                                      rows="3" defaultValue={part.description}/>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* NEED to make remark about what will be with subtasks of selected issue (after implementation)
                The best variant is to change parent of each generated subtask into first generated part*/}
              {/* NEED to make checkboxes what issues must be generated. Applying will be irreversible */}

              {/* When apply actions, need to take values from inputs, not from memory */}
            </div>
          </div>

          {/* Submit */}
          <div className={"row justify-content-center mt-2 mb-4"}>
            <div className="col-2 text-center">
              <input type="submit" value={"Apply!"} className={"btn btn-success form-control"}/>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function DisplayRefinementMergeAdviceComponent({selectedIssue, otherIssues, answer}){
  const issueToMergeWith = otherIssues.find((i) => i.id === answer.id);

  return(
    <>
      <h3>Generated advice (MERGE):</h3>
      <form name="form-generated-advice-merge-apply">
        <div className={"form-group container mb-3"}>
          <div className="row">
            <div className="col">

              {/* Display selected issue and issue it should be merged with */}
              <div className="row">

                {/* Display selected issue */}
                <div className="col mr-2">
                  <p className={"text-center mb-0"}><b className={"text-center"}>Selected issue</b></p>
                  <div className={"col mb-3 p-1 border border-2 rounded"}>
                    <p className={"mb-0"}><b>ID:</b> {selectedIssue.id}</p>
                    <p className={"mb-0"}><b>Summary:</b> {selectedIssue.summary}</p>
                    {selectedIssue.description !== undefined && selectedIssue.description !== null &&
                      <p className={"mb-0"}><b>Description:</b> {
                        convertJiraWikiMarkupToPlainText(selectedIssue.description)
                      }</p>
                    }
                  </div>
                </div>

                {/* Display issue to merge with */}
                <div className="col ml-2">
                  <p className={"text-center mb-0"}><b className={"text-center"}>Issue to merge with</b></p>
                  <div className={"col mb-3 p-1 border border-2 rounded"}>
                    <p className={"mb-0"}><b>ID:</b> {issueToMergeWith.id}</p>
                    <p className={"mb-0"}><b>Summary:</b> {issueToMergeWith.summary}</p>
                    {issueToMergeWith.description !== undefined && issueToMergeWith.description !== null &&
                      <p className={"mb-0"}><b>Description:</b> {
                        convertJiraWikiMarkupToPlainText(issueToMergeWith.description)
                      }</p>
                    }
                  </div>
                </div>
              </div>



              {/* Display generated merged issue*/}
              <div className="row">
                <div className="col">
                  <p className={"text-center mb-0"}><b className={"text-center"}>Generated merged issue</b></p>
                  <p className={"mb-0"}>Applying of refinement is irreversible.
                    After applying, this issue will be created, <b>both old issues will be deleted.</b></p>
                  <p className={"mb-0"}>Subtasks of deleted issues will become children of newly created issue.</p>
                  <p className={"mb-0"}>You can edit generated merged issue.</p>
                  <div className={"row mb-3 p-1 border border-2 rounded"}>
                    <div className="col">
                      {/* Summary */}
                      <div className="row mb-1">
                        <div className="col-2">
                          <b className={"mb-0"}>Summary:</b>
                        </div>
                        <div className="col">
                          <input type="text" className="form-control mb-0" id={`generated-advice-merge-summary`}
                                 defaultValue={replaceNewlines(answer.summary)}/>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="row">
                        <div className="col-2">
                          <b className={"mb-0"}>Description:</b>
                        </div>
                        <div className="col">
                            <textarea className="form-control mb-0" id={`generated-advice-merge-description`}
                                      rows="3" defaultValue={answer.description}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className={"row justify-content-center mt-2 mb-4"}>
            <div className="col-2 text-center">
              <input type="submit" value={"Apply!"} className={"btn btn-success form-control"}/>
            </div>
          </div>

        </div>
      </form>
    </>
  );
}


function DisplayRefinementDeleteAdviceComponent({selectedIssue, answer}){
  return(
    <>
      <h3>Generated advice (DELETE):</h3>
      <form name="form-generated-advice-delete-apply">
        <div className={"form-group container mb-3"}>

          {/* Display selected issue */}
          <div className="row">
            <div className="col">
              <p className={"text-center mb-0"}><b className={"text-center"}>Selected issue</b></p>
              <div className={"col mb-3 p-1 border border-2 rounded"}>
                <h4>{selectedIssue.key}</h4>
                <p className={"mb-0"}><b>ID:</b> {selectedIssue.id}</p>
                <p className={"mb-0"}><b>Summary:</b> {selectedIssue.summary}</p>
                {selectedIssue.description !== undefined && selectedIssue.description !== null &&
                  <p className={"mb-0"}><b>Description:</b> {
                    convertJiraWikiMarkupToPlainText(selectedIssue.description)
                  }</p>
                }
              </div>
            </div>
          </div>

          {/* Display generated advice */}
          <div className="row">
            <div className="col">
              <p className={"text-center mb-0"}><b className={"text-center"}>Generated advice</b></p>
              <p className={"mb-0"}><b>Advice:</b> Delete selected issue. Be careful, <b>deletion is irreversible</b>.</p>
              <p className={"mb-0"}>All issue subtasks also will be deleted.</p>
              <p className={"mb-0"}><b>Reason:</b> {replaceNewlines(answer.reason)}</p>
            </div>
          </div>

          {/* Submit */}
          <div className={"row justify-content-center mt-2 mb-4"}>
            <div className="col-2 text-center">
              <input type="submit" value={"Delete!"} className={"btn btn-danger form-control"}/>
            </div>
          </div>

        </div>
      </form>
    </>
  );
}

function DisplayRefinementFixAdviceComponent({selectedIssue, answer}) {
  return (
    <>
      <h3>Generated advice (FIX):</h3>
      <form name="form-generated-advice-fix-apply">
        <div className={"form-group container mb-3"}>

          {/* Display selected issue */}
          <div className="row">
            <div className="col">
              <p className={"text-center mb-0"}><b className={"text-center"}>Selected issue</b></p>
              <div className={"col mb-3 p-1 border border-2 rounded"}>
                <h4>{selectedIssue.key}</h4>
                <p className={"mb-0"}><b>ID:</b> {selectedIssue.id}</p>
                <p className={"mb-0"}><b>Summary:</b> {selectedIssue.summary}</p>
                {selectedIssue.description !== undefined && selectedIssue.description !== null &&
                  <p className={"mb-0"}><b>Description:</b> {
                    convertJiraWikiMarkupToPlainText(selectedIssue.description)
                  }</p>
                }
              </div>
            </div>
          </div>

          {/* Display generated merged issue*/}
          <div className="row">
            <div className="col">
              <p className={"text-center mb-0"}><b className={"text-center"}>Generated fixed issue and description</b>
              </p>
              <p className={"mb-0"}>Applying of refinement is irreversible.</p>
              <p className={"mb-0"}>You can edit generated summary and description.</p>
              <div className={"row mb-3 p-1 border border-2 rounded"}>
                <div className="col">
                  {/* Summary */}
                  <div className="row mb-1">
                    <div className="col-2">
                      <b className={"mb-0"}>Summary:</b>
                    </div>
                    <div className="col">
                      <input type="text" className="form-control mb-0" id={`generated-advice-fix-summary`}
                             defaultValue={replaceNewlines(answer.summary)}/>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="row">
                    <div className="col-2">
                      <b className={"mb-0"}>Description:</b>
                    </div>
                    <div className="col">
                            <textarea className="form-control mb-0" id={`generated-advice-fix-description`}
                                      rows="3" defaultValue={answer.description}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className={"row justify-content-center mt-2 mb-4"}>
            <div className="col-2 text-center">
              <input type="submit" value={"Apply!"} className={"btn btn-success form-control"}/>
            </div>
          </div>

        </div>
      </form>
    </>
  );
}

function DisplayRefinementNoActionAdviceComponent({selectedIssue}) {
  return (
    <>
      <h3>Generated advice (NO ACTION):</h3>

      <div className={"container mb-3"}>
        {/* Display selected issue */}
        <div className="row">
          <div className="col">
            <p className={"text-center mb-0"}><b className={"text-center"}>Selected issue</b></p>
            <div className={"col mb-3 p-1 border border-2 rounded"}>
              <h4>{selectedIssue.key}</h4>
              <p className={"mb-0"}><b>ID:</b> {selectedIssue.id}</p>
              <p className={"mb-0"}><b>Summary:</b> {selectedIssue.summary}</p>
              {selectedIssue.description !== undefined && selectedIssue.description !== null &&
                <p className={"mb-0"}><b>Description:</b> {
                  convertJiraWikiMarkupToPlainText(selectedIssue.description)
                }</p>
              }
            </div>
          </div>
        </div>

        {/* Display generated advice */}
        <div className="row">
          <div className="col">
            <p className={"text-center mb-0"}><b className={"text-center"}>Generated advice</b></p>
            <p className={"mb-0"}><b>Advice:</b> No action is recommended. Selected issue does not need refinement.</p>
          </div>
        </div>
      </div>
    </>
  );
}


// copy of part of generateIssueRefinementAdvice() function
// answer is gemini answer (string). Answer format is described in 'refinement-user-story.hbs' file
const handleGeminiAnswer = (answer) => {
  // parse text generated by Gemini
  try{
    const obj = JSON.parse(answer);

    // check "action" field
    if(!Object.hasOwn(obj, "action") ||
      !["SPLIT", "MERGE", "DELETE", "FIX", "NO_ACTION"].includes(obj.action)){
      return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
    }

    switch (obj.action) {
      case "SPLIT":{
        if(!Object.hasOwn(obj, "parts") || !Array.isArray(obj.parts)){
          return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
        }

        // filter obj.parts array to return only valid items
        let partNecessaryFields = [
          {field: "summary", type: "string"},
          {field: "description", type: "string"},
        ];
        let parts = [];
        for (const arrItem of obj.parts){
          if(checkFieldsValidity(arrItem, partNecessaryFields)){ // check if each expected field is present and has correct type
            parts.push(arrItem);
          }
          // otherwise, do not include current arrItem in result
        }

        if(parts.length < 2){
          return {ok: false, errorMessage: 'Number of generated parts is less than 2. Try again.'};
        }

        return {ok: true, answer: obj};
      }
      case "MERGE":{
        if(checkFieldsValidity(obj, [
          {field: "id", type: "string"}, // in .hbs, ID is as string (and also in JSON returned by Jira API)
          {field: "summary", type: "string"},
          {field: "description", type: "string"}
        ])){
          return {ok: true, answer: obj};
        }
        else{
          return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
        }
      }
      case "DELETE":{
        if(checkFieldsValidity(obj, [
          {field: "reason", type: "string"},
        ])){
          return {ok: true, answer: obj};
        }
        else{
          return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
        }
      }
      case "FIX":{
        if(checkFieldsValidity(obj, [
          {field: "summary", type: "string"},
          {field: "description", type: "string"}
        ])){
          return {ok: true, answer: obj};
        }
        else{
          return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
        }
      }
      case "NO_ACTION":{
        return {ok: true, answer: obj};
      }
      default:{ // we can't reach this, but just in case
        return {ok: false, errorMessage: 'Unknown refinement action. Try again.'};
      }

    }
  }
  catch(e){ // if answer is not an object
    return {ok: false, errorMessage: 'Something wrong happened. Try again.'};
  }
}


const testHandleGeminiAnswer = () => {
  // not object
  console.log(handleGeminiAnswer(" ").ok); // false
  console.log(handleGeminiAnswer(" efr").ok); // false

  console.log(handleGeminiAnswer("{}").ok); // false
  console.log(handleGeminiAnswer(JSON.stringify({
    action: "SOME_UNKNOWN_ACTION"
  })).ok); // false

  /* SPLIT */
  console.log("\nSPLIT");
  console.log("1\t" + handleGeminiAnswer(JSON.stringify({
    action: "SPLIT"
  })).ok); // false
  console.log("2\t" + handleGeminiAnswer(JSON.stringify({
    action: "SPLIT",
    parts: "string"
  })).ok); // false
  console.log("3\t" + handleGeminiAnswer(JSON.stringify({
    action: "SPLIT",
    parts: []
  })).ok); // false
  console.log("4\t" + handleGeminiAnswer(JSON.stringify({
    action: "SPLIT",
    parts: [
      {
        summary: 1,
        description: 1,
      },
      {
        summary: 2,
        description: 2,
      }
    ]
  })).ok); // false
  console.log("5\t" + handleGeminiAnswer(JSON.stringify({
    action: "SPLIT",
    parts: [
      {
        summary: "s1",
        description: "d1",
      },
      {
        summary: "s2",
        description: "d2",
      },
      {},
      {
        summary: 1,
        description: 1,
      },
      {
        summary: 1
      },
      {
        description: 1
      }
    ]
  })).ok); // true

  /* MERGE */
  console.log("\nMERGE");
  console.log("1\t" + handleGeminiAnswer(JSON.stringify({
    action: "MERGE"
  })).ok); // false
  console.log("2\t" + handleGeminiAnswer(JSON.stringify({
    action: "MERGE",
    id: 1,
    summary: 1,
    description: 5
  })).ok); // false
  console.log("3\t" + handleGeminiAnswer(JSON.stringify({
    action: "MERGE",
    id: "123",
    summary: "some summary"
  })).ok); // false
  console.log("4\t" + handleGeminiAnswer(JSON.stringify({
    action: "MERGE",
    id: "123",
    summary: "some summary",
    description: "some description"
  })).ok); // true

  /* DELETE */
  console.log("\nDELETE");
  console.log("1\t" + handleGeminiAnswer(JSON.stringify({
    action: "DELETE"
  })).ok); // false
  console.log("2\t" + handleGeminiAnswer(JSON.stringify({
    action: "DELETE",
    reason: 5
  })).ok); // false
  console.log("3\t" + handleGeminiAnswer(JSON.stringify({
    action: "DELETE",
    reason: "some reason"
  })).ok); // true

  /* FIX */
  console.log("\nFIX");
  console.log("1\t" + handleGeminiAnswer(JSON.stringify({
    action: "FIX"
  })).ok); // false
  console.log("2\t" + handleGeminiAnswer(JSON.stringify({
    action: "FIX",
    summary: 5,
    description: 5
  })).ok); // false
  console.log("3\t" + handleGeminiAnswer(JSON.stringify({
    action: "FIX",
    summary: "5",
  })).ok); // false
  console.log("4\t" + handleGeminiAnswer(JSON.stringify({
    action: "FIX",
    summary: "some summary",
    description: "some description"
  })).ok); // true

  /* NO_ACTION */
  console.log("\nNO_ACTION");
  console.log("1\t" + handleGeminiAnswer(JSON.stringify({
    action: "NO_ACTION"
  })).ok); // true



  /*
  "parts": [
    {
        "summary": "short description of current part",
        "description": "more detailed description of current part"
    },
    ...
  ]
   */
}
