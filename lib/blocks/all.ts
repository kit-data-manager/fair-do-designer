/**
 * @fileoverview Exports all block definitions available.
 */

import { pidrecord, pidrecord_skipable } from "./pidrecord"
import { profile_hmc } from "./hmc_profile"
import { attribute, backlink_declaration } from "./attribute"
import { stop_design, log_value, otherwise } from "./error_handling"

import * as Blockly from "blockly/core"
import {
    input_custom_json_path,
    input_custom_json_pointer,
    input_json_pointer,
} from "./input"
import "@blockly/block-plus-minus"

Blockly.Blocks["pidrecord"] = pidrecord
Blockly.Blocks["pidrecord_skipable"] = pidrecord_skipable

Blockly.Blocks["input_jsonpath"] = input_json_pointer // TODO: Remove
Blockly.Blocks["input_json_pointer"] = input_json_pointer
Blockly.Blocks["input_custom_json"] = input_custom_json_path // TODO: Remove
Blockly.Blocks["input_custom_json_path"] = input_custom_json_path
Blockly.Blocks["input_custom_json_pointer"] = input_custom_json_pointer

Blockly.Blocks["profile_hmc"] = profile_hmc
Blockly.Blocks["profile_hmc_reference_block"] =
    profile_hmc.createAttributeReferenceBlock()

Blockly.Blocks["attribute_key"] = attribute
Blockly.Blocks["backlink_declaration"] = backlink_declaration

Blockly.Blocks["stop_design"] = stop_design
Blockly.Blocks["log_value"] = log_value
Blockly.Blocks["otherwise"] = otherwise
