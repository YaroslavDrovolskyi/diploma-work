import {createSubtask, deleteIssue, fetchAllBoardsForProject} from "../requests/template_requests";
import {useEffect} from "react";
import {convertJiraWikiMarkupToPlainText, isEmpty, replaceNewlines} from "../requests/helpers.js";

export default function Home(){

  /*
    const loadData = async() => {
      const createdSubtask = await createSubtask(10002, {
        task: "Task to get fresh AIR",
        description: "Open the window to get fresh AIR into your room"
      });
      console.log(`Created subtask: ${JSON.stringify(createdSubtask)}`);

   */

//    await deleteIssue('TP-37');
//  };

  /*
  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);

   */


  const selectedIssue = {
    id: "100",
    key: "TP-100",
    summary: "Some summary of selected issue",
    description: "Some description of selected issue"
  };

  const answer = {
    action: "SPLIT",
    parts: [
      {
        summary: "summary 1",
        description: "description 1"
      },
      {
        summary: "summary 2",
        description: "description 2"
      },
      {
        summary: "summary 3",
        description: "description 3"
      },
      {
        summary: "summary 4",
        description: "description 4"
      },
      {
        summary: "summary 5",
        description: "description 5"
      }
    ]
  };


  return(
    <>
      <DisplayRefinementSplitAdviceComponent selectedIssue={selectedIssue} answer={answer}/>
    </>
  );

}

function DisplayRefinementSplitAdviceComponent({selectedIssue, answer}) {
  return (
    <>
      <h3>Generated advice (SPLIT):</h3>
      <form name="form-generated-advice-split-select-parts">
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
              <b>Parts to be SPLIT into:</b>
              <p className={"mb-0"}>Select parts (at least 1) you want to create instead of selected issue. Apply is irreversible.</p>
              <p className={"mb-0"}>You can edit generated parts</p>
              <p>Applying of refinement is irreversible.
                After applying, <b>selected issue will be deleted</b>, its subtasks will become children of first selected part</p>
              {answer.parts.map((part, index) => (
                <div className={"row mb-3 border border-2 rounded"}>

                  {/* Column for checkbox */}
                  <div className="col-1 d-flex flex-row justify-content-center align-items-center">
                    <input className={"form-check-input"} type="checkbox"
                           id={`generated-advice-split-checkbox-part-${index}`}/>
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
                        <input type="text" className="form-control mb-0"
                               id={`generated-advice-split-summary-part-${index}`}
                               defaultValue={replaceNewlines(part.summary)}/>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="row">
                      <div className="col-2">
                        <b className={"mb-0"}>Description:</b>
                      </div>
                      <div className="col">
                            <textarea className="form-control mb-0"
                                      id={`generated-advice-split-description-part-${index}`}
                                      rows="3" defaultValue={part.description}/>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* NEED to make remark about what will be with subtasks of selected issue (after implementation)
                The best variant is to change parent of each generated subtask into first generated part*/}
              {/* NEED to make checkboxes what issues must be generated. Applying will be irreversible */}

              {/* When apply actions, need to take values from inputs, not from memory */}
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
