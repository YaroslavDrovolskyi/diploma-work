import {
  fetchAllBoardsForProject,
  fetchAllStoriesTasksForBoard,
  fetchCurrentProject, fetchIssue
} from "../requests/template_requests";
import {useEffect, useState} from "react";
import LoadingComponent from "./LoadingComponent";
import ReactDOM from "react-dom";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines} from "../requests/helpers.js";
import {createGenerateSubtasksPrompt} from "../requests/prompts_generators";

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

    let issues = await fetchAllStoriesTasksForBoard(boardId);

    // render inputs for generation parameters
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


      const issue = await fetchIssue(selectedIssueId);

      let issueSummary = issue?.fields?.summary; // summary is not formatted using Jira wiki
      if(issueSummary === undefined || issueSummary === null){
        issueSummary = '';
      }

      let issueDescription = issue?.fields?.description;
      issueDescription = ((issueDescription !== undefined) && (issueDescription !== null))
        ? convertJiraWikiMarkupToPlainText(issueDescription)
        : '';





      // generate prompt ///////////////////////////////////////////////////////
//      const prompt = await createGenerateSubtasksPrompt(product, productVision,
//        technologies, issueName, issueDescription, subtasksString, maxSubtasksNumber);

      // save fields in storage
      await setValueInStorage('product', product);
      await setValueInStorage('product-vision', productVision);


      /////////////////////////////////////////////////////////////// TEST
      console.log(`Product: ${product}`);
      console.log(`Product vision: ${productVision}`);
      console.log(`Issue summary: ${issueSummary}`);
      console.log(`Issue description: ${issueDescription}`);


      // render generated subtasks
      // pass prompt to other component. That prompt will make request to Gemini, and display result.
//      ReactDOM.render(<DisplayGeneratedSubtasksComponent prompt={prompt}/>, parent);
    }
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

}