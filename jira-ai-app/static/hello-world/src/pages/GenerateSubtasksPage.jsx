
/*

submit changes to data in storage ONLY when form-generate-subtasks is submitted

for existing tasks ({{task}} parameter) we provide list (\n-separated) with title and description
 */

import {useEffect, useState} from "react";
import {
  createSubtask, deleteIssue,
  fetchAllBoardsForProject,
  fetchAllStoriesTasksForBoard,
  fetchCurrentProject,
  fetchIssue
} from "../requests/template_requests";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {invoke, view} from "@forge/bridge";
import {convertJiraWikiMarkupToPlainText, isEmpty} from "../requests/helpers.js";
import ReactDOM from "react-dom";
import LoadingComponent from "./LoadingComponent";
import {createGenerateSubtasksPrompt, readFile, replaceSubstrings} from "../requests/prompts_generators";
import {replaceNewlines} from '../requests/helpers.js';
import file from "./some.hbs";
import {generateSubtasksForIssue} from "../requests/gemini_requests";
import ErrorComponent from "./ErrorComponent";

/**
 * Deletes from DOM all children of given `parent` element
 * @param parent
 */
function deleteChildren(parent) {
  /*
  let children = Array.from(parent.childNodes);

  console.log(`children: ${children}`);

  for (const child of children){
    parent.removeChild(child);
  }

   */

  while (parent.firstChild) {
    parent.firstChild.remove()
  }
}


