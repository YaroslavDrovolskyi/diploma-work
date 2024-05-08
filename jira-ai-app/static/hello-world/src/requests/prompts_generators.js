import file from "../pages/some.hbs";

/**
 * Reads text of file.
 * Source: [https://stackoverflow.com/a/64788876](https://stackoverflow.com/a/64788876)
 * @param file is file, imported by caller. Example: `import raw from '../constants/foo.txt';`
 * @return {Promise<string>} text from given `file`.
 */
// path
export const readFile = async(file) => {
  let response = await fetch(file);
  return await response.text();
}


/**
 * Replaces substrings in given `str` according to given `replacementMap`.
 *
 * Source: [https://stackoverflow.com/a/15604206](https://stackoverflow.com/a/15604206)
 * @param str
 * @param replacementMap is map where each key is substring that you want to replace,
 * and corresponding value is string you want to replace the key by. For example: `{'str_to_replace': 'replacement_str'}`.
 * @return {string}
 */
export const replaceSubstrings = (str, replacementMap) => {
  const regex = new RegExp(Object.keys(replacementMap).join("|"),"gi");

  return str.replaceAll(regex, (matched) => {
    return replacementMap[matched.toLowerCase()];
  });
}


/**
 *
 * @param product the name of the product. It is string without newlines.
 * @param product_vision a desired state (rather description) of product being developed. It is string without newlines.
 * @param technologies list of technologies/methods used for developing Product. It is string without newlines.
 * @param user_story_name It is string without newlines.
 * @param user_story_description It is string without newlines.
 * @param tasks list (`\n`-separated) of subtasks that user story already has. (`summary. description`).
 * @param task_count is number
 */
export const createGenerateSubtasksPrompt = async (
  product,
  product_vision,
  technologies,
  user_story_name,
  user_story_description,
  tasks,
  task_count
) => {
  let file = require('../prompts_templates/generate-tasks.hbs');
  const promptTemplate = await readFile(file);

  const prompt = replaceSubstrings(promptTemplate, {
    '{{product}}': product,
    '{{product_vision}}': product_vision,
    '{{technologies}}': technologies,
    '{{user_story_name}}': user_story_name,
    '{{user_story_description}}': user_story_description,
    '{{tasks}}': tasks,
    '{{task_count}}': task_count
  });

  return prompt;
}