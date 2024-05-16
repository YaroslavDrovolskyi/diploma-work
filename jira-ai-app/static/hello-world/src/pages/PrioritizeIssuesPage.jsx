import {
  fetchAllBoardsForProject,
  fetchAllNotClosedSprintsForBoard,
  fetchAllNotDoneStoriesTasksForSprint
} from "../requests/template_requests";
import {createEstimateIssuesPrompt, createPrioritizeIssuesPrompt} from "../requests/prompts_generators";
import {useEffect} from "react";
import {requestJira} from "@forge/bridge";


export default function PrioritizeIssuesPage(){
  const loadData = async() => {
    /*
    const prioritizePrompt = await createPrioritizeIssuesPrompt(
      "<< PRODUCT >>",
      "<< PRODUCT_VISION >>",
      "[{1}, {2}, {3}, {4}, {5}, {6}]",
      "[{1}, {2}, {3}, {4}, {5}]",
    );
    console.log(`Prioritize prompt: ${prioritizePrompt}`);

    const estimatePrompt = await createEstimateIssuesPrompt(
      "<< PRODUCT >>",
      "<< PRODUCT_VISION >>",
      "[{1}, {2}, {3}, {4}, {5}]",
    );
    console.log(`Estimate prompt: ${estimatePrompt}`);

     */

    /*
    const sprints = await fetchAllNotClosedSprintsForBoard("1");
    console.log(JSON.stringify(sprints));

     */


    // NEED to test number and string


    // issues for sprint
    const issues1 = await fetchAllNotDoneStoriesTasksForSprint("8"); // need to try 21 (empty sprint), maxItems=1
    console.log(`Issues1: ${JSON.stringify(issues1)}`);

    // issues for sprint
    const issues2 = await fetchAllNotDoneStoriesTasksForSprint(11);
    console.log(`Issues2: ${JSON.stringify(issues2)}`);

    // issues for sprint
    const issues3 = await fetchAllNotDoneStoriesTasksForSprint("21"); // empty sprint
    console.log(`Issues3: ${JSON.stringify(issues3)}`);


    /////////////////////////////////////////////// NEED to test all-sprint request by putting maxItems=1
  };


  useEffect(() => {
    loadData();
  }, []);


  return(
    <>
      <p>Hello!</p>
    </>
  );
}