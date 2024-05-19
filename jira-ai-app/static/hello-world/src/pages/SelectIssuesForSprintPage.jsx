import {useEffect, useState} from "react";
import {createSelectIssuesForSprintPrompt} from "../logic/prompts_generators";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, isNonEmpty} from "../logic/helpers.js";
import {
  createSprint,
  fetchAllBoardsForProject,
  fetchAllNotDoneStoriesTasksForBoard,
  fetchAllNotDoneStoriesTasksForBoardBacklog,
  fetchCurrentProject,
  getIssueFieldByUntranslatedName,
  moveIssuesToSprint
} from "../logic/jira_requests";
import ReactDOM from "react-dom";
import LoadingComponent from "./LoadingComponent";
import {getValueInStorage, setValueInStorage} from "../logic/storage";
import {generateIssueRefinementAdvice, generateIssueSelectionForSprint} from "../logic/gemini_requests";
import ErrorComponent from "./ErrorComponent";
import DisplayMessageComponent from "./DisplayMessageComponent";

export default function SelectIssuesForSprintPage(){
  let selectedBoardId = null;
  let sprintGoal = null;

  // is ID of issue's field that contains estimation of issue.
  // It is necessary, because can't use hardcoded ID for custom fields, because it may be different on every instance
  let estimateFieldId = null;

  const onGenerationParamsSubmitted = async(event) => {
    event.preventDefault();

    // values of product and productVision inputs won't be 'Loading...',
    // because form submission becomes possible only after default data is downloaded

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

    // get sprint goal
    const sprintGoalInput = document.getElementById("sprint-goal-input");
    sprintGoal = sprintGoalInput.value;
    if(!isNonEmpty(sprintGoal)){
      alert("Sprint goal must be non-empty");
      return;
    }

    // get sprint duration
    const sprintDurationInput= document.getElementById("sprint-duration-input");
    const sprintDuration = sprintDurationInput.value;

    // get max issues number
    const teamMembersNumberInput= document.getElementById("team-members-number-input");
    const teamMembersNumber = teamMembersNumberInput.value;

    // get board ID
    const boardSelector = document.getElementById("select-board");
    selectedBoardId = boardSelector.value;



    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);


    // get ID of issue's "estimate" field
    estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;

    // get issues
    const issues = await fetchAllNotDoneStoriesTasksForBoardBacklog(selectedBoardId);

    if(issues.length === 0){
      ReactDOM.render(<DisplayMessageComponent heading={"Backlog is empty"}
                                               message={"Can't proceed, because backlog is empty. " +
                                                 "If you want to continue, create some user story (or task) or select other board"}/>,
        parent);
      return;
    }

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
        summary: summary,
        description: description,
        priority: i.fields.priority.name
      };

      if(i.fields[`${estimateFieldId}`] !== null){
        issue.estimate = i.fields[`${estimateFieldId}`];
      }

      return issue;
    });


    // generate prompt
    const prompt = await createSelectIssuesForSprintPrompt(product, productVision,
      sprintGoal, sprintDuration, teamMembersNumber, JSON.stringify(issuesFormatted));



    // save fields in storage
    await setValueInStorage('product', product);
    await setValueInStorage('product-vision', productVision);


    // render result
    ReactDOM.render(<DisplayGenerationResult prompt={prompt} issues={issues}/>, parent);
  }

  /**
   * Creates sprint from selected issues
   * @param event
   * @return {Promise<void>}
   */
  const onSelectedIssuesForSprintSubmitted = async(event) => {
    event.preventDefault();

    // get selected issues IDs
    const checkedCheckBoxes = Array.from(document.querySelectorAll(
      '.issue-take-in-sprint-checkbox:checked'));
    const selectedIssuesIDs = checkedCheckBoxes.map(b => b.value);

    console.log(`Selected Issues IDs: ${JSON.stringify(selectedIssuesIDs)}`); /////

    if(selectedIssuesIDs.length < 1){
      alert("Please, select at least one issue");
      return;
    }

    // get sprint name
    const sprintNameInput = document.getElementById("sprint-name-input");
    const sprintName = sprintNameInput.value;
    if(!isNonEmpty(sprintName)){
      alert("Sprint name must be non-empty");
      return;
    }

    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);


    // create sprint
    const createdSprint = await createSprint(selectedBoardId, {
      name: sprintName,
      goal: sprintGoal
    });

    // move selected issues to createdSprint
    await moveIssuesToSprint(createdSprint.id, selectedIssuesIDs);


    // display success message
    ReactDOM.render(<DisplayMessageComponent heading={'Sprint is created!'}
                                             message={`Successfully created Sprint ${createdSprint.id} "${createdSprint.name}"\
                                              with selected ${selectedIssuesIDs.length} issue(s)`}/>,
      parent);
  }





  // The basis of whole page
  return(
    <div className={"p-2 pb-5"}>
      <h1 className={"text-center"}>Select user stories / tasks for sprint</h1>

      <GenerationParametersInputsComponent/>

      <div id={"display-generation-result-component-parent"}>
      </div>
    </div>
  );

  function GenerationParametersInputsComponent() {
    const [boards, setBoards] = useState(null);

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
      setBoards(await fetchAllBoardsForProject());

      // load from storage
      setProduct(await fetchProduct());
      setProductVision(await fetchProductVision());
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
        {/* Input params */}
        <form name="form-generation-parameters-inputs" onSubmit={onGenerationParamsSubmitted}>
          <div className={"form-group container"}>

            {/* Board */}
            <div className={"row mb-1"}>
              <label className="col-2 text-end">Board:</label>
              <select id={"select-board"} name={"select-board"} className={"form-select col"}>
                {boards.map((board) => (
                  <option value={board.id}>{board.name}</option>
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

            {/* Sprint goal */}
            <div className={"row mb-1"}>
              <label htmlFor="sprint-goal-input" className="col-2 text-end">Sprint goal:</label>
              <input type="text" className="form-control col mb-2" id="sprint-goal-input"/>
            </div>

            {/* Sprint duration (weeks) */}
            <div className={"row mb-1"}>
              <label htmlFor="sprint-duration-input" className="col-2 text-end">Sprint duration (weeks):</label>
              <input id="sprint-duration-input" type="number" min={1} step={1} defaultValue={1} className="form-control col"/>
            </div>

            {/* Max numer of issues to take in sprint */}
            <div className={"row mb-1"}>
              <label htmlFor="team-members-number-input" className="col-2 text-end">Number of team members are going to take part in sprint:</label>
              <input id="team-members-number-input" type="number" min={1} step={1} defaultValue={1} className="form-control col"/>
            </div>


            {/* Submit */}
            {/* DO not display 'Submit' button until all values will be downloaded */}
            {boards !== null && product !== null && productVision !== null && (
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
  function DisplayGenerationResult({prompt, issues}){
    const [response, setResponse] = useState(null);

    const loadData = async() => {
      setResponse(await generateIssueSelectionForSprint(prompt));
    };

    useEffect(() => {
      loadData();
    }, []);

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
    const answer = response.answer // array of {id} objects

    // filter answer to get only objects with existent IDs
    const issuesIDs = issues.map(i => i.id);
    const selectedIssues = answer.filter(i => issuesIDs.includes(i.id)); // array of {id} objects
    const selectedIssuesIDs = selectedIssues.map(i => i.id);

    console.log(`Selected issues IDs (by Gemini): ${JSON.stringify(selectedIssuesIDs)}`); //////////////////////////////////////////////


    return(
      <>
        <h3>Create sprint (from selected issues):</h3>
        <form name="form-apply-selected-issues-for-sprint" onSubmit={onSelectedIssuesForSprintSubmitted}>
          <div className={"form-group container mb-3"}>
            <div className="row">
              <div className="col">

                {/* Display issues, and check selected ones by Gemini */}
                {selectedIssuesIDs.length > 0 ? (
                  <>
                    <p className={"mb-0"}>Issues, selected by Gemini, is marked (green background) and checked.</p>
                  </>
                ) : (
                  <p className={"mb-0"}>Gemini didn't select any issue.</p>
                )}
                <p>You can check/uncheck any issue, but at least one should be checked to create sprint</p>

                {/* Issue tile */}
                {issues.map((issue) => (
                  <div className={"row mb-3 border border-2 rounded"}>

                    {/* Column for checkbox */}
                    {selectedIssuesIDs.includes(issue.id) ? (
                      <div className="col-1 d-flex flex-row justify-content-center align-items-center" style={{'background-color': '#ccffcc'}}>
                        <input className={"form-check-input issue-take-in-sprint-checkbox"} type="checkbox"
                               value={`${issue.id}`} defaultChecked/>
                      </div>
                    ) : (
                      <div className="col-1 d-flex flex-row justify-content-center align-items-center">
                        <input className={"form-check-input issue-take-in-sprint-checkbox"} type="checkbox"
                               value={`${issue.id}`}/>
                      </div>
                    )}

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
                      <p className={"mb-0"}><b>Priority:</b> {issue.fields.priority.name}</p>
                      {issue.fields[`${estimateFieldId}`] !== undefined && issue.fields[`${estimateFieldId}`] !== null && (
                        <p className={"mb-0"}><b>Estimation:</b> {issue.fields[`${estimateFieldId}`]} story point(s)</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Sprint name input */}
                <div className={"row mb-1"}>
                  <label htmlFor="sprint-name-input" className="col-2 text-end">Sprint name:</label>
                  <input type="text" className="form-control col mb-2" id="sprint-name-input"/>
                </div>

              </div>
            </div>

            {/* Submit */}
            <div className={"row justify-content-center mt-2 mb-4"}>
              <div className="col-2 text-center">
                <input type="submit" value={"Create sprint!"} className={"btn btn-success form-control"}/>
              </div>
            </div>

          </div>
        </form>
      </>
    );
  }
}