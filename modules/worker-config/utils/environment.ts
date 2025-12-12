/**
 * Appends the given value with environment specific suffix as per convention,
 * when creating worker resources
 * @param value 
 * @param enviroment 
 */
export function appendEnviroment(value: string, enviroment: string): string {
  // For production we use the base value without suffix
  if (enviroment === 'production') {
    return value
  }

  return `${value}-${enviroment}`
}