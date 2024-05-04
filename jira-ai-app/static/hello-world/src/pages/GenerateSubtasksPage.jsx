
/*

NEED to make one component for selecting issue and params for it


Create List (with radio buttons) with all available user stories and tasks
(take not-DONE user stories from backlog (add section), and from each unfinished sprint (add section))
For each user story show: ID, Key, issue type, status, summary and description

Below, Put rest of input fields
Lower, put button "Generate"

(mb navigate to other page)
Lower, put list of generated tasks with checkbox near each one. Lower put "Add picked subtasks".
Near each generated subtask put button "add" that will add this task

submit changes to data in storage ONLY when form-generate-subtasks is submitted

Make button re-generate (instead, user can use "generate")
NEED to delete \n from user input


for existing tasks ({{task}}) we provide list (\n-separated) with title and description of user story

NEED to create request to get all subtasks (also DONE) for some issue
 */

import {useEffect, useState} from "react";
import {fetchAllBoards, fetchAllStoriesTasksForBoard, fetchCurrentProject} from "../requests/template_requests";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {invoke, view} from "@forge/bridge";
import {convertJiraWikiMarkupToPlainText, isEmpty} from "../requests/helpers.js";
import ReactDOM from "react-dom";

export default function GenerateSubtasksPage(){
  const [boards, setBoards] = useState(null);
  const [issues, setIssues] = useState(null);

  //////////////// need to make useState() on all issues for current board



  const handleBoardSelection = async(event) => {
    event.preventDefault();

    const selector = document.getElementById("select-board");
    const boardId = selector.value;

    setIssues(await fetchAllStoriesTasksForBoard(boardId));



  }

  const onIssueSelected = async(event) => {
    event.preventDefault();

    let checkedRadiobtn = document.querySelector('input[name="issue-radiobtn"]:checked');

    if(checkedRadiobtn == null){
      console.log('No issue is selected');
      alert('No issue is selected');
    }
    else{
      console.log(checkedRadiobtn.value); /////////////////////////
      alert(checkedRadiobtn.value); ///////////////////////////////

      ////////////////////////////////////// NEED to pass [val, setVal] into InputFields;

      // render component that contains input fields
      let parent = document.getElementById('input-fields-parent');
      ReactDOM.render( <InputFields/>, parent );
/*
      // load default inputs
      // load product
      let product = await getValueInStorage('product');
      if(product === undefined || product === null || isEmpty(product)){
        const currentProject = await fetchCurrentProject();
        product = currentProject.name;
      }
      document.getElementById('product-input').value = product;

      // load product vision
      let productVision = await getValueInStorage('product-vision');
      if(productVision !== undefined && productVision !== null && !isEmpty(productVision)){
        document.getElementById('product-vision-input').value = productVision;
      }

      // load technologies
      let technologies = await getValueInStorage('technologies');
      if(technologies !== undefined && technologies !== null && !isEmpty(technologies)){
        document.getElementById('technologies-input').value = technologies;
      }

      /////////////// all values from this inputs will be saved as a default after generating subtasks.

 */
    }



  }


  const handleGenerateSubtasks = async(event) => {
    event.preventDefault();

    console.log('handleGenerateSubtasks()');
    alert('handleGenerateSubtasks()');
  }




  const loadData = async() => {
    setBoards(await fetchAllBoards());

//    await invoke('setValueInStorage');
//    console.log(await invoke('getValueInStorage'));
  };

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);

