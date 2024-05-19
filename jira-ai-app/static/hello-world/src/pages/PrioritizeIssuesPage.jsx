import {
  changeIssuePriority,
  fetchAllBoardsForProject,
  fetchAllNotClosedSprintsForBoard,
  fetchAllNotDoneStoriesTasksForBoard,
  fetchAllNotDoneStoriesTasksForBoardBacklog,
  fetchAllNotDoneStoriesTasksForSprint,
  fetchAllPrioritiesForProject,
  fetchCurrentProject,
  getIssueFieldByUntranslatedName
} from "../logic/jira_requests";
import {createEstimateIssuesPrompt, createPrioritizeIssuesPrompt} from "../logic/prompts_generators";
import {useEffect, useState} from "react";
import {requestJira} from "@forge/bridge";
import LoadingComponent from "./LoadingComponent";
import ReactDOM from "react-dom";
import DisplayMessageComponent from "./DisplayMessageComponent";
import {getValueInStorage, setValueInStorage} from "../logic/storage";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, isNonEmpty} from "../logic/helpers.js";
import {generateIssuesPriorities} from "../logic/gemini_requests";
import ErrorComponent from "./ErrorComponent";

// General flow: choose board, then choose either one of its sprints either backlog
export default function PrioritizeIssuesPage(){
  let estimateFieldId = null;

  let selectedBoardId = null;
  let sprintsForSelectedBoard = null; // array of {id, name, state, goal, originBoardId, ...} objects
  let availableIssuesGroups = null; // array of {id, name} objects
  let issues = null; // target issues
  let priorities = null; // all priorities for project

  const onBoardSelected = async(event) => {
    event.preventDefault();

    // display loading of sprints
    let parent = document.getElementById('generation-parameters-inputs-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // fetch sprints for selected board
    const selector = document.getElementById("select-board");
    selectedBoardId = selector.value;

    console.log(`Selected board with ID = ${selectedBoardId}`); /////

    sprintsForSelectedBoard = await fetchAllNotClosedSprintsForBoard(selectedBoardId);

    // render inputs for generation parameters
    ReactDOM.render(<GenerationParametersInputsComponent />, parent);
  }

  /**
   * Takes entered params, generates prompt and renders <DisplayGenerationResult/> component
   * @param event
   * @return {Promise<void>}
   */
  const onGenerationParamsSubmitted = async (event) => {
    event.preventDefault();

    // values of product and productVision inputs won't be 'Loading...',
    // because form submission becomes possible only after default data is downloaded

    /* Get input values */
    // get product
    const productInput = document.getElementById("product-input");
    const product = productInput.value;
    if(!isNonEmpty(product)){
      alert("Product field must be non-empty");
      return;
    }

    // get product vision
    const productVisionInput = document.getElementById("product-vision-input");
    if(!isNonEmpty(productVisionInput.value)){
      alert("Product vision field must be non-empty");
      return;
    }
    const productVision = replaceNewlines(productVisionInput.value);


    // get ID of issues' group
    const issuesGroupsSelector = document.getElementById("select-issues-group");
    const selectedIssuesGroupId = issuesGroupsSelector.value;

    console.log(`Selected issuesGroup with ID = ${selectedIssuesGroupId}`); /////

    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // get issues
    if(selectedIssuesGroupId === "BACKLOG"){
      // fetch issues from board's backlog
      issues = await fetchAllNotDoneStoriesTasksForBoardBacklog(selectedBoardId);
    }
    else{
      // fetch issues from selected sprint
      issues = await fetchAllNotDoneStoriesTasksForSprint(selectedIssuesGroupId);
    }

//    console.log(`Issues from selected issuesGroup: ${JSON.stringify(issues)}`); ///////////////////////////////////////////

    if(issues.length === 0){
      ReactDOM.render(<DisplayMessageComponent heading={"No issues found"}
                                               message={"Can't proceed, because no issues found. " +
                                                 "If you want to continue, create some user story (or task) " +
                                                 "or select backlog/other sprint"}/>,
        parent);
      return;
    }

    // get ID of issue's "estimate" field
    estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;

    // format issues (make simpler structure)
    const issuesFormatted = issues.map((i) => {
      let summary = i?.fields?.summary;
      if(summary === undefined || summary === null){
        summary = '';
      }

      let description = i?.fields?.description;
      description = ((description !== undefined) && (description !== null))
        ? convertJiraWikiMarkupToPlainText(description)
        : '';

      let issue = {
        id: i.id,
        key: i.key,
        summary: summary,
        description: description
      };

      if(i.fields[`${estimateFieldId}`] !== null){
        issue.estimate = i.fields[`${estimateFieldId}`];
      }

      return issue;
    });


    // get all priorities for project
    const currentProject = await fetchCurrentProject();
    priorities = await fetchAllPrioritiesForProject(currentProject.id);

    // format priorities (make simpler structure)
    const prioritiesFormatted = priorities.map(p => {
      return {
        id: p.id,
        name: p.name
      };
    });


    // generate prompt
    const prompt = await createPrioritizeIssuesPrompt(product, productVision,
      JSON.stringify(prioritiesFormatted), JSON.stringify(issuesFormatted));

//    console.log(prompt); //////////////////////////////////////////////////////////////////////////////


    // save fields in storage
    await setValueInStorage('product', product);
    await setValueInStorage('product-vision', productVision);


    // render result
    ReactDOM.render(<DisplayGenerationResult prompt={prompt} />, parent);
  }


  const onSelectedApplyingPrioritiesSubmitted = async (event) => {
    event.preventDefault();

    // get selected issues IDs
    const checkedCheckBoxes = Array.from(document.querySelectorAll(
      '.apply-issue-changes-checkbox:checked'));
    const selectedIssuesIDs = checkedCheckBoxes.map(b => b.value);
    console.log(`Selected Issues IDs: ${JSON.stringify(selectedIssuesIDs)}`); /////

    if(selectedIssuesIDs.length < 1){
      alert("Please, select at least one issue");
      return;
    }

    // get submitted assignations
    const priorityAssignations = selectedIssuesIDs.map(issueId => {
      return{
        issueId: issueId,
        priorityId: document.getElementById(`select-priority-for-issue-${issueId}`).value
      }
    })

    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // apply new priorities
    for(const assignation of priorityAssignations){
      await changeIssuePriority(assignation.issueId, assignation.priorityId);
    }


    // display success message
    ReactDOM.render(<DisplayMessageComponent heading={'Priorities applied!'}
                                             message={`Applied priorities successfully!`}/>,
      parent);
  }


  /* The basis of page */
  return(
    <div className={"p-2 pb-5"}>
      <h1 className={"text-center"}>Prioritize user stories / tasks</h1>

      <SelectBoardComponent/>

      <div id={"generation-parameters-inputs-component-parent"}>
      </div>

      <div id={"display-generation-result-component-parent"}>
      </div>
    </div>
  );


  /**
   * Fetches all boards, and give user possibility to select one of boards.
   *
   * After board is selected and form is submitted, invokes **`onBoardSelected()`** function.
   * @return {JSX.Element}
   * @constructor
   */
  function SelectBoardComponent() {
    const [boards, setBoards] = useState(null);


    const loadData = async() => {
      setBoards(await fetchAllBoardsForProject());
    };

    useEffect(() => {
      loadData();
    }, []);


    if(boards === null){
      return(
        <>
          <LoadingComponent/>
        </>
      )
    }

    if(boards.length === 0){
      return(
        <>
          <DisplayMessageComponent heading={'No boards exist'} message={'No board found'}/>
        </>
      )
    }

    return(
      <>
        {/* Select board */}
        <form name="form-select-board" onSubmit={onBoardSelected}>
          <div className={"form-group container"}>

            <div className={"row mb-1"}>
              <label className="col-2 text-end">Board:</label>
              <select id={"select-board"} name={"select-board"} className={"form-select col"}>
                {boards.map((board) => (
                  <option value={board.id}>{board.name}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className={"row justify-content-center mt-2 mb-4"}>
              <div className="col-2 text-center">
                <input type="submit" value={"Select!"} className={"btn btn-success form-control"}/>
              </div>
            </div>

          </div>
        </form>
      </>
    )
  }


  /**
   * Give user possibility to select one of issues groups, enter `product` and `productVision` params.
   *
   * After parameters are entered and form is submitted, invokes **`onGenerationParamsSubmitted()`** function.
   * @return {JSX.Element}
   * @constructor
   */
  function GenerationParametersInputsComponent(){
    // "group of issues" is either backlog, either one of sprints

    /* collect all available groups of issues */
    availableIssuesGroups = [
      {
        id: "BACKLOG",
        name: "Backlog"
      }
    ];

    // append ID and name of each sprint
    availableIssuesGroups = availableIssuesGroups.concat(
      sprintsForSelectedBoard.map(s => {
        return {
          id: s.id,
          name: s.name
        }
      })
    );


    /* Handle values from storage */
    // null is not loaded, undefined or value is OK to display
    const [product, setProduct] = useState(null);
    const [productVision, setProductVision] = useState(null);

    const fetchProduct = async() => {
      let p = await getValueInStorage('product');
      if(p === undefined || p === null || isEmpty(p)){ // not stored in storage
        const currentProject = await fetchCurrentProject();
        p = currentProject.name;
      }
      return p;
    }

    const fetchProductVision = async() => {
      let pv = await getValueInStorage('product-vision');
      if(pv !== undefined && pv !== null && !isEmpty(pv)){ // stored in storage
        return pv;
      }
      return undefined;
    }


    const loadData = async() => {
      // load from storage
      setProduct(await fetchProduct());
      setProductVision(await fetchProductVision());
    };


    useEffect(() => {
      loadData();
    }, []);


    return(
      <>
        {/* Input params */}
        <form name="form-generation-parameters-inputs" onSubmit={onGenerationParamsSubmitted}>
          <div className={"form-group container"}>

            {/* Issue group (choose backlog or one of sprints) */}
            <div className={"row mb-1"}>
              <label className="col-2 text-end">Issue group:</label>
              <select id={"select-issues-group"} name={"select-issues-group"} className={"form-select col"}>
                {availableIssuesGroups.map((g) => (
                  <option value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div className={"row mb-1"}>
              <label htmlFor="product-input" className="col-2 text-end">Product:</label>
              {product === null ? (
                <input type="text" className="form-control col mb-2" id="product-input" value={"Loading..."} disabled/>
              ) : (
                <>
                  {product === undefined ? (
                    <input type="text" className="form-control col mb-2" id="product-input"/>
                  ) : (
                    <input type="text" className="form-control col mb-2" id="product-input" defaultValue={product}/>
                  )}
                </>
              )}
            </div>

            {/* Product vision */}
            <div className={"row mb-1"}>
              <label htmlFor="product-vision-input" className="col-2 text-end">Product vision:</label>
              {productVision === null ? (
                <textarea className="form-control col mb-2" id="product-vision-input" rows="3" value={"Loading..."} disabled/>
              ) : (
                <>
                  {productVision === undefined ? (
                    <textarea className="form-control col mb-2" id="product-vision-input" rows="3"/>
                  ) : (
                    <textarea className="form-control col mb-2" id="product-vision-input" rows="3" defaultValue={productVision}/>
                  )}
                </>
              )}
            </div>


            {/* Submit */}
            {/* DO not display 'Submit' button until all values will be downloaded */}
            {product !== null && productVision !== null && (
              <div className={"row justify-content-center mt-2 mb-4"}>
                <div className="col-2 text-center">
                  <input type="submit" value={"Generate!"} className={"btn btn-success form-control"}/>
                </div>
              </div>
            )}

          </div>
        </form>
      </>
    )
  }


  /**
   * Make request to Gemini and display result.
   *
   * @param prompt is prompt for Gemini
   * @param issues is issues from backlog
   * @return {JSX.Element}
   * @constructor
   */
  function DisplayGenerationResult({prompt}){
    const [response, setResponse] = useState(null);

    const loadData = async() => {
      setResponse(await generateIssuesPriorities(prompt));
    };

    useEffect(() => {
      loadData();
    }, []);


    // returns priority if Gemini has generated priority, or null if not
    // generatedPrioritiesAssignations is array of {issueId, priorityId} objects
    const findGeneratedPriorityForIssue = (issueId, generatedPrioritiesAssignations) => {
      const pa = generatedPrioritiesAssignations.find(a => a.issueId === issueId)
      if(pa === undefined){
        return null;
      }

      return priorities.find(p => p.id === pa.priorityId);
    }

    /* Display result */

    // if answer not loaded yet
    if(response === null){
      return(
        <LoadingComponent/>
      );
    }

    console.log(`Response from Gemini: ${JSON.stringify(response)}`); /////


    if(!response.ok){
      return(
        <ErrorComponent errorMessage={response.errorMessage}/>
      )
    }


    // process response.answer
    const answer = response.answer // array of {userStoryId, priorityId} object


    

    // filter answer to get only objects with existent IDs
    const issuesIDs = issues.map(i => i.id);
    const prioritiesIDs = priorities.map(p => p.id);

    let generatedPrioritiesAssignations = answer.filter(pa => {
      return issuesIDs.includes(pa.userStoryId) && prioritiesIDs.includes(pa.priorityId);
    });

    generatedPrioritiesAssignations = generatedPrioritiesAssignations.map(pa => {
      return{
        issueId: pa.userStoryId,
        priorityId: pa.priorityId
      }
    });

    console.log(`generatedPrioritiesAssignations (by Gemini): ${JSON.stringify(generatedPrioritiesAssignations)}`); //////////////////////////////////////////////


    return(
      <>
        <h3>Apply priorities:</h3>
        <form name="form-apply-generated-priorities" onSubmit={onSelectedApplyingPrioritiesSubmitted}>
          <div className={"form-group container mb-3"}>
            <div className="row">
              <div className="col">

                {/* Display issues, and check selected ones by Gemini */}
                {generatedPrioritiesAssignations.length > 0 ? (
                  <>
                    <p className={"mb-0"}>Priorities, suggested by Gemini, are displayed.</p>
                  </>
                ) : (
                  <>
                    <p className={"mb-0"}>Sorry, but Gemini haven't generate priorities for some reason.</p>
                    <p className={"mb-0"}>You can set your own priorities, or re-generate answer.</p>
                  </>
                )}
                <p>Set priorities and select User stories (or Tasks) to which changes should be applied.</p>

                {/* Issue tile */}
                {issues.map((issue) => (
                  <div className={"row mb-3 border border-2 rounded"}>

                    {/* Column for checkbox */}
                    <div className="col-1 d-flex flex-row justify-content-center align-items-center">
                      <input className={"apply-issue-changes-checkbox"} type="checkbox"
                             value={`${issue.id}`} defaultChecked/>
                    </div>

                    {/* Column for issue data */}
                    <div className="col">
                      <h4>{issue.key}</h4>
                      <p className={"mb-0"}><b>ID:</b> {issue.id}</p>
                      <p className={"mb-0"}><b>Summary:</b> {issue.fields.summary}</p>
                      <p className={"mb-0"}><b>Type:</b> {issue.fields.issuetype.name}</p>
                      <p className={"mb-0"}><b>Status:</b> {issue.fields.status.name}</p>
                      {issue.fields.description !== undefined && issue.fields.description != null &&
                        <p className={"mb-0"}><b>Description:</b> {
                          convertJiraWikiMarkupToPlainText(issue.fields.description)
                        }</p>
                      }
                      {/* <p className={"mb-0"}><b>Priority:</b> {issue.fields.priority.name}</p> */}
                      {issue.fields[`${estimateFieldId}`] !== undefined && issue.fields[`${estimateFieldId}`] !== null && (
                        <p className={"mb-0"}><b>Estimation:</b> {issue.fields[`${estimateFieldId}`]} story point(s)</p>
                      )}

                      {/* Display (in 3 columns): current priority, priority generated by Gemini, selected priority for issue */}
                      <div className={"row"}>
                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Current priority</b></p>
                          <p className={"text-center"}>{issue.fields.priority.name}</p>
                        </div>

                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Generated priority</b></p>
                          <p className={"text-center"}>
                            {findGeneratedPriorityForIssue(issue.id, generatedPrioritiesAssignations) !== null ?
                              findGeneratedPriorityForIssue(issue.id, generatedPrioritiesAssignations).name : "—"}
                          </p>
                        </div>

                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Selected priority</b></p>
                          <select id={`select-priority-for-issue-${issue.id}`} className={"form-select col"}>
                            {priorities.map((priority) => (
                              <PropertyOptionTag issue={issue} priority={priority}
                                                 generatedPrioritiesAssignations={generatedPrioritiesAssignations}/>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Submit */}
            <div className={"row justify-content-center mt-2 mb-4"}>
              <div className="col-2 text-center">
                <input type="submit" value={"Apply priorities!"} className={"btn btn-success form-control"}/>
              </div>
            </div>

          </div>
        </form>
      </>
    );


    // priority is current priority
    function PropertyOptionTag({priority, issue, generatedPrioritiesAssignations}){
      const generatedPriorityForIssue = findGeneratedPriorityForIssue(issue.id, generatedPrioritiesAssignations);

      if(generatedPriorityForIssue !== null){
        if(generatedPriorityForIssue.id === priority.id){
          return(
            <option value={priority.id} selected={true}>{priority.name}</option>
          );
        }
        else{
          return(
            <option value={priority.id}>{priority.name}</option>
          );
        }
      }
      else{
        if(priority.id === issue.fields.priority.id){
          return(
            <option value={priority.id} selected={true}>{priority.name}</option>
          );
        }
        else{
          return(
            <option value={priority.id}>{priority.name}</option>
          );
        }
      }
    }
  }


}