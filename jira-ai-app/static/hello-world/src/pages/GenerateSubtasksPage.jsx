
/*


Create List (with radio buttons) with all available user stories and tasks
(take not-DONE user stories from backlog (add section), and from each unfinished sprint (add section))
For each user story show: ID, Key, issue type, status, summary and description

Below, Put rest of input fields
Lower, put button "Generate"

(mb navigate to other page)
Lower, put list of generated tasks with checkbox near each one. Lower put "Add picked subtasks".
 */

import {useEffect, useState} from "react";
import {fetchAllBoards, fetchAllStoriesTasksForBoard} from "../requests/template_requests";
import {getValueInStorage, setValueInStorage} from "../requests/storage";
import {invoke} from "@forge/bridge";
import {convertJiraWikiMarkupToPlainText} from "../requests/helpers";

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

  const handleIssueSelection = async(event) => {
    event.preventDefault();

    const selector = document.getElementById("select-board");
    const boardId = selector.value;

    let checkedRadiobtn = document.querySelector('input[name="issue-radiobtn"]:checked');

    if(checkedRadiobtn == null){
      console.log('No radiobutton is selected');
      alert('No radiobutton is selected');
    }
    else{
      console.log(checkedRadiobtn.value);
      alert(checkedRadiobtn.value);
    }
/*
    const rates = document.getElementsByName("issue-radiobtn");
    var rate_value;
    for(var i = 0; i < rates.length; i++){
      if(rates[i].checked){
        rate_value = rates[i].value;
      }
    }

 */

//    setIssues(await fetchAllStoriesTasksForBoard(boardId));
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

          <div className={"row mb-3"}>
            <label className="col-2 text-end">Board:</label>
            <select id={"select-board"} name={"select-board"} className={"form-select col"}>
              {boards.map((board) => (
                <option value={board.id}>{board.name}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className={"row justify-content-center mt-3"}>
            <div className="col-2 text-center">
              <input type="submit" value={"Select!"} className={"btn btn-success form-control mt-3"}/>
            </div>
          </div>

        </div>
      </form>



      {issues != null &&
        <>
          {/* Select issue */}
          <form name="form-choose-issue" onSubmit={handleIssueSelection}>
            <div className={"form-group container"}>

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
              <div className={"row justify-content-center mt-3"}>
                <div className="col-2 text-center">
                  <input type="submit" value={"Select!"} className={"btn btn-success form-control mt-3 mb-3"}/>
                </div>
              </div>

            </div>
          </form>
        </>
      }


    </>
  );
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

