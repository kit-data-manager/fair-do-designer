/**
 * Utility functions for code generators.
 */
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