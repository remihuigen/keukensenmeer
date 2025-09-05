/**
 * Returns the input string with the first letter capitalized.
 * @param input string to capitalize
 * @returns 
 */
export const capitalize = (input: string) => {
  return input[0] ? input[0].toUpperCase() + input.slice(1) : ''
}