/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python"
import * as Blockly from "blockly/core"
import * as HmcProfile from "../blocks/hmc_profile"
import * as Util from "./util"

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
        this.definitions_["import-main"] = "import main"
        this.definitions_["import-from-main"] =
            "from main import RecordDesign, Executor, log"
        this.definitions_["import-from-conditionals"] =
            "from conditionals import *"
        this.definitions_["import-jsonpath"] = "import jsonpath"
        this.definitions_["executor"] = "EXECUTOR: Executor = Executor()"
        this.addReservedWords("EXECUTOR")
        this.addReservedWords("current_source_json")
    }

    makeAddAttributeChainCall(key: string, value: string): string {
        if (value.startsWith("BackwardLinkFor(")) {
            return `.addAttribute("${key}", ${value})\n`
        } else {
            return `.addAttribute("${key}", lambda: ${value})\n`
        }
    }

    makeSetIDChainCall(id: string): string {
        if (!this.isEmptyPythonString(id)) {
            return `.setId(lambda: ${id})\n`
        } else {
            return ""
        }
    }

    makeLineComment(text: string): string {
        return this.prefixLines(`${text}\n`, "# ")
    }

    isEmptyPythonString(s: string): boolean {
        return s == null || false || s.length <= 0 || s == "''" || s == '""'
    }

    prefixNonemptyLines(text: string, prefix: string): string {
        if (this.isEmptyPythonString(text)) {
            return text
        } else {
            return this.prefixLines(text, prefix)
        }
    }

    finish(code: string): string {
        code = super.finish(code)
        const suffix: string = "\nEXECUTOR.execute()\n"
        return code + suffix
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

    let code = generator.makeLineComment(`${block.type}`)
    code += `EXECUTOR.addDesign( RecordDesign()\n`
    code += generator.prefixNonemptyLines(
        generator.makeSetIDChainCall(`str(${value_localid}[0])`),
        generator.INDENT,
    )
    code += statement_record
    code += ")\n"
    return code
}

forBlock["pidrecord_skipable"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    let value_skip_condition = generator.valueToCode(
        block,
        "skip-condition",
        Order.ATOMIC,
    )
    if (!value_skip_condition || value_skip_condition.trim() == "") {
        value_skip_condition = "True" // Default to True if no condition is provided
    }

    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_localid = generator.valueToCode(block, "local-id", Order.ATOMIC)

    const statement_record = generator.statementToCode(block, "record")

    const start_comment = generator.makeLineComment(`${block.type}`)
    let code = `EXECUTOR.addDesign( RecordDesign()\n`
    code += generator.prefixNonemptyLines(
        generator.makeSetIDChainCall(value_localid),
        generator.INDENT,
    )
    code += statement_record
    code += ")\n"

    const intendedCode = generator.prefixNonemptyLines(code, generator.INDENT)
    return `${start_comment}if ${value_skip_condition}:\n${intendedCode}\n`
}

forBlock["attribute_key"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_slot = generator.valueToCode(block, "slot", Order.ATOMIC)
    const text_pid = block.getFieldValue("pid")

    let code = ""
    if (value_slot) {
        code += generator.makeLineComment(`${block.type}`)
        code += generator.makeAddAttributeChainCall(text_pid, value_slot)
    }
    return code
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

const jsonpathCall = (path: string) =>
    `jsonpath.findall("${path}", main.current_source_json)`

forBlock["input_jsonpath"] = function (block: Blockly.Block) {
    const value_input = block.getFieldValue("QUERY")
    return [jsonpathCall(value_input), Order.ATOMIC]
}

forBlock["input_custom_json"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_block = generator.valueToCode(block, "QUERY", Order.ATOMIC)
    return [jsonpathCall(value_block), Order.ATOMIC]
}

// Type guard for HmcBlock interface
function isHmcBlock(obj: unknown): obj is HmcProfile.HMCBlock {
    return (
        obj !== null &&
        typeof obj === "object" &&
        "profileAttributeKey" in obj &&
        typeof obj.profileAttributeKey === "string" &&
        "profile" in obj &&
        typeof obj.profile === "object" &&
        typeof obj.profile === "object" &&
        obj.profile != undefined &&
        "identifier" in obj.profile &&
        typeof obj.profile.identifier === "string" &&
        "inputList" in obj &&
        Array.isArray(obj.inputList) &&
        "extractPidFromProperty" in obj &&
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

    let code = generator.makeLineComment(`${block.type}`)
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
            code += generator.makeLineComment(`attribute: ${block.type}`)
            code += generator.makeAddAttributeChainCall(pid, value)
        }
    }
    return code
}

forBlock["stop_design"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    let value_message = generator.valueToCode(block, "MESSAGE", Order.ATOMIC)
    if (!value_message || value_message.trim() == "") {
        value_message = '"No error message provided"'
    }
    const code = `stop_with_fail(${value_message})`
    return [code, Order.ATOMIC]
}

forBlock["log_value"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const text_desc = block.getFieldValue("DESC")
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_invar = generator.valueToCode(block, "INVAR", Order.ATOMIC)

    const code = `log(${value_invar}, "${text_desc}")\n`
    // TODO: Change Order.NONE to the correct operator precedence strength
    return [code, Order.NONE]
}

forBlock["otherwise"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_value = generator.valueToCode(block, "VALUE", Order.ATOMIC)

    // TODO: change Order.ATOMIC to the correct operator precedence strength
    const value_other = generator.valueToCode(block, "OTHER", Order.ATOMIC)

    const code = `otherwise(${value_value}, lambda: ${value_other})\n`
    // TODO: Change Order.NONE to the correct operator precedence strength
    return [code, Order.NONE]
}

forBlock["backlink_declaration"] = function <
    T extends Util.FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_attribute_key = generator.valueToCode(
        block,
        "ATTRIBUTE_KEY",
        Order.ATOMIC,
    )
    const code = "BackwardLinkFor(" + value_attribute_key + ")"
    return [code, Order.ATOMIC]
}

forBlock["profile_hmc_reference_block"] = function (block: Blockly.Block) {
    const dropdown_attribute = block.getFieldValue("ATTRIBUTE")
    const code = `"${dropdown_attribute}"`
    return [code, Order.ATOMIC]
}

forBlock["lists_create_with"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const values: string[] = []
    for (const input of block.inputList) {
        const block = input.connection?.targetBlock()
        if (block) {
            // TODO: Do we have to consider the operator precedence here?
            const result = generator.blockToCode(block)
            if (typeof result === "string") {
                values.push(result)
            } else {
                values.push(result[0])
            }
        }
    }

    return ["[" + values.join(", ") + "]", Order.COLLECTION]
}
