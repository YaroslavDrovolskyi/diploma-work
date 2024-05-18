import {
  changeIssuePriority, changeIssueStoryPointEstimate,
  fetchAllBoardsForProject,
  fetchAllNotClosedSprintsForBoard,
  fetchAllNotDoneStoriesTasksForBoardBacklog,
  fetchAllNotDoneStoriesTasksForSprint,
  fetchAllPrioritiesForProject,
  fetchCurrentProject,
  getIssueFieldByUntranslatedName
} from "../requests/template_requests";
import LoadingComponent from "./LoadingComponent";
import DisplayMessageComponent from "./DisplayMessageComponent";
import {useEffect, useState} from "react";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, isNonEmpty} from "../requests/helpers.js";
import ReactDOM from "react-dom";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {createEstimateIssuesPrompt, createPrioritizeIssuesPrompt} from "../requests/prompts_generators";
import {generateIssuesEstimates} from "../requests/gemini_requests";
import ErrorComponent from "./ErrorComponent";


export default function EstimateIssuesPage() {
  let estimateFieldId = null;

  let selectedBoardId = null;
  let sprintsForSelectedBoard = null; // array of {id, name, state, goal, originBoardId, ...} objects
  let availableIssuesGroups = null; // array of {id, name} objects
  let issues = null; // target issues



  /* Handlers */
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
        description: description,
        priority: i.fields.priority.name
      };

      if(i.fields[`${estimateFieldId}`] !== null){
        issue.estimate = i.fields[`${estimateFieldId}`];
      }

      return issue;
    });



    // generate prompt
    const prompt = await createEstimateIssuesPrompt(product, productVision,
      JSON.stringify(issuesFormatted));

