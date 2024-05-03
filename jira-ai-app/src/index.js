import Resolver from '@forge/resolver';
import {storage} from "@forge/api";

const resolver = new Resolver();


// https://developer.atlassian.com/platform/forge/runtime-reference/storage-api-basic/
resolver.define('setValueInStorage', async ({payload, context}) => {
  await storage.set(payload.key, payload.value);
});


resolver.define('getValueInStorage', async ({payload, context}) => {
  return await storage.get(payload.key);
});

resolver.define('deleteValueInStorage', async ({payload, context}) => {
  await storage.delete(payload.key);
});


export const handler = resolver.getDefinitions();

