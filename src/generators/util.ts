import * as Blockly from "blockly/core";

/**
 *
 * @param name the name to which the PID should be returned
 * @param prefixes the map of prefixes to their PIDs
 * @returns the PID assigned to the given input name
 */
export function getPidByPrefixMap(
  name: string,
  prefixes: { [key: string]: string },
): string | undefined {
  for (const [key, pid] of Object.entries(prefixes)) {
    if (name === key || name.startsWith(key)) {
      return pid;
    }
  }
  // This is a config error: It means the profile likely is missing
  // the PIDs for the given input name.
  // Should not happen in future as soon as we generate the profile
  // blocks from a given profile PID. Then, this may be removed.
  console.debug(`PID not found for input ${name}`);
  return undefined;
}

export interface RecordMappingGenerator {
  /**
   * Generates a chain call to set the ID for a record or entity.
   * @param id The identifier to be set
   * @returns A string representing the chain call, e.g., ".setId('myId')"
   */
  makeSetIDChainCall(id: string): string;
  /**
   * Generates a chain call to add an attribute key-value pair to a record or entity.
   * @param key The attribute name or identifier
   * @param value The value to be associated with the key
   * @returns A string representing the chain call, e.g., ".add('name', 'value')"
   */
  makeAddAttributeChainCall(key: string, value: string): string;
  /**
   * Generates a line comment in the target programming language.
   * @param text The comment text to be included
   * @returns A formatted comment string according to the language syntax
   */
  makeLineComment(text: string): string;
  /**
   * Generates a call to build a simple JSON representation of the record.
   * @returns A string representing the method call, e.g., ".toSimpleJSON()"
   */
  makeSimpleJsonBuildCall(): string;
}
export type FairDoCodeGenerator = RecordMappingGenerator &
  Blockly.CodeGenerator;
