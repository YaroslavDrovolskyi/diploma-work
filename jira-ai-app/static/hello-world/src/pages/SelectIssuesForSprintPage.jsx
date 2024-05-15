import {useEffect} from "react";
import {createSelectIssuesForSprintPrompt} from "../requests/prompts_generators";
import {createSprint, moveIssuesToSprint} from "../requests/template_requests";

export default function SelectIssuesForSprintPage(){

  const loadData = async() => {
/*    const prompt = await createSelectIssuesForSprintPrompt(
      "<< Product >>",
      "<< Product Vision >>",
      "<< Sprint Goal >>",
      5,
      10,
      "<< JSON array of user stories>>"
      );

    console.log(prompt);

 */

    /*
    const sprint = await createSprint("1", {
      name: "NEWEST Sprint name",
      goal: "Sprint goal"
    });
    console.log(JSON.stringify(sprint));

     */

    const response = await moveIssuesToSprint("12", ["10078", "10002"]);
    console.log(`Response: ${response.status} ${response.statusText}`);
    // sprintId=12
  }

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);




  return(
    <div>
      <h1>PAGE 3</h1>
    </div>
  );
}