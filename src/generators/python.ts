/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python";
import * as Blockly from "blockly/core";

export class RecordMappingGenerator extends PythonGenerator {
  init(workspace: Blockly.Workspace) {
    super.init(workspace);
    this.addReservedWords("math,random,Number");
    this.forBlock = pythonGenerator.forBlock;
    Object.assign(this.forBlock, forBlock);
    this.definitions_["record-bucket-class"] = `
class PidRecord:
    def __init__(self):
        self._id = ""
        self._pid = ""
        self._tuples = set()

    def setPid(self, pid):
        self._pid = pid
        return self

    def setId(self, id):
        self._id = id
        return self

    def add(self, a, b):
        self._tuples.add((a, b))
        return self
`;
  }
}

/**
 * The generator will import all the definitions
 * assigned to this object.
 */
const forBlock = Object.create(null);

forBlock["pidrecord"] = function (
  block: Blockly.Block,
  generator: Blockly.Generator,
): String {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC);

  const statement_record = generator.statementToCode(block, "record");

  var code = "result = (PIDRecord()\n";
  code += ".setId(" + value_localid + ")\n";
  code += statement_record + "\n";
  code += ")\n";
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
  const code = "";
  return code;
};

forBlock["attribute_key"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
): String {
  const dropdown_on_fail = block.getFieldValue("on_fail");
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_slot = generator.valueToCode(block, "slot", Order.ATOMIC);

  const text_pid = block.getFieldValue("pid");

  // TODO: Assemble python into the code variable.
  const code = `.add(${text_pid},${value_slot})\n`;
  return code;
};
