/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python"
import * as Blockly from "blockly/core"
import * as HmcProfile from "../blocks/hmc_profile"
import * as Util from "./util"
import builderCode from './record_builder.py'

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
        super.init(workspace)
        this.addReservedWords("math,random,Number")
        Object.assign(this.forBlock, pythonGenerator.forBlock)
        Object.assign(this.forBlock, forBlock)
        this.definitions_["record-builder-code"] = builderCode
    }

    makeAddAttributeChainCall(key: string, value: string): string {
        return `.add("${key}", ${value})\n`
    }

    makeSetIDChainCall(id: string): string {
        return `.setId(${id})\n`
    }

    makeLineComment(text: string): string {
        return this.prefixLines(`${text}\n`, "# ")
    }

    makeSimpleJsonBuildCall(): string {
        return this.prefixLines(".toSimpleJSON()\n", this.INDENT)
    }
}

/**
 * The generator will import all the definitions
 * assigned to this object.
 */
const forBlock = Object.create(null)

forBlock["pidrecord"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC)

    const statement_record = generator.statementToCode(block, "record")

    var code = generator.makeLineComment(`${block.type}`)
    code += `records_graph.append( PidRecord()\n`
    code += generator.prefixLines(
        generator.makeSetIDChainCall(value_localid),
        generator.INDENT,
    )
    code += statement_record
        + generator.makeSimpleJsonBuildCall()
        + "\n"
    code += ")\n"
    return code
}

forBlock["pidrecord_skipable"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    let value_skip_condition = generator.valueToCode(block, "skip-condition", Order.ATOMIC)
    if (!value_skip_condition || value_skip_condition.trim() == "") {
        value_skip_condition = "True" // Default to True if no condition is provided
    }

    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC)

    const statement_record = generator.statementToCode(block, "record")

    const start_comment = generator.makeLineComment(`${block.type}`)
    let code = `records_graph.append( PidRecord()\n`
    code += generator.prefixLines(
        generator.makeSetIDChainCall(value_localid),
        generator.INDENT,
    )
    code += statement_record
        + generator.makeSimpleJsonBuildCall()
        + "\n"
    code += ")\n"

    const intendedCode = generator.prefixLines(code, generator.INDENT)
    const outerCode = `${start_comment}if ${value_skip_condition}:\n${intendedCode}\n`
    return outerCode
}

forBlock["attribute_key"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const dropdown_on_fail = block.getFieldValue("on_fail")
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_slot = generator.valueToCode(block, "slot", Order.ATOMIC)
    const text_pid = block.getFieldValue("pid")

    var code = ""
    if (value_slot) {
        code += generator.makeLineComment(`${block.type}`)
        code += generator.makeAddAttributeChainCall(text_pid, value_slot)
    }
    return code
}

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
}

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
}

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
}

forBlock["input_jsonpath"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_input = block.getFieldValue("QUERY")
    return [`jsonpath("${value_input}")`, Order.ATOMIC]
}

forBlock["input_read_key"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const text_key = block.getFieldValue("KEY")
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_input = generator.valueToCode(block, "INPUT", Order.ATOMIC)

    // TODO: Assemble python into the code variable.
    const code = `${value_input}.readKey("${(text_key + "").replace(/"/g, "")}")`
    // TODO: Change Order.NONE to the correct operator precedence strength
    return [code, Order.ATOMIC]
}

forBlock["input_read_index"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const text_key = block.getFieldValue("KEY")
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_input = generator.valueToCode(block, "INPUT", Order.ATOMIC)

    // TODO: Assemble python into the code variable.
    const code = `${value_input}.readIndex(${(text_key + "").replaceAll(/\D/g, "")})`
    // TODO: Change Order.NONE to the correct operator precedence strength
    return [code, Order.ATOMIC]
}

forBlock["input_source"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const dropdown_source = block.getFieldValue("SOURCE")

    // TODO: Assemble python into the code variable.
    const code = `getSource(${dropdown_source})`
    // TODO: Change Order.NONE to the correct operator precedence strength
    return [code, Order.ATOMIC]
}

// Type guard for HmcBlock interface
function isHmcBlock(obj: any): obj is HmcProfile.HMCBlock {
    return (
        obj &&
        typeof obj.profileAttributeKey === "string" &&
        typeof obj.profile === "object" &&
        typeof obj.profile.identifier === "string" &&
        Array.isArray(obj.inputList) &&
        typeof obj.extractPidFromProperty === "function"
    )
}

forBlock["profile_hmc"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    if (!isHmcBlock(block)) {
        throw new Error("Expected block to conform to HmcBlock interface")
    }

    var code = generator.makeLineComment(`${block.type}`)
    code += generator.makeAddAttributeChainCall(
        block.profileAttributeKey,
        "'" + block.profile.identifier + "'",
    )

    for (const input of block.inputList) {
        const name = input.name
        const pid = block.extractPidFromProperty(name)
        // TODO: change Order.ATOMIC to the correct operator precedence strength
        const value = generator.valueToCode(block, name, Order.ATOMIC)
        // If we want to check if the result is technically a python list, we can do it this way.
        // We currently simply push this further down to the python code itself.
        // Still, this information may be used to format the list in the generated code or so.
        //const isList: boolean = input.connection?.targetBlock()?.type.startsWith("lists_") || false;
        if (pid !== undefined && value && value != "") {
            code += generator.makeAddAttributeChainCall(pid, value)
        }
    }
    return code
}

forBlock['stop_design'] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    let value_message = generator.valueToCode(block, 'MESSAGE', Order.ATOMIC);
    if (!value_message || value_message.trim() == "") {
        value_message = '"No error message provided"'
    }
    const code = `raise Exception("Design stopped. " + ${value_message})`;
    return [code, Order.ATOMIC];
}

forBlock['log_value'] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_value = generator.valueToCode(block, 'VALUE', Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_name = generator.valueToCode(block, 'DESC', Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_reason = generator.valueToCode(block, 'REASON', Order.ATOMIC);

  const code = `log(${value_value}, ${value_name}, ${value_reason})\n`;
  return [code, Order.ATOMIC];
}