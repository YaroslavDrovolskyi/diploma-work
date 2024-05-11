import {
  fetchAllBoardsForProject,
  fetchAllNotDoneStoriesTasksForBoard,
  fetchCurrentProject, fetchIssue
} from "../requests/template_requests";
import {useEffect, useState} from "react";
import LoadingComponent from "./LoadingComponent";
import ReactDOM from "react-dom";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines} from "../requests/helpers.js";
import {createGenerateSubtasksPrompt, createIssueRefinementPrompt} from "../requests/prompts_generators";
import {generateIssueRefinementAdvice, generateSubtasksForIssue} from "../requests/gemini_requests";
import ErrorComponent from "./ErrorComponent";

export default function RefinementPage(){
  let selectedIssueId = null;
//// NEED to add onBoardsSelected

  const onBoardSelected = async(event) => {
    event.preventDefault();

    // display loading of issues
    let parent = document.getElementById('generation-parameters-inputs-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    // fetch issues
    const selector = document.getElementById("select-board");
    const boardId = selector.value;

    let issues = await fetchAllNotDoneStoriesTasksForBoard(boardId);

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


      /////////////////////////////////////////////////////////////// TEST
//      console.log(`Product: ${product}`); ///////////////////////////////////////////////////
//      console.log(`Product vision: ${productVision}`); ///////////////////////////////////////////
//      console.log(`Issue summary: ${issueSummary}`); //////////////////////////////////////////////
//      console.log(`Issue description: ${issueDescription}`); /////////////////////////////////////////
      console.log(prompt); /////////////////////////////////////////////////////////////////////////


      // render generated advice
      // pass prompt to other component. That prompt will be sent to Gemini.
      // pass otherIssues to check if ID, returned by Gemini, is of existing issue
      // pass selectedIssue for further logic
      ReactDOM.render(<DisplayRefinementAdviceComponent prompt={prompt} selectedIssue={selectedIssueFormatted}
      otherIssues={otherIssuesFormatted}/>, parent);
    }
  }


  const onSplitAdviceFormSubmitted = async(event) => {
    event.preventDefault();

   /////////////////////////// {/* When apply actions, need to take values from inputs, not from memory */}

    /*
    {/* NEED to make remark about what will be with subtasks of selected issue (after implementation)
                The best variant is to change parent of each generated subtask into first generated part }
     */


    /*
    Треба зробити так, щоб не можна було обрати менше однієї part для генерації.
    Також щоб не можна було що полеsummary пустий.
     */
  }


  const onMergeAdviceFormSubmitted = async(event) => {
    event.preventDefault();
  }



  // The basis of whole page
  return(
    <div className={"p-2 pb-5"}>
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
      if(!otherIssueIDs.includes(response.answer.id)){
        return(
          <ErrorComponent errorMessage={'Something wrong happened. Try again.'}/>
        )
      }

      return(
        <>

        </>
      );
    }

    if(response.answer.action === "DELETE"){
      //////////////// NEED also to delete all subtask. Also need to note this in UI.
      return(
        <>

        </>
      );
    }

    if(response.answer.action === "FIX"){
      return(
        <>

        </>
      );
    }

    if(response.answer.action === "NO_ACTION"){
      return(
        <>

        </>
      );
    }

    // if unknown action (this should not happen)
    return(
      <ErrorComponent errorMessage={'Unknown refinement action received. Try again.'}/>
    );


    //////////////////////////////////////////// NEED to display old user story in each case
    // when display `description` need handle that it can be null or undefined (as in )
    /*
    For example:
          issueDescription = ((issueDescription !== undefined) && (issueDescription !== null))
        ? convertJiraWikiMarkupToPlainText(issueDescription)
        : '';
     */

    if(subtasks.length === 0){
      return(
        <>
          <div className={"container"}>
            <h1 className={"text-center "}>No subtasks generated</h1>
            <p className={"text-center mt-1 mb-5"}>No subtasks was generated. Try again.</p>
          </div>
        </>
      )
    }


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
        <form name="form-generated-advice-split-select-parts" onSubmit={onSplitAdviceFormSubmitted}>
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
                  <div className={"row mb-3 border border-2 rounded"}>

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
//    const merge /////// NEED to find issue woth whom reging will be happen


    return(
      <>
        <h3>Generated advice (MERGE):</h3>
        <form name="form-generated-advice-merge-apply" onSubmit={onMergeAdviceFormSubmitted}>
          <div className={"form-group container mb-3"}>
            <div className="row">
              <div className="col">

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
                  </div>
                  <div className="col"></div>
                </div>



                {/* Display generated parts */}
                <p className={"mb-0"}>Select parts (at least 1) you want to create instead of selected issue. Apply is irreversible.</p>
                <p className={"mb-0"}>You can edit generated parts.</p>
                <p>Applying of refinement is irreversible.
                  After applying, <b>selected issue will be deleted</b>, its subtasks will become children of first selected part.</p>
                {answer.parts.map((part, index) => (
                  <div className={"row mb-3 border border-2 rounded"}>

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

}