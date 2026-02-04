/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python"
import * as Blockly from "blockly/core"
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
    makeJsonPointerCall(jsonPointer: string): string {
        return `jsonpath.pointer.resolve(${jsonPointer}, executor.current_source_json)`
    }
    makeJsonpathCall(jsonPath: string): string {
        return `jsonpath.findall(${jsonPath}, executor.current_source_json)`
    }
    init(workspace: Blockly.Workspace) {
        super.init(workspace)
        this.addReservedWords("math,random,Number")
        Object.assign(this.forBlock, pythonGenerator.forBlock)
        Object.assign(this.forBlock, forBlock)
        this.definitions_["import-main"] = "import executor"
        this.definitions_["import-from-main"] =
            "from executor import RecordDesign, Executor, log"
        this.definitions_["import-from-conditionals"] =
            "from conditionals import *"
        this.definitions_["import-jsonpath"] = "import jsonpath"
        this.definitions_["executor"] = "EXECUTOR: Executor = Executor()"
        this.addReservedWords("EXECUTOR")
        this.addReservedWords("current_source_json")
    }

    getOrderAtomic(): number {
        return Order.ATOMIC
    }
    getOrderCollection(): number {
        return Order.COLLECTION
    }
    getOrderNone(): number {
        return Order.NONE
    }

    makeAddAttributeChainCall(key: string, value: string): string {
        if (value.startsWith("BackwardLinkFor(")) {
            return `.addAttribute(${key}, ${value})\n`
        } else {
            return `.addAttribute(${key}, lambda: ${value})\n`
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

function genericRecord<T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
    value_skip_condition: string,
) {
    const value_localid = generator.valueToCode(block, "local-id", generator.getOrderAtomic())
    const statement_record = generator.statementToCode(block, "record")

    let code = generator.makeLineComment(`${block.type}`)
    code += `EXECUTOR.addDesign( RecordDesign()\n`
    code += generator.prefixNonemptyLines(
        generator.makeSetIDChainCall(`str(${value_localid})`),
        generator.INDENT,
    )

    const hasCondition =
        value_skip_condition && value_skip_condition.trim() != ""
    if (hasCondition) {
        code += generator.prefixNonemptyLines(
            `.setSkipCondition(lambda: ${value_skip_condition})\n`,
            generator.INDENT,
        )
    }

    code += statement_record
    code += ")\n"
    return code
}

forBlock["pidrecord"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    return genericRecord(block, generator, "")
}

forBlock["pidrecord_skipable"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_skip_condition = generator.valueToCode(
        block,
        "skip-condition",
        generator.getOrderAtomic(),
    )
    return genericRecord(block, generator, value_skip_condition)
}

forBlock["attribute_key"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_key = generator.valueToCode(block, "KEY", generator.getOrderAtomic())
    const value_value = generator.valueToCode(block, "VALUE", generator.getOrderAtomic())

    let code = ""
    const isSomething = (thing: string | null | undefined) =>
        thing && thing.length > 0 && thing !== "''"
    if (isSomething(value_key) && isSomething(value_value)) {
        code += generator.makeLineComment(`## ${block.type} ##`)
        code += generator.makeAddAttributeChainCall(value_key, value_value)
    }
    return code
}

forBlock["input_json_pointer"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_input = block.getFieldValue("QUERY")
    const quoted = generator.quote_(value_input)
    return [generator.makeJsonPointerCall(quoted), generator.getOrderAtomic()]
}
forBlock["input_jsonpath"] = forBlock["input_json_pointer"] // TODO remove

forBlock["input_custom_json_path"] = function <
    T extends Util.FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_block = generator.valueToCode(block, "QUERY", generator.getOrderAtomic())
    return [generator.makeJsonpathCall(value_block), generator.getOrderAtomic()]
}
forBlock["input_custom_json"] = forBlock["input_custom_json_path"] // TODO remove

forBlock["input_custom_json_pointer"] = function <
    T extends Util.FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_block = generator.valueToCode(block, "QUERY", generator.getOrderAtomic())
    return [generator.makeJsonPointerCall(value_block), generator.getOrderAtomic()]
}

forBlock["profile_hmc"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    if (!Util.isHmcBlock(block)) {
        throw new Error("Expected block to conform to HmcBlock interface")
    }

    let code = generator.makeLineComment(`## ${block.type} ##`)
    code += generator.makeLineComment(`attribute: Self-Reference`)
    code += generator.makeAddAttributeChainCall(
        `"${block.profileAttributeKey}"`,
        "'" + block.profile.identifier + "'",
    )

    for (const input of block.inputList) {
        const name = input.name
        const pid = block.extractPidFromProperty(name)
        const value = generator.valueToCode(block, name, generator.getOrderAtomic())
        if (pid !== undefined && value && value != "") {
            code += generator.makeLineComment(`attribute: ${input.name}`)
            code += generator.makeAddAttributeChainCall(`"${pid}"`, value)
        }
    }
    return code
}

forBlock["stop_design"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    let value_message = generator.valueToCode(block, "MESSAGE", generator.getOrderAtomic())
    if (!value_message || value_message.trim() == "") {
        value_message = '"No error message provided"'
    }
    const code = `stop_with_fail(${value_message})`
    return [code, generator.getOrderAtomic()]
}

forBlock["log_value"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const text_desc = block.getFieldValue("DESC")
    const value_invar = generator.valueToCode(block, "INVAR", generator.getOrderAtomic())

    const code = `log(${value_invar}, "${text_desc}")\n`
    return [code, generator.getOrderNone()]
}

forBlock["otherwise"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_value = generator.valueToCode(block, "VALUE", generator.getOrderAtomic())
    const value_other = generator.valueToCode(block, "OTHER", generator.getOrderAtomic())
    const code = `otherwise(lambda: ${value_value}, lambda: ${value_other})\n`
    return [code, generator.getOrderNone()]
}

forBlock["backlink_declaration"] = function <
    T extends Util.FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_attribute_key = generator.valueToCode(
        block,
        "ATTRIBUTE_KEY",
        generator.getOrderAtomic(),
    )
    const code = "BackwardLinkFor(" + value_attribute_key + ")"
    return [code, generator.getOrderAtomic()]
}

forBlock["profile_hmc_reference_block"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T
) {
    const dropdown_attribute = block.getFieldValue("ATTRIBUTE")
    const code = `"${dropdown_attribute}"`
    return [code, generator.getOrderAtomic()]
}

forBlock["lists_create_with"] = function <T extends Util.FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const values: string[] = []
    for (const input of block.inputList) {
        const block = input.connection?.targetBlock()
        if (block) {
            const result = generator.blockToCode(block)
            if (typeof result === "string") {
                values.push(result)
            } else {
                values.push(result[0])
            }
        }
    }

    return [
        "[\n" +
            generator.prefixLines(values.join(", "), generator.INDENT) +
            "]",
        generator.getOrderCollection(),
    ]
}
