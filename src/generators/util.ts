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
   * Should generate something like ".add(key, value)", depending on language.
   * @param key
   * @param value
   */
  makeAddAttributeChainCall(key: string, value: string): string;
}
export type FairDoCodeGenerator = RecordMappingGenerator &
  Blockly.CodeGenerator;
