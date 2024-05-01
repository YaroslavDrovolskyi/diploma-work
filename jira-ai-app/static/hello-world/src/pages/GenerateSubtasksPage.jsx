
/*
Get all issues using "Get issues for board" request. NEED to correctly handle paging in API responses

We also can use "Get issues for board" with Jira Expression API (but be careful with limits).

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

export default function GenerateSubtasksPage(){
  const [allUserStories, setAllUserStories] = useState(null);
  const [allBoards, setAllBoards] = useState(null);


  const loadData = async() => {
    setAllUserStories(await fetchAllStoriesTasksForBoard(1));
    setAllBoards(await fetchAllBoards());
  };

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);

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

  return(
    <>
      <p>Text will be delivered</p>
    </>
  );

/*
  return(
    <>
      <form name="form-generate-subtasks" onSubmit={handleSubmit}>
        <div className={"form-group container"}>
          <div className={"row mb-3"}>
            <label className="col-2 text-end">Name</label>
            <input name="name" type="text" required={true} pattern={"^(?!\\s*$).+"} maxLength={40} className={"form-control col"}/>
          </div>

          <div className={"row mb-3"}>
            <label className="col-2 text-end">Variety</label>
            <input name="variety" type="text" required={true} pattern={"^(?!\\s*$).+"} maxLength={40} className={"form-control col"}/>
          </div>

          <div className={"row mb-3"}>
            <label className="col-2 text-end">Type</label>
            <select name="planting-material-type" className={"form-select col"}
                    value={plantingMaterialType} onChange={changePlantingMaterialType}>
              <option value="TREE_SEEDLING">Tree seedling</option>
              <option value="BUSH_SEEDLING">Bush seedling</option>
              <option value="FLOWER_SEEDLING">Flower seedling</option>
            </select>
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

          <input type="submit" value={"Create!"} className={"btn btn-success form-control mt-3"}/>
        </div>
      </form>
    </>
  );

 */
}

