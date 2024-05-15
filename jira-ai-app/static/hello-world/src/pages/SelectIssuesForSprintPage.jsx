import {useEffect, useState} from "react";
import {createSelectIssuesForSprintPrompt} from "../requests/prompts_generators";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines, isNonEmpty} from "../requests/helpers.js";
import {
  createSprint,
  fetchAllBoardsForProject,
  fetchAllNotDoneStoriesTasksForBoard,
  fetchAllNotDoneStoriesTasksForBoardBacklog,
  fetchCurrentProject,
  getIssueFieldByUntranslatedName,
  moveIssuesToSprint
} from "../requests/template_requests";
import ReactDOM from "react-dom";
import LoadingComponent from "./LoadingComponent";
import {getValueInStorage, setValueInStorage} from "../requests/storage";

export default function SelectIssuesForSprintPage(){
  let selectedBoardId = null;

  const onGenerationParamsSubmitted = async(event) => {
    event.preventDefault();

    // display loading
    let parent = document.getElementById('display-generation-result-component-parent');
    ReactDOM.render(<LoadingComponent />, parent);


    const estimateFieldId = (await getIssueFieldByUntranslatedName("Story point estimate")).id;

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
    const sprintGoal = sprintGoalInput.value;
    if(!isNonEmpty(sprintGoal)){
      alert("Sprint goal must be non-empty");
      return;
    }

    // get sprint duration
    const sprintDurationInput= document.getElementById("sprint-duration-input");
    const sprintDuration = sprintDurationInput.value;

    // get max issues number
    const maxIssuesNumberInput= document.getElementById("max-issues-number-input");
    const maxIssuesNumber = maxIssuesNumberInput.value;

    // get board ID
    const boardSelector = document.getElementById("select-board");
    selectedBoardId = boardSelector.value;

    // get issues
    const issues = await fetchAllNotDoneStoriesTasksForBoardBacklog(selectedBoardId);

    // format issues
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
      sprintGoal, sprintDuration, maxIssuesNumber, JSON.stringify(issuesFormatted));

    console.log(prompt); //////////////////////////////////////////////////////////////////////////////


    // save fields in storage
    await setValueInStorage('product', product);
    await setValueInStorage('product-vision', productVision);


    // render result
    ReactDOM.render(<DisplayGenerationResult prompt={prompt} issues={issues}
                                                      issuesFormatted={issuesFormatted}/>, parent);


    /*
    Inputs:
      + select-board // board.id
      + product-input // text
      + product-vision-input // textarea
      + sprint-goal-input // text
      + sprint-duration-input // number
      + max-issues-number-input // number

     */
  }





  // The basis of whole page
  return(
    <div className={"p-2 pb-5"}>
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
              <label htmlFor="max-issues-number-input" className="col-2 text-end">Max number of issues to take in sprint:</label>
              <input id="max-issues-number-input" type="number" min={1} step={1} defaultValue={1} className="form-control col"/>
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


  // display-generation-result-component-parent
  function DisplayGenerationResult({prompt, issues, issuesFormatted}){
    return(
      <h1>HELLO!!!</h1>
    )
  }
}