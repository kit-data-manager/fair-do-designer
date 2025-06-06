/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python";
import * as Blockly from "blockly/core";
import * as HmcProfile from "../blocks/hmc_profile";
import * as Util from "./util";

/**
 * Specialized generator for our code.
 * In order to make the basic blocks reusable and generate proper code,
 * we should not override the existing methods but write new ones
 * (possibly reusing the existing functionality).
 */
export class RecordMappingGenerator
  extends PythonGenerator
  implements Util.RecordMappingGenerator
{
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
    this.definitions_["typed-pid-maker-connections"] = `
def createSingleRecord(pidrecord):
    # TODO implement request to a typed PID Maker instance
    # pseudocode:
    # if pidrecord.hasPid: update(pidrecord)
    # else: create(pidrecord)
    # onError: to be decided
    return "pid-of-pidrecord"
`;
  }

  makeAddAttributeChainCall(key: string, value: string): string {
    return `.add("${key}", ${value})\n`;
  }

  makeSetIDChainCall(id: string): string {
    return `.setId(${id})\n`;
  }

  makeLineComment(text: string): string {
    return this.prefixLines(`${text}\n`, "# ");
  }
}

/**
 * The generator will import all the definitions
 * assigned to this object.
 */
const forBlock = Object.create(null);

forBlock["pidrecord"] = function <T extends Util.FairDoCodeGenerator>(
  block: Blockly.Block,
  generator: T,
) {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC);

  const statement_record = generator.statementToCode(block, "record");

  var code = generator.makeLineComment(`${block.type}`);
  code += `records_graph.append( PidRecord()\n`;
  code += generator.prefixLines(
    generator.makeSetIDChainCall(value_localid),
    generator.INDENT,
  );
  code += statement_record + "\n";
  code += ")\n";
  return code;
};

forBlock["hmc_profile"] = function <T extends Util.FairDoCodeGenerator>(
  block: Blockly.Block,
  generator: T,
) {
  var code = generator.makeLineComment(`${block.type}`);

  code += generator.makeAddAttributeChainCall(
    HmcProfile.data.self_attribute_key,
    HmcProfile.data.self_pid,
  );

  for (const input of block.inputList) {
    const name = input.name;
    const pid = Util.getPidByPrefixMap(name, HmcProfile.data.pidMap);
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value = generator.valueToCode(block, name, Order.ATOMIC);
    if (pid !== undefined && value && value != "") {
      code += generator.makeAddAttributeChainCall(pid, value);
    }
  }
  return code;
};

forBlock["attribute_key"] = function <T extends Util.FairDoCodeGenerator>(
  block: Blockly.Block,
  generator: T,
) {
  const dropdown_on_fail = block.getFieldValue("on_fail");
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_slot = generator.valueToCode(block, "slot", Order.ATOMIC);
  const text_pid = block.getFieldValue("pid");

  var code = "";
  if (value_slot) {
    code += generator.makeLineComment(`${block.type}`);
    code += generator.makeAddAttributeChainCall(text_pid, value_slot);
  }
  return code;
};

forBlock["input_json"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  const keyBlock = block.getInputTargetBlock("KEY")
  const input = block.getFieldValue("INPUT")
  let key = ""

  if (keyBlock) {
    key = generator.blockToCode(keyBlock)[0]
  }

  return [`${input}.getKey(${key})`, Order.ATOMIC]
};

forBlock["input_read_object"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  const keyBlock = block.getInputTargetBlock("KEY")
  const objBlock = block.getInputTargetBlock("OBJ")
  let key = "null"
  let obj = "{}"

  if (keyBlock) {
    key = generator.blockToCode(keyBlock)[0]
  }

  if (objBlock) {
    obj = generator.blockToCode(objBlock)[0]
  }

  return [`${obj}.getKey(${key})`, Order.ATOMIC]
};

forBlock["transform_string"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  const inBlock = block.getInputTargetBlock("INPUT")
  let inText = "null"

  if (inBlock) {
    inText = generator.blockToCode(inBlock)[0]
  }

  return [`transform.toString(${inText})`, Order.ATOMIC]
};

forBlock["input_jsonpath"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  return ["None", Order.ATOMIC]
};

forBlock['input_read_key'] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  const text_key = block.getFieldValue('KEY');
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_input = generator.valueToCode(block, 'INPUT', Order.ATOMIC);

  // TODO: Assemble python into the code variable.
  const code = `${value_input}.readKey("${(text_key + "").replace(/"/g, "")}")`;
  // TODO: Change Order.NONE to the correct operator precedence strength
  return [code, Order.ATOMIC];
}

forBlock['input_source'] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  const dropdown_source = block.getFieldValue('SOURCE');

  // TODO: Assemble python into the code variable.
  const code = `getSource(${dropdown_source})`;
  // TODO: Change Order.NONE to the correct operator precedence strength
  return [code, Order.ATOMIC];
}