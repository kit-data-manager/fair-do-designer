/**
 * @fileoverview Exports all block definitions available.
 */

import { pidrecord } from "./pidrecord";
import { profile } from "./hmc_profile";
import { attribute } from "./attribute";
import "./input"
import * as Blockly from "blockly/core";
import {transform_string} from "./transform";

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  pidrecord,
  profile,
  attribute,
  transform_string
]);
