/**
 * @fileoverview Exports all block definitions available.
 */

import { pidrecord } from "./pidrecord";
import { profile } from "./hmc_profile";
import { attribute } from "./attribute";

import * as Blockly from "blockly/core";

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  pidrecord,
  profile,
  attribute,
]);
