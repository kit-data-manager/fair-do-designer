/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python";
// importing this triggers registration of inputs withcustom data
import * as DataInputs from "../inputs/data_inputs";
import * as Blockly from "blockly/core";

/**
 * Specialized generator for our code.
 * In order to make the basic blocks reusable and generate proper code,
 * we should not override the existing methods but write new ones
 * (possibly reusing the existing functionality).
 */
export class RecordMappingGenerator extends PythonGenerator {
  init(workspace: Blockly.Workspace) {
    super.init(workspace);
    this.addReservedWords("math,random,Number");
    Object.assign(this.forBlock, pythonGenerator.forBlock);
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

    def toSimpleJSON(self):
        result = {"entries": list(self._tuples)}
        if self._pid and self._pid != "":
            result["pid"] = self._pid
        return result

records_graph = []
`;
    this.definitions_["typped-pid-maker-connections"] = `
def createSingleRecord(pidrecord):
    # TODO implement request to a typed PID Maker instance
    # pseudocode:
    # if pidrecord.hasPid: update(pidrecord)
    # else: create(pidrecord)
    # onError: to be decided
    return "pid-of-pidrecord"
`;
  }

  getAttributeInput(
    block: Blockly.Block,
    name: string,
  ): DataInputs.AttributeValueInput | null {
    // TODO this function is a candidate for a parent class in-between for reuse in other generators (or a utility class)
    const input = block.getInput(name);
    if (input && input instanceof DataInputs.AttributeValueInput) {
      return input as DataInputs.AttributeValueInput;
    }
    return null;
  }

  addPairChainCall(block: Blockly.Block, input_name: string): string {
    // TODO this function is a candidate for a parent class in-between for reuse in other generators (or a utility class)
    var code = "";
    const dotInput = this.getAttributeInput(block, input_name);
    if (dotInput) {
      // TODO: change Order.ATOMIC to the correct operator precedence strength
      const value_dot = this.valueToCode(block, input_name, Order.ATOMIC);
      const pid_dot = dotInput.pid;
      code += `.add(${pid_dot}, ${value_dot})\n`;
    }
    return code;
  }
}

/**
 * The generator will import all the definitions
 * assigned to this object.
 */
const forBlock = Object.create(null);

forBlock["pidrecord"] = function (
  block: Blockly.Block,
  generator: RecordMappingGenerator,
): String {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC);

  const statement_record = generator.statementToCode(block, "record");

  var code = `records_graph.append( PidRecord()\n`;
  code += generator.INDENT + ".setId(" + value_localid + ")\n";
  code += statement_record + "\n";
  code += ")\n";
  return code;
};

forBlock["hmc_profile"] = function (
  block: Blockly.Block,
  generator: RecordMappingGenerator,
): String {
  var code = `# Block: ${block.type}\n`;

  code = generator.addPairChainCall(block, "dot");

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
  //const code = "";
  return code;
};

forBlock["attribute_key"] = function (
  block: Blockly.Block,
  generator: RecordMappingGenerator,
): String {
  const dropdown_on_fail = block.getFieldValue("on_fail");
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_slot = generator.valueToCode(block, "slot", Order.ATOMIC);

  const text_pid = block.getFieldValue("pid");

  // TODO: Assemble python into the code variable.
  const code = `.add("${text_pid}",${value_slot})\n`;
  return code;
};
