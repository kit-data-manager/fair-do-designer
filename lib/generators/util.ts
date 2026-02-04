import * as Blockly from "blockly/core";
import * as HmcProfile from "../blocks/hmc_profile"

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
   * Prefixes given lines only if the test contains relevant code,
   * i.e. the text is not empty and is not just an empty string
   * within the target language
   * @param text the lines to prefix
   * @param prefix the prefix to prepent to each line
   */
  prefixNonemptyLines(text: string, prefix: string): string;
  /**
   * Quotes a given string value according to the target language's syntax.
   * @param value_input The string value to be quoted
   * @returns A properly quoted string
   */
  quote_(value_input: string): string;
  /**
   * Returns the order value for atomic expressions in the target language.
   * @returns The order value representing atomic expressions
   */
  getOrderAtomic(): number;
  /**
   * Returns the order value for collection expressions in the target language.
   * @returns The order value representing collection expressions
   */
  getOrderCollection(): number;
  /**
   * Returns the order value for none expressions in the target language.
   * @returns The order value representing none expressions
   */
  getOrderNone(): number;
}

export type FairDoCodeGenerator = RecordMappingGenerator &
  Blockly.CodeGenerator;

// Type guard for HmcBlock interface
export function isHmcBlock(obj: unknown): obj is HmcProfile.HMCBlock {
    return (
        obj !== null &&
        typeof obj === "object" &&
        "profileAttributeKey" in obj &&
        typeof obj.profileAttributeKey === "string" &&
        "profile" in obj &&
        typeof obj.profile === "object" &&
        typeof obj.profile === "object" &&
        obj.profile != undefined &&
        "identifier" in obj.profile &&
        typeof obj.profile.identifier === "string" &&
        "inputList" in obj &&
        Array.isArray(obj.inputList) &&
        "extractPidFromProperty" in obj &&
        typeof obj.extractPidFromProperty === "function"
    )
}