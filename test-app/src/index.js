export { handler } from './resolvers';
import api, { route } from '@forge/api';

export const getAllBoards = async() => {
  console.log('Before getAllBoards() request');
  const response = await api.asApp().requestJira(route`/rest/agile/latest/board`); // latest instead of 1.0

  console.log(`Response (getAllBoards()): ${response.status} ${response.statusText}`);
  return await response.json();
}
