/**
 * @fileoverview Exports all block definitions available.
 */

import { pidrecord, pidrecord_skipable } from "./pidrecord"
import { profile_hmc } from "./hmc_profile"
import { attribute } from "./attribute"
import { stop_design, log_value } from "./error_handling"

import * as Blockly from "blockly/core"
import {
    input_json,
    input_jsonpath,
    input_read_index,
    input_read_key,
    input_read_object,
    input_source,
} from "./input"
import { transform_string } from "./transform"

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
    pidrecord,
    pidrecord_skipable,
    attribute,
    input_json,
    input_read_object,
    input_read_key,
    input_read_index,
    input_source,
    transform_string,
    log_value
])

Blockly.Blocks["input_jsonpath"] = input_jsonpath
Blockly.Blocks["profile_hmc"] = profile_hmc
Blockly.Blocks["stop_design"] = stop_design
