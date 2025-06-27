/**
 * This (and the webpack config) enables us to import Python files as strings.
 * This is useful for loading Python code snippets or templates directly.
 */
declare module "*.py" {
  const content: string
  export default content
}