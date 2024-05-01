import Resolver from '@forge/resolver';
import {storage} from "@forge/api";

const resolver = new Resolver();


resolver.define('setValueInStorage', async ({payload, context}) => {
  await storage.set('example-key', {field1: 'value1'});
});


resolver.define('getValueInStorage', async ({payload, context}) => {
  return await storage.get('example-key');
});


export const handler = resolver.getDefinitions();

