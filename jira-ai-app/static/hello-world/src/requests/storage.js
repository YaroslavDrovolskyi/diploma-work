import { storage } from '@forge/api';
import {invoke} from "@forge/bridge";

/**
 * Reference on corresponding API: https://developer.atlassian.com/platform/forge/runtime-reference/storage-api-basic/
 */

/**
 *
 * @param key is string
 * @param value is object/array/boolean/number/string
 * @return {Promise<void>}
 */
export const setValueInStorage = async(key, value) => {
  await invoke('setValueInStorage', {key: key, value: value});
}

/**
 * Gets a value by key. If the key doesn't exist, the API returns empty object (`{}`) [But API reference said about `undefined` ].
 * @param key
 * @return {Promise<unknown>}
 */
export const getValueInStorage = async(key) => {
  return await invoke('getValueInStorage', {key: key});
}

export const deleteValueInStorage = async(key) => {
  return await invoke('deleteValueInStorage', {key: key});
}