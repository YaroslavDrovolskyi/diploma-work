import { storage } from '@forge/api';
import {invoke} from "@forge/bridge";


/**
 *
 * @param key is string
 * @param value is object/array/boolean/number/string
 * @return {Promise<void>}
 */
export const setValueInStorage = async(key, value) => {
  await invoke('setValueInStorage', {key: key, value: value});
}

export const getValueInStorage = async(key) => {
  return await invoke('getValueInStorage', {key: key});
}

export const deleteValueInStorage = async(key) => {
  return await invoke('deleteValueInStorage', {key: key});
}