/*
  if(allUserStories != null){
    return(
      <>
        <p>{JSON.stringify(allUserStories)}</p>
        <p>-</p>
        <p>-</p>
        <p>-</p>
        <p>-</p>
        <p>-</p>
        <p>{JSON.stringify(allBoards)}</p>
      </>
    );
  }

 */

  /*
  return(
    <>
      <div className={"container"}>
        <h1 className={"text-center mt-5 mb-5"}>Page not found!</h1>
      </div>
    </>
  );

   */


  if(boards == null){
    return (
      <>
        <div className={"container"}>
          <h1 className={"text-center mt-5 mb-5"}>Loading...</h1>
        </div>
      </>
    );
  }


  return(
    <>
      {/* Select board */}
      <form name="form-select-board" onSubmit={handleBoardSelection}>
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



      {issues != null &&
        <>
          {/* Select issue */}
          <form name="form-choose-issue" onSubmit={onIssueSelected}>
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

              {/* Submit */}
              <div className={"row justify-content-center mt-1"}>
                <div className="col-2 text-center">
                  <input type="submit" value={"Select!"} className={"btn btn-success form-control"}/>
                </div>
              </div>

            </div>
          </form>
        </>
      }

      <div id={"input-fields-parent"}>

      </div>


    </>
  );


  function InputFields({initProduct, initProductVision, initTechnologies}) {
    // null is not loaded, undefined or value is OK to display
    const [product, setProduct] = useState(null);
    const [productVision, setProductVision] = useState(null);
    const [technologies, setTechnologies] = useState(null);
    /////////////// all values from this inputs will be saved as a default after generating subtasks.

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



//    document.getElementById('product-vision-input').value = productVision;
//    document.getElementById('product-input').value = product;
//    document.getElementById('technologies-input').value = technologies;

    //////////// DO not display 'submit' button until all values will be downloaded



    return (
      <>
        {/* Input fields */}
        <form name="form-generate-subtasks" onSubmit={handleGenerateSubtasks}>
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
                    <input type="text" className="form-control col mb-2" id="product-input" value={product}/>
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
                    <textarea className="form-control col mb-2" id="product-vision-input" rows="3" value={productVision}/>
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
                    <textarea className="form-control col mb-2" id="technologies-input" rows="3" value={technologies}/>
                  )}
                </>
              )}
            </div>

            {/* Max numer of subtasks to generate */}
            <div className={"row mb-1"}>
              <label htmlFor="max-subtasks-number-input" className="col-2 text-end">Max number of subtasks to generate:</label>
              <input id="max-subtasks-number-input" type="number" min={1} step={1} defaultValue={1} className="form-control col"/>
            </div>
          </div>

          {/* Submit */}
          {product !== null && productVision !== null && technologies !== null && (
            <div className={"row justify-content-center mt-1"}>
              <div className="col-2 text-center">
                <input type="submit" value={"Generate!"} className={"btn btn-success form-control"}/>
              </div>
            </div>
          )}
        </form>
      </>
    );
  }


}


/*

<div className={"row mb-3"}>
            <label className="col-2 text-end">Name</label>
            <input name="name" type="text" required={true} pattern={"^(?!\\s*$).+"} maxLength={40} className={"form-control col"}/>
          </div>

          <div className={"row mb-3"}>
            <label className="col-2 text-end">Variety</label>
            <input name="variety" type="text" required={true} pattern={"^(?!\\s*$).+"} maxLength={40} className={"form-control col"}/>
          </div>



          <div className={"row mb-3"}>
            <label className="col-2 text-end">Price</label>
            <input name="price" type="number" required={true} min={0.01} step={0.01} defaultValue={100.00} className={"form-control col"}/>
          </div>


          <>
            {(plantingMaterialType === "TREE_SEEDLING" || plantingMaterialType === "BUSH_SEEDLING") &&
              <>
                <div className={"row mb-3"}>
                  <label className="col-2 text-end">Purpose type</label>
                  <select name="purpose-type" className={"form-select col"}>
                    <option value="DECORATIVE">Decorative</option>
                    <option value="FRUITING">Fruiting</option>
                  </select>
                </div>

                <div className={"row mb-3"}>
                  <label className="col-2 text-end">Production year</label>
                  <input name="production-year" type="number" required={true} min={2000} max={new Date().getFullYear()} step={1}
                         defaultValue={new Date().getFullYear()} className={"form-control col"}/>
                </div>

                <div className={"row mb-3"}>
                  <label className="col-2 text-end">Root system</label>
                  <select name="root-system-type" className={"form-select col"}>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </>}
          </>


          <>
            {(plantingMaterialType === "FLOWER_SEEDLING") &&
              <>
                <div className={"row mb-3"}>
                  <label className="col-2 text-end">Longevity type</label>
                  <select name="longevity-type" className={"form-select col"}>
                    <option value="ONE_YEAR">One-year</option>
                    <option value="TWO_YEARS">Two-years</option>
                    <option value="MANY_YEARS">Many-years</option>
                  </select>
                </div>

                <div className={"row mb-3"}>
                  <label className="col-2 text-end">Reproduction type</label>
                  <select name="reproduction-type" className={"form-select col"}>
                    <option value="BULBOUS">Bulbous</option>
                    <option value="RHIZOME">Rhizome</option>
                    <option value="SEED">Seed</option>
                  </select>
                </div>
              </>
            }
          </>


 */

/*
  - How to get a selected radiobutton: https://stackoverflow.com/a/15839451
  - Get selected item from list: https://stackoverflow.com/a/1085810

  - Borders in Bootstrap: https://getbootstrap.com/docs/5.0/utilities/borders/
  - Format of checks and radio buttons in Bootstrap: https://getbootstrap.com/docs/5.0/forms/checks-radios/


 */

