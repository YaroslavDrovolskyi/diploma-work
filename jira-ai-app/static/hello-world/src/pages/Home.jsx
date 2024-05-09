import {createSubtask, deleteIssue, fetchAllBoardsForProject} from "../requests/template_requests";
import {useEffect} from "react";

export default function Home(){


  const loadData = async() => {
/*    const createdSubtask = await createSubtask(10002, {
      task: "Task to get fresh AIR",
      description: "Open the window to get fresh AIR into your room"
    });
    console.log(`Created subtask: ${JSON.stringify(createdSubtask)}`);

 */

    await deleteIssue('TP-37');
  };

  useEffect(() => {
    loadData().then(r => console.log('loadData() finished'));
  }, []);


  return(
    <div>
      <h1>HOME PAGE</h1>
    </div>
  );
}