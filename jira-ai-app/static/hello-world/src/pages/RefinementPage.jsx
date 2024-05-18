import {
  changeIssueParent, changeIssueSummaryDescription,
  createUserStory, deleteIssue,
  fetchAllBoardsForProject,
  fetchAllNotDoneStoriesTasksForBoard, fetchAllSubtasksForIssueForBoard,
  fetchCurrentProject, fetchIssue
} from "../logic/jira_requests";
import {useEffect, useState} from "react";
import LoadingComponent from "./LoadingComponent";
import ReactDOM from "react-dom";
import {getValueInStorage, setValueInStorage} from "../logic/storage";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, isNonEmpty} from "../logic/helpers.js";
import {createGenerateSubtasksPrompt, createIssueRefinementPrompt} from "../logic/prompts_generators";
import {generateIssueRefinementAdvice, generateSubtasksForIssue} from "../logic/gemini_requests";
import ErrorComponent from "./ErrorComponent";

export default function RefinementPage(){
  let selectedBoardId = null;
  let selectedIssueId = null;
//// NEED to add onBoardsSelected

  const onBoardSelected = async(event) => {
    event.preventDefault();

    // display loading of issues
    let parent = document.getElementById('generation-parameters-inputs-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // fetch issues
    const selector = document.getElementById("select-board");
    selectedBoardId = selector.value;

    let issues = await fetchAllNotDoneStoriesTasksForBoard(selectedBoardId);

    // render inputs for generation parameters
    ReactDOM.render(<GenerationParametersInputsComponent issues={issues}/>, parent);
  }


  // issues is all issues (user stories and tasks) that displays.
  const onGenerationParamsSubmitted = async(event, issues) => {
    event.preventDefault();

    let checkedRadiobtn = document.querySelector('input[name="issue-radiobtn"]:checked');

    if(checkedRadiobtn == null){
      console.log('No issue is selected');
      alert('No issue is selected');
    }
    else{
      selectedIssueId = checkedRadiobtn.value;
      console.log(`Selected issue with ID = ${selectedIssueId}`);

      // display loading of subtasks generating
      let parent = document.getElementById('display-refinement-advice-component-parent');
      ReactDOM.render(<LoadingComponent />, parent);

      // get data from input fields

      // values of product, productVision and technologies inputs won't be 'Loading...',
      // because form submission becomes possible only after default data is downloaded
      const productInput = document.getElementById("product-input");
      const product = productInput.value;

      const productVisionInput = document.getElementById("product-vision-input");
      const productVision = replaceNewlines(productVisionInput.value);


      // filter issues in order to: 1) exclude selected issue; 2) select only required fields of other issues.
      const otherIssues = issues.filter((i) => i.id !== selectedIssueId);
      const otherIssuesFormatted = otherIssues.map((i) => {
        return {
          id: i.id,
          summary: i.fields.summary,
          description: ((i.fields.description !== undefined && i.fields.description !== null)
            ? convertJiraWikiMarkupToPlainText(i.fields.description)
            : "")
        }
      });

      // find selected issue
      const selectedIssue = issues.find((i) => i.id === selectedIssueId)
      const selectedIssueFormatted = {
        id: selectedIssue.id,
        key: selectedIssue.key,
        summary: selectedIssue?.fields?.summary,
        description: selectedIssue?.fields?.description
      };

      let issueSummary = selectedIssue?.fields?.summary; // summary is not formatted using Jira wiki, and does not have any \n
      if(issueSummary === undefined || issueSummary === null){
        issueSummary = '';
      }

      let issueDescription = selectedIssue?.fields?.description;
      issueDescription = ((issueDescription !== undefined) && (issueDescription !== null))
        ? convertJiraWikiMarkupToPlainText(issueDescription)
        : '';


      // generate prompt
      const prompt = await createIssueRefinementPrompt(product, productVision,
        issueSummary, issueDescription, JSON.stringify(otherIssuesFormatted));

      // save fields in storage
      await setValueInStorage('product', product);
      await setValueInStorage('product-vision', productVision);


      // render generated advice
      // pass prompt to other component. That prompt will be sent to Gemini.
      // pass otherIssues to check if ID, returned by Gemini, is of existing issue
      // pass selectedIssue for further logic
      ReactDOM.render(<DisplayRefinementAdviceComponent prompt={prompt} selectedIssue={selectedIssueFormatted}
      otherIssues={otherIssuesFormatted}/>, parent);
    }
  }

  /**
   * @param event
   * @param selectedIssue is issue under refinement; is `{id, key, summary, description}` object
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  const onSplitAdviceFormSubmitted = async(event, selectedIssue, answer) => {
    event.preventDefault();

    const checkedCheckBoxes = Array.from(document.querySelectorAll(
      '[id^="generated-advice-split-checkbox-part-"]:checked'));

    const selectedPartsIndices = checkedCheckBoxes.map(b => b.id.replace(/[^0-9]/g, '')); // delete non-numbers
//    console.log(`selectedPartsIndices: ${selectedPartsIndices}`); /////////////////////////////////////////////

    if(selectedPartsIndices.length < 2){
      alert("Choose at least 2 parts");
      return;
    }

    // collect selected parts in array [{index, summary, description},...]
    let parts = [];
    for(const index of selectedPartsIndices){
      let summary = document.getElementById(`generated-advice-split-summary-part-${index}`).value;
      let description = document.getElementById(`generated-advice-split-description-part-${index}`).value;

      // check summary and description using regex
      if(!isNonEmpty(summary)){
        alert("Summary field must be non-empty");
        return;
      }
      if(!isNonEmpty(description)){
        description = '';
      }

      parts.push({
        index: index,
        summary: summary,
        description: description
      });
    }

//    console.log(`Selected parts: ${JSON.stringify(parts)}`); ////////////////////////////////////////////////////////////

    // create user stories from parts
    let createdUserStories = []; // array of {id, key} objects
    for(const p of parts){
      createdUserStories.push(await createUserStory(
        {
          summary: p.summary,
          description:p.description
        }
      ));
    }


    // change parent of all subtasks of to-be-deleted issue
    const selectedIssueSubtasks = await fetchAllSubtasksForIssueForBoard(selectedBoardId, selectedIssue.id);
//    console.log(`Subtasks: ${JSON.stringify(selectedIssueSubtasks)}`); /////////////////////////////////////////////////////

    for(const subtask of selectedIssueSubtasks){
      await changeIssueParent(subtask.id, createdUserStories[0].id);
    }

    // delete issue under refinement
    await deleteIssue(selectedIssue.id);

    alert(`SPLIT refinement of ${selectedIssue.key} issue successfully finished!`);
  }


  /**
   * Deletes `selectedIssue` and `issueToMergeWith`. Instead, creates merged issue.
   * Subtasks of deleted issues will become children of newly created merged issue.
   * @param event
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param issueToMergeWith is `{id, summary, description}` object
   * @constructor
   */
  const onMergeAdviceFormSubmitted = async(event, selectedIssue, issueToMergeWith) => {
    event.preventDefault();

    /* Create merged User Story */
    // get params for creating merged user story
    let summary = document.getElementById(`generated-advice-merge-summary`).value;
    let description = document.getElementById(`generated-advice-merge-description`).value;

    // check summary and description using regex
    if(!isNonEmpty(summary)){
      alert("Summary field must be non-empty");
      return;
    }
    if(!isNonEmpty(description)){
      description = '';
    }

    // create merged User Story, is {id, key} object
    const mergedUserStory = await createUserStory(
      {
        summary: summary,
        description: description
      }
    );


    /* move subtasks from `selectedIssue` and `issueToMergeWith` to `mergedUserStory` */
    // find all subtasks of `selectedIssue` and `issueToMergeWith`
    const selectedIssueSubtasks = await fetchAllSubtasksForIssueForBoard(selectedBoardId, selectedIssue.id);
    const issueToMergeWithSubtasks = await fetchAllSubtasksForIssueForBoard(selectedBoardId, issueToMergeWith.id);

    for(const subtask of selectedIssueSubtasks){
      await changeIssueParent(subtask.id, mergedUserStory.id);
    }
    for(const subtask of issueToMergeWithSubtasks){
      await changeIssueParent(subtask.id, mergedUserStory.id);
    }

    /* delete issues under merging */
    await deleteIssue(selectedIssue.id);
    await deleteIssue(issueToMergeWith.id);

    alert(`MERGE refinement successfully finished! Created ${mergedUserStory.key} instead of issues with ID ${selectedIssue.id} and ${issueToMergeWith.id}`);
  }


  /**
   * Deletes `selectedIssue`
   * @param event
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   */
  const onDeleteAdviceFormSubmitted = async(event, selectedIssue) => {
    event.preventDefault();

    await deleteIssue(selectedIssue.id);

    alert(`DELETE refinement successfully finished!\nDeleted ${selectedIssue.key} and all its subtasks`);
  }


  /**
   * Edits given `selectedIssue` according to input fields
   * @param event
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   */
  const onFixAdviceFormSubmitted = async(event, selectedIssue) => {
    event.preventDefault();


    // get params for editing user story
    let summary = document.getElementById(`generated-advice-fix-summary`).value;
    let description = document.getElementById(`generated-advice-fix-description`).value;

    // check summary and description using regex
    if(!isNonEmpty(summary)){
      alert("Summary field must be non-empty");
      return;
    }
    if(!isNonEmpty(description)){
      description = '';
    }

    // change issue's summary and description
    await changeIssueSummaryDescription(selectedIssueId, summary, description);

    alert(`FIX refinement successfully finished!\nChanged summary and description of ${selectedIssue.key}`);
  }



  // The basis of whole page
  return(
    <div className={"p-2 pb-5"}>
      <h1 className={"text-center"}>Refine User story / Task</h1>

      <SelectBoardComponent/>

      <div id={"generation-parameters-inputs-component-parent"}>
      </div>

      <div id={"display-refinement-advice-component-parent"}>
      </div>
    </div>
  );



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
   * @param issues SHOULD NOT be null. But can be empty
   * @return {JSX.Element}
   * @constructor
   */
  function GenerationParametersInputsComponent({issues}) {
    // null is not loaded, undefined or value is OK to display
    const [product, setProduct] = useState(null);
    const [productVision, setProductVision] = useState(null);
    // all values from this inputs will be saved as a default AFTER generating subtasks.

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

    const loadDefaultValues = async() => {
      setProduct(await fetchProduct());
      setProductVision(await fetchProductVision());
    };

    useEffect(() => {
      loadDefaultValues();
    }, []);



    return (
      <>
        <form name="form-generation-parameters-inputs" onSubmit={
          (event) => onGenerationParamsSubmitted(event, issues)
        }>

          <h3>Select issue:</h3>
          {/* Select issue */}
          {issues.length > 0 ? (
            <div className={"form-group container mb-3"}>
              <div className={"row"}>
                <div className={"col"}>

                  {/* Issues plates */}
                  {issues.map((issue) => (
                    <div className={"row mb-3 border border-2 rounded"}>
                      <div className="col-1">
                        <input type="radio" name="issue-radiobtn" value={issue.id} className={"form-check-input"}/>
                      </div>

                      <div className="col">
                        <h4>{issue.key}</h4>
                        <p className={"mb-0"}><b>ID:</b> {issue.id}</p>
                        <p className={"mb-0"}><b>Summary:</b> {issue.fields.summary}</p>
                        <p className={"mb-0"}><b>Type:</b> {issue.fields.issuetype.name}</p>
                        <p className={"mb-0"}><b>Status:</b> {issue.fields.status.name}</p>
                        {issue.fields.description != null &&
                          <p className={"mb-0"}><b>Description:</b> {
                            convertJiraWikiMarkupToPlainText(issue.fields.description)
                          }</p>
                        }
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          ) : (
            <div className={"form-group container mb-3"}>
              <div className="row">
                <div className="col text-center">
                  <p>No issues exist</p>
                </div>
              </div>
            </div>
          )}


          <h3>Enter parameters:</h3>
          {/* Input fields */}
          <div className={"form-group container mt-3 mb-3"}>

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
              <div className={"row justify-content-center mt-2"}>
                <div className="col-2 text-center">
                  <input type="submit" value={"Generate!"} className={"btn btn-success form-control"}/>
                </div>
              </div>
            )}
          </div>

        </form>
      </>
    );
  }


  /**
   * Make request to Gemini and display result.
   *
   * Note, that field `description` in inputs parameters is FORMATTED with Jira Wiki.
   * @param prompt is prompt for Gemini
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param otherIssues is all issues except `selectedIssue` (is array of `{id, summary, description}` objects)
   * @return {JSX.Element}
   * @constructor
   */
  function DisplayRefinementAdviceComponent({prompt, selectedIssue, otherIssues}){
    const [response, setResponse] = useState(null);

    const loadData = async() => {
      setResponse(await generateIssueRefinementAdvice(prompt));
    };

    useEffect(() => {
      loadData();
    }, []);



    /* Display results */

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


    
    /* Process response.answer */

    if(response.answer.action === "SPLIT"){
      return <DisplayRefinementSplitAdviceComponent selectedIssue={selectedIssue} answer={response.answer}/>
    }

    if(response.answer.action === "MERGE"){
      // Check if returned ID exists
      const otherIssuesIDs = otherIssues.map(i => i.id);
      if(!otherIssuesIDs.includes(response.answer.id)){
        return(
          <ErrorComponent errorMessage={'Something wrong happened. Try again.'}/>
        )
      }

      return(
        <DisplayRefinementMergeAdviceComponent selectedIssue={selectedIssue}
                                               otherIssues={otherIssues} answer={response.answer}/>
      );
    }

    if(response.answer.action === "DELETE"){
      return(
          <DisplayRefinementDeleteAdviceComponent selectedIssue={selectedIssue} answer={response.answer}/>
      );
    }

    if(response.answer.action === "FIX"){
      return(
          <DisplayRefinementFixAdviceComponent selectedIssue={selectedIssue} answer={response.answer}/>
      );
    }

    if(response.answer.action === "NO_ACTION"){
      return(
          <DisplayRefinementNoActionAdviceComponent selectedIssue={selectedIssue}/>
      );
    }

    // if unknown action (this variant should not happen)
    return(
      <ErrorComponent errorMessage={'Unknown refinement action received. Try again.'}/>
    );
  }


  /**
   * Displays Refinement advice when action is SPLIT
   * @param selectedIssue is issue under refinement; is `{id, key, summary, description}` object
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  function DisplayRefinementSplitAdviceComponent({selectedIssue, answer}){
    return(
      <>
        <h3>Generated advice (SPLIT):</h3>
        <form name="form-generated-advice-split-select-parts" onSubmit={(event) => {
          onSplitAdviceFormSubmitted(event, selectedIssue, answer);
        }}>
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
                <p className={"mb-0"}>Select parts (at least 1) you want to create instead of selected issue. Apply is irreversible.</p>
                <p className={"mb-0"}>You can edit generated parts.</p>
                <p>Applying of refinement is irreversible.
                  After applying, <b>selected issue will be deleted</b>, its subtasks will become children of first selected part.</p>
                {answer.parts.map((part, index) => (
                  <div className={"row mb-3 p-1 border border-2 rounded"}>

                    {/* Column for checkbox */}
                    <div className="col-1 d-flex flex-row justify-content-center align-items-center">
                      <input className={"form-check-input"} type="checkbox" id={`generated-advice-split-checkbox-part-${index}`}/>
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
                          <input type="text" className="form-control mb-0" id={`generated-advice-split-summary-part-${index}`}
                                 defaultValue={replaceNewlines(part.summary)}/>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="row">
                        <div className="col-2">
                          <b className={"mb-0"}>Description:</b>
                        </div>
                        <div className="col">
                            <textarea className="form-control mb-0" id={`generated-advice-split-description-part-${index}`}
                                      rows="3" defaultValue={part.description}/>
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
                <input type="submit" value={"Apply!"} className={"btn btn-success form-control"}/>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  }

  /**
   * Displays Refinement advice when action is MERGE
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param otherIssues is all issues except `selectedIssue` (is array of `{id, summary, description}` objects)
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  function DisplayRefinementMergeAdviceComponent({selectedIssue, otherIssues, answer}){
    const issueToMergeWith = otherIssues.find((i) => i.id === answer.id);

    return(
      <>
        <h3>Generated advice (MERGE):</h3>
        <form name="form-generated-advice-merge-apply" onSubmit={(event) => {
          onMergeAdviceFormSubmitted(event, selectedIssue, issueToMergeWith);
        }}>
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
                      After applying, merged issue will be created, <b>both old issues will be deleted.</b></p>
                    <p className={"mb-0"}>Subtasks of deleted issues will become children of newly created issue.</p>
                    <p className={"mb-1"}>You can edit generated merged issue.</p>
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


  /**
   * Displays Refinement advice when action is DELETE
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  function DisplayRefinementDeleteAdviceComponent({selectedIssue, answer}){
    return(
      <>
        <h3>Generated advice (DELETE):</h3>
        <form name="form-generated-advice-delete-apply" onSubmit={(event) => {
          onDeleteAdviceFormSubmitted(event, selectedIssue);
        }}>
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


  /**
   * Displays Refinement advice when action is FIX
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  function DisplayRefinementFixAdviceComponent({selectedIssue, answer}){
    return(
      <>
        <h3>Generated advice (FIX):</h3>
        <form name="form-generated-advice-fix-apply" onSubmit={(event) => {
          onFixAdviceFormSubmitted(event, selectedIssue, answer);
        }}>
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
                <p className={"text-center mb-0"}><b className={"text-center"}>Generated fixed issue and description</b></p>
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


  /**
   * Displays Refinement advice when action is NO_ACTION
   * @param selectedIssue is issue under refinement (object `{id, key, summary, description}`)
   * @param answer is answer object. It is described in `refinement-user-story.hbs` file
   * @constructor
   */
  function DisplayRefinementNoActionAdviceComponent({selectedIssue}){
    return(
      <>
        <h3>Generated advice (NO_ACTION):</h3>

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
}