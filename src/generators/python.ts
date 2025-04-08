/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python";
import * as Blockly from "blockly/core";

export class RecordMappingGenerator extends PythonGenerator {
  constructor(name: string) {
    super(name);
    this.definitions_["record-bucket-class"] = `
class PidRecord:
    def __init__(self):
        self._tuples = set()

    def add(self, a, b):
        try:
            self._tuples.add((a, b))
            return True
        except:
            return False
`;
  }
}

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock["pidrecord"] = function (
  block: Blockly.Block,
  generator: Blockly.Generator,
): String {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC);

  const statement_record = generator.statementToCode(block, "record");

  // TODO: Assemble python into the code variable.
  const code = "...";
  return code;
};

forBlock["hmc_profile"] = function (
  block: Blockly.Block,
  generator: Blockly.Generator,
): String {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_dot = generator.valueToCode(block, "dot", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_name2 = generator.valueToCode(block, "NAME", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_loc1 = generator.valueToCode(block, "loc1", Order.ATOMIC);

  const dropdown_opt_selector = block.getFieldValue("opt_selector");

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_name = generator.valueToCode(block, "NAME", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_loc2 = generator.valueToCode(block, "loc1", Order.ATOMIC);

  // TODO: Assemble javascript into the code variable.
  const code = "var profile = 1\n";
  return code;
};

forBlock["attribute_key"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
): String {
  const code = "var attr = 1\n";
  return code;
};