export default function GenerateSubtasksPage(){
  const [boards, setBoards] = useState(null);
  let selectedIssueId = null;

  const onBoardSelected = async(event) => {
    event.preventDefault();

    const selector = document.getElementById("select-board");
    const boardId = selector.value;

    // display loading of issues
    let parent = document.getElementById('generation-parameters-inputs-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);

    let issues = await fetchAllStoriesTasksForBoard(boardId);

    // render inputs for generation parameters
    /*
      If the React element was previously rendered into container,
      this will perform an update on it and only mutate the DOM as necessary to reflect the latest React element.
      https://legacy.reactjs.org/docs/react-dom.html#render
     */
    ReactDOM.render(<GenerationParametersInputsComponent issues={issues}/>, parent);
  }


  const onGenerationParamsSubmitted = async(event) => {
    event.preventDefault();

    let checkedRadiobtn = document.querySelector('input[name="issue-radiobtn"]:checked');

    if(checkedRadiobtn == null){
      console.log('No issue is selected');
      alert('No issue is selected');
    }
    else{
      selectedIssueId = checkedRadiobtn.value;
      console.log(`Selected issue with ID = ${selectedIssueId}`); /////////////////////////

      // display loading of subtasks generating
      let parent = document.getElementById('display-generated-subtasks-component-parent'); ////////
      ReactDOM.render(<LoadingComponent />, parent); ///////////////////////

      // get data from input fields

      // values of product, productVision and technologies inputs won't be 'Loading...',
      // because form submission becomes possible only after default data is downloaded
      const productInput = document.getElementById("product-input");
      const product = productInput.value;

      const productVisionInput = document.getElementById("product-vision-input");
      const productVision = replaceNewlines(productVisionInput.value);

      const technologiesInput = document.getElementById("technologies-input");
      const technologies = replaceNewlines(technologiesInput.value);

      const maxSubtasksNumberInput= document.getElementById("max-subtasks-number-input");
      const maxSubtasksNumber = maxSubtasksNumberInput.value;

      const issue = await fetchIssue(selectedIssueId);

      let issueName = issue?.fields?.summary; // summary is not formatted using Jira wiki
      if(issueName === undefined ||issueName === null){
        issueName = '';
      }

      let issueDescription = issue?.fields?.description;
      issueDescription = ((issueDescription !== undefined) && (issueDescription !== null))
        ? convertJiraWikiMarkupToPlainText(issueDescription)
        : '';

      // delimit subtasks by \n
      let subtasksString = '';
      if(issue.fields.subtasks !== undefined && issue.fields.subtasks !== null){
        for (const subtask of issue.fields.subtasks){
          subtasksString += subtask.fields?.summary; // summary always without formatting
          if(subtask.fields.description !== undefined && subtask.fields.description !== null){
            subtasksString += '. ' + convertJiraWikiMarkupToPlainText(subtask.fields.description);
          }
          subtasksString += '.\n';
        }
      }


      // generate prompt
      const prompt = await createGenerateSubtasksPrompt(product, productVision,
        technologies, issueName, issueDescription, subtasksString, maxSubtasksNumber);

      // save fields in storage
      await setValueInStorage('product', product);
      await setValueInStorage('product-vision', productVision);
      await setValueInStorage('technologies', technologies);


      // render generated subtasks
      // pass prompt to other component. That prompt will make request to Gemini, and display result.
//      let parent = document.getElementById('display-generated-subtasks-component-parent');
//      ReactDOM.render(<LoadingComponent />, parent);
      ReactDOM.render(<DisplayGeneratedSubtasksComponent prompt={prompt}/>, parent);
    }
  }


  const onAddGeneratedSubtask = async(event) => {
    const addButtonId = event.target.id;
    const subtaskIndex = addButtonId.replace(/[^0-9]/g, ''); // delete all non-numbers

    // disable 'add' button
    document.getElementById(`generated-subtask-add-button-${subtaskIndex}`).disabled = true;

    let summary = document.getElementById(`generated-subtask-summary-${subtaskIndex}`).innerHTML;
    let description = document.getElementById(`generated-subtask-description-${subtaskIndex}`).innerHTML;

    let createdSubtask = await createSubtask(selectedIssueId, {task: summary, description: description});

    let idField = document.getElementById(`generated-subtask-id-${subtaskIndex}`);
    let keyField = document.getElementById(`generated-subtask-key-${subtaskIndex}`);
    idField.innerHTML = createdSubtask.id;
    keyField.innerHTML = createdSubtask.key;

    console.log(`Created subtask with ID = ${createdSubtask.id}`);

    // enable 'delete' button
    document.getElementById(`generated-subtask-delete-button-${subtaskIndex}`).disabled = false;
  }

  const onDeleteGeneratedSubtask = async(event) => {
    const deleteButtonId = event.target.id;
    const subtaskIndex = deleteButtonId.replace(/[^0-9]/g, ''); // delete all non-numbers


    // disable 'delete' button
    document.getElementById(`generated-subtask-delete-button-${subtaskIndex}`).disabled = true;

    let idField = document.getElementById(`generated-subtask-id-${subtaskIndex}`);
    let keyField = document.getElementById(`generated-subtask-key-${subtaskIndex}`);

    const subtaskId = idField.innerHTML;

    if(subtaskId !== undefined && subtaskId !== null && subtaskId !== ''){
      await deleteIssue(subtaskId);
      console.log(`Deleted subtask with ID = ${subtaskId}`);
    }

    idField.innerHTML = '';
    keyField.innerHTML = '';

    // enable 'add' button
    document.getElementById(`generated-subtask-add-button-${subtaskIndex}`).disabled = false;
  }




  const loadData = async() => {
    setBoards(await fetchAllBoardsForProject());

//    await invoke('setValueInStorage');
//    console.log(await invoke('getValueInStorage'));
  };

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);


  // The basis of whole page
  return(
    <div className={"p-2 pb-5"}>
      {boards == null ? (
        <LoadingComponent/>
      ) : (
        <SelectBoardComponent boards={boards}/>
      )}

      <div id={"generation-parameters-inputs-component-parent"}>
      </div>

      <div id={"display-generated-subtasks-component-parent"}>
      </div>
    </div>
  );


  function SelectBoardComponent({boards}) {
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
    const [technologies, setTechnologies] = useState(null);
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

    const fetchTechnologies = async() => {
      let t = await getValueInStorage('technologies');
      if(t !== undefined && t !== null && !isEmpty(t)){ // stored in storage
        return t;
      }
      return undefined;
    }

    const loadDefaultValues = async() => {
      setProduct(await fetchProduct());
      setProductVision(await fetchProductVision());
      setTechnologies(await fetchTechnologies());
    };

    useEffect(() => {
      loadDefaultValues();
    }, []);



    return (
      <>
        <form name="form-generation-parameters-inputs" onSubmit={onGenerationParamsSubmitted}>

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

                        {/* Plates of issue subtasks */}
                        {issue.fields.subtasks != null && issue.fields.subtasks.length > 0 &&
                          <>
                            <p className={"mb-0"}><b>Subtasks:</b></p>
                            {issue.fields.subtasks.map((subtask) => (
                              <>
                                <div className={"row mb-1 border border-1 rounded border-primary ml-2"}>
                                  <h5>{subtask.key}</h5>
                                  <p className={"mb-0"}><b>ID:</b> {subtask.id}</p>
                                  <p className={"mb-0"}><b>Summary:</b> {subtask.fields.summary}</p>
                                  {subtask.fields.description != null && // this is not displayed, because .description attribute is absent even if description exists
                                    <p className={"mb-0"}><b>Description:</b> {
                                      convertJiraWikiMarkupToPlainText(subtask.fields.description)
                                    }</p>
                                  }
                                </div>
                              </>
                            ))}
                          </>
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

            {/* Technologies used */}
            <div className={"row mb-1"}>
              <label htmlFor="technologies-input" className="col-2 text-end">Technologies used:</label>
              {technologies === null ? (
                <textarea className="form-control col mb-2" id="technologies-input" rows="3" value={"Loading..."} disabled/>
              ) : (
                <>
                  {technologies === undefined ? (
                    <textarea className="form-control col mb-2" id="technologies-input" rows="3"/>
                  ) : (
                    <textarea className="form-control col mb-2" id="technologies-input" rows="3" defaultValue={technologies}/>
                  )}
                </>
              )}
            </div>

            {/* Max numer of subtasks to generate */}
            <div className={"row mb-1"}>
              <label htmlFor="max-subtasks-number-input" className="col-2 text-end">Max number of subtasks to generate:</label>
              <input id="max-subtasks-number-input" type="number" min={1} step={1} defaultValue={1} className="form-control col"/>
            </div>

            {/* Submit */}
            {/* DO not display 'Submit' button until all values will be downloaded */}
            {product !== null && productVision !== null && technologies !== null && (
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


  function DisplayGeneratedSubtasksComponent({prompt}){
    const [answer, setAnswer] = useState(null);

    const loadData = async() => {
      setAnswer(await generateSubtasksForIssue(prompt));


    };

    useEffect(() => {
      loadData();
    }, []);


    /* Display results */

    // if answer not loaded yet
    if(answer === null){
      return(
        <LoadingComponent/>
      );
    }

    if(!answer.ok){
      return(
        <ErrorComponent errorMessage={answer.errorMessage}/>
      )
    }

    const subtasks = answer.answer;

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

    return(
      <>
        <h3>Generated issues:</h3>
        <div className={"container mb-3"}>
          <p>Choose which one you want to add to your project. If you immediately changed your mind, you can delete subtask easily</p>
          <div className={"row"}>
            <div className={"col"}>

              {/* List of subtasks */}
              {subtasks.map((subtask, index) => (

                <div className={"row mb-3 border border-2 rounded"}>

                  {/* Column for button */}
                  <div className="col-2 d-flex flex-row justify-content-around align-items-center">
                    <button id={`generated-subtask-add-button-${index}`}
                            className = {"btn btn-primary"} onClick={onAddGeneratedSubtask}>Add</button>
                    <button id={`generated-subtask-delete-button-${index}`}
                            className = {"btn btn-danger"} onClick={onDeleteGeneratedSubtask}>Delete</button>
                  </div>

                  {/* Column for subtask data */}
                  <div className="col">
                    <div className="row">
                      <h5 id={`generated-subtask-key-${index}`}>{subtask.key}</h5>
                    </div>

                    <div className="row">
                      <div className="col-2">
                        <b className={"mb-0"}>ID:</b>
                      </div>
                      <div className="col">
                        <p id={`generated-subtask-id-${index}`} className={"mb-0"}></p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-2">
                        <b className={"mb-0"}>Summary:</b>
                      </div>
                      <div className="col">
                        <p id={`generated-subtask-summary-${index}`} className={"mb-0"}> {subtask.task}</p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-2">
                        <b className={"mb-0"}>Description:</b>
                      </div>
                      <div className="col">
                        <p id={`generated-subtask-description-${index}`} className={"mb-0"}>{subtask.description}</p>
                      </div>
                    </div>
                  </div>

                </div>

              ))}
            </div>
          </div>
        </div>
      </>

    )

  }
}


/*
  - How to get a selected radiobutton: https://stackoverflow.com/a/15839451
  - Get selected item from list: https://stackoverflow.com/a/1085810
  - Enable/disable button (does not work when button is disabled from HTML-code): https://stackoverflow.com/a/13831737
  - Get inside value of <p>-tag: https://stackoverflow.com/a/11634081
  - Get ID of clicked button in onClick() handler: https://stackoverflow.com/a/4825325 (but I used event.target.id)

  - Borders in Bootstrap: https://getbootstrap.com/docs/5.0/utilities/borders/
  - Format of checks and radio buttons in Bootstrap: https://getbootstrap.com/docs/5.0/forms/checks-radios/


 */

