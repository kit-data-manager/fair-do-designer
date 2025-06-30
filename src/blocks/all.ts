/**
 * @fileoverview Exports all block definitions available.
 */

import { pidrecord, pidrecord_skipable } from "./pidrecord"
import { profile_hmc } from "./hmc_profile"
import { attribute } from "./attribute"
import { stop_design, log_value, otherwise } from "./error_handling"

import * as Blockly from "blockly/core"
import { input_custom_json, input_jsonpath } from "./input"
import { transform_string } from "./transform"

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    pidrecord,
    pidrecord_skipable,
    attribute,
    transform_string,
])

Blockly.Blocks["input_jsonpath"] = input_jsonpath
Blockly.Blocks["input_custom_json"] = input_custom_json
Blockly.Blocks["profile_hmc"] = profile_hmc
Blockly.Blocks["stop_design"] = stop_design
Blockly.Blocks["log_value"] = log_value
Blockly.Blocks["otherwise"] = otherwise
