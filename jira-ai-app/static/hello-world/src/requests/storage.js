import { storage } from '@forge/api';


export const setValueInStorage = async() => {
  await storage.set('example-key', {field1: 'value1'});
}

export const getValueInStorage = async() => {
  return await storage.get('example-key');
}