//    console.log(prompt); //////////////////////////////////////////////////////////////////////////////


    // save fields in storage
    await setValueInStorage('product', product);
    await setValueInStorage('product-vision', productVision);


    // render result
    ReactDOM.render(<DisplayGenerationResult prompt={prompt} />, parent);
  }



  const onSelectedApplyingEstimatesSubmitted = async (event) => {
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

    // get submitted estimates
    const estimateAssignations = selectedIssuesIDs.map(issueId => {
      return{
        issueId: issueId,
        estimate: parseInt(document.getElementById(`input-estimate-for-issue-${issueId}`).value)
      }
    });

    console.log(`Applied estimation assignations: ${JSON.stringify(estimateAssignations)}`); /////

    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // apply new estimates
    for(const assignation of estimateAssignations){
      const newEstimate = (assignation.estimate === -1) ? null : assignation.estimate;
      await changeIssueStoryPointEstimate(assignation.issueId, newEstimate);
    }


    // display success message
    ReactDOM.render(<DisplayMessageComponent heading={'Estimates applied!'}
                                             message={`Applied estimates successfully!`}/>,
      parent);
  }







  /* The basis of page */
  return(
    <div className={"p-2 pb-5"}>
      <SelectBoardComponent/>

      <div id={"generation-parameters-inputs-component-parent"}>
      </div>

      <div id={"display-generation-result-component-parent"}>
      </div>
    </div>
  );


  /* Components */

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
      setResponse(await generateIssuesEstimates(prompt));
    };

    useEffect(() => {
      loadData();
    }, []);


    // returns estimate if Gemini has generated estimate, or null if not
    // generatedEstimatesAssignations is array of {issueId, estimate} objects
    const findGeneratedEstimateForIssue = (issueId, generatedEstimatesAssignations) => {
      const pa = generatedEstimatesAssignations.find(a => a.issueId === issueId);
      if(pa === undefined){
        return null;
      }
      return pa.estimate;
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
    const answer = response.answer; // array of {userStoryId, estimate} object; estimate is number


    // filter answer to get only objects with existent IDs, ande where
    const issuesIDs = issues.map(i => i.id);

    let generatedEstimatesAssignations = answer.filter(pa => {
      return issuesIDs.includes(pa.userStoryId) && Number.isInteger(pa.estimate) && pa.estimate > 0;
      /*
      if(issuesIDs.includes(pa.userStoryId)){
        let estimate = parseInt(pa.estimate);
        if(!isNaN(estimate) && estimate > 0){
          return true;
        }
      }
      return false;
      */
    });

    generatedEstimatesAssignations = generatedEstimatesAssignations.map(pa => {
      return{
        issueId: pa.userStoryId,
        estimate: pa.estimate
      }
    });

    console.log(`generatedEstimatesAssignations (by Gemini): ${JSON.stringify(generatedEstimatesAssignations)}`); //////////////////////////////////////////////


    return(
      <>
        <h3>Apply priorities:</h3>
        <form name="form-apply-generated-priorities" onSubmit={onSelectedApplyingEstimatesSubmitted}>
          <div className={"form-group container mb-3"}>
            <div className="row">
              <div className="col">

                {/* Display issues, and check selected ones by Gemini */}
                {generatedEstimatesAssignations.length > 0 ? (
                  <>
                    <p className={"mb-0"}>Estimates, suggested by Gemini, are displayed.</p>
                  </>
                ) : (
                  <>
                    <p className={"mb-0"}>Sorry, but Gemini haven't generate estimates for some reason.</p>
                    <p className={"mb-0"}>You can set your own estimates, or re-generate answer.</p>
                  </>
                )}
                <p>Set estimates and select User stories (or Tasks) to which changes should be applied.</p>

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
                      <p className={"mb-0"}><b>Priority:</b> {issue.fields.priority.name}</p>
                      {/* issue.fields[`${estimateFieldId}`] !== undefined && issue.fields[`${estimateFieldId}`] !== null && (
                        <p className={"mb-0"}><b>Estimation:</b> {issue.fields[`${estimateFieldId}`]} story point(s)</p>
                      ) */}

                      {/* Display (in 3 columns): current estimate, estimate generated by Gemini, selected estimate for issue */}
                      <div className={"row mt-2"}>
                        <p className={"text-center mb-0"}><b>Estimates</b> (in story points)</p>

                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Current estimate</b></p>
                          {issue.fields[`${estimateFieldId}`] !== undefined && issue.fields[`${estimateFieldId}`] !== null ? (
                            <p className={"text-center mb-0"}>{issue.fields[`${estimateFieldId}`]}</p>
                          ) : (
                            <p className={"text-center mb-0"}>—</p>
                          )}
                        </div>

                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Generated estimate</b></p>
                          <p className={"text-center"}>
                            {findGeneratedEstimateForIssue(issue.id, generatedEstimatesAssignations) !== null ?
                              findGeneratedEstimateForIssue(issue.id, generatedEstimatesAssignations) : "—"}
                          </p>
                        </div>

                        <div className={"col-4"}>
                          <p className={"text-center"}><b>Selected estimate</b></p>
                          <IssueEstimateInput issue={issue} estimateFieldId={estimateFieldId}
                                              generatedEstimatesAssignations={generatedEstimatesAssignations}/>
                          <p className={"text-center mt-0 mb-0"}>(Select -1 to remove estimate)</p>
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
    function IssueEstimateInput({issue, estimateFieldId, generatedEstimatesAssignations}){
      const generatedEstimateForIssue = findGeneratedEstimateForIssue(issue.id, generatedEstimatesAssignations);
      const currentEstimateForIssue = (issue.fields[`${estimateFieldId}`] !== undefined)
        ? issue.fields[`${estimateFieldId}`]
        : null;


      if(generatedEstimateForIssue !== null){
        return(
          <input id={`input-estimate-for-issue-${issue.id}`} type="number" min={-1}
                 step={1} defaultValue={generatedEstimateForIssue} className="form-control col"/>
        )
      }
      else{
        if(currentEstimateForIssue !== null){
          return(
            <input id={`input-estimate-for-issue-${issue.id}`} type="number" min={-1}
                   step={1} defaultValue={currentEstimateForIssue} className="form-control col"/>
          );
        }
        else{
          return(
            <input id={`input-estimate-for-issue-${issue.id}`} type="number" min={-1}
                   step={1} defaultValue={-1} className="form-control col"/>
          );
        }
      }
    }
  }

}