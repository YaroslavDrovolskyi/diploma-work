import Resolver from '@forge/resolver';

export function getAllBoards() {
}


const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

export const handler = resolver.getDefinitions();
