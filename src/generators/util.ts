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
   * @param isList Optional flag indicating if the value is a list
   *              (if undefined, value is treated as a single value)
   * @returns A string representing the chain call, e.g., ".add('name', 'value')"
   */
  makeAddAttributeChainCall(key: string, value: string, isList?: boolean): string;
  /**
   * Generates a line comment in the target programming language.
   * @param text The comment text to be included
   * @returns A formatted comment string according to the language syntax
   */
  makeLineComment(text: string): string;
}
export type FairDoCodeGenerator = RecordMappingGenerator &
  Blockly.CodeGenerator;
