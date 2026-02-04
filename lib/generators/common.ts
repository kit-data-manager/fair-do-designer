/**
 * Mandatory interface and shared generator functions for code generators.
 */

import * as Blockly from "blockly/core"
import * as Util from "./util"

export interface RecordMappingGenerator {
  /**
   * Generates a chain call to set the ID for a record or entity.
   * @param id The identifier to be set
   * @returns A string representing the chain call, e.g., ".setId('myId')"
   */
  makeSetIDChainCall(id: string): string;
  /**
   * Generates a chain call to add an attribute key-value pair to a record or entity.
   * @param key The attribute name or identifier
   * @param value The value to be associated with the key
   * @returns A string representing the chain call, e.g., ".add('name', 'value')"
   */
  makeAddAttributeChainCall(key: string, value: string): string;
  /**
   * Generates a call to resolve a JSON Pointer against the current source JSON.
   * @param jsonPointer The JSON Pointer string
   * @returns A string representing the function call to resolve the JSON Pointer
   */
  makeJsonPointerCall(jsonPointer: string): string;
  /**
   * Generates a call to find all matches for a JSONPath expression against the current source JSON.
   * @param jsonpath The JSONPath expression string
   * @returns A string representing the function call to find all matches for the JSONPath
   */
  makeJsonpathCall(jsonpath: string): string;
  /**
   * Generates a line comment in the target programming language.
   * @param text The comment text to be included
   * @returns A formatted comment string according to the language syntax
   */
  makeLineComment(text: string): string;
  /**
   * Prefixes given lines only if the test contains relevant code,
   * i.e. the text is not empty and is not just an empty string
   * within the target language
   * @param text the lines to prefix
   * @param prefix the prefix to prepent to each line
   */
  prefixNonemptyLines(text: string, prefix: string): string;
  /**
   * Quotes a given string value according to the target language's syntax.
   * @param value_input The string value to be quoted
   * @returns A properly quoted string
   */
  quote_(value_input: string): string;
  /**
   * Returns the order value for atomic expressions in the target language.
   * @returns The order value representing atomic expressions
   */
  getOrderAtomic(): number;
  /**
   * Returns the order value for collection expressions in the target language.
   * @returns The order value representing collection expressions
   */
  getOrderCollection(): number;
  /**
   * Returns the order value for none expressions in the target language.
   * @returns The order value representing none expressions
   */
  getOrderNone(): number;
}

export type FairDoCodeGenerator = RecordMappingGenerator &
  Blockly.CodeGenerator;

/**
 * The generator will import all the definitions
 * assigned to this object.
 */
export const forBlock = Object.create(null)

function genericRecord<T extends FairDoCodeGenerator>(
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

forBlock["pidrecord"] = function <T extends FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    return genericRecord(block, generator, "")
}

forBlock["pidrecord_skipable"] = function <T extends FairDoCodeGenerator>(
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

forBlock["attribute_key"] = function <T extends FairDoCodeGenerator>(
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

forBlock["input_json_pointer"] = function <T extends FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_input = block.getFieldValue("QUERY")
    const quoted = generator.quote_(value_input)
    return [generator.makeJsonPointerCall(quoted), generator.getOrderAtomic()]
}
forBlock["input_jsonpath"] = forBlock["input_json_pointer"] // TODO remove

forBlock["input_custom_json_path"] = function <
    T extends FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_block = generator.valueToCode(block, "QUERY", generator.getOrderAtomic())
    return [generator.makeJsonpathCall(value_block), generator.getOrderAtomic()]
}
forBlock["input_custom_json"] = forBlock["input_custom_json_path"] // TODO remove

forBlock["input_custom_json_pointer"] = function <
    T extends FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_block = generator.valueToCode(block, "QUERY", generator.getOrderAtomic())
    return [generator.makeJsonPointerCall(value_block), generator.getOrderAtomic()]
}

forBlock["profile_hmc"] = function <T extends FairDoCodeGenerator>(
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

forBlock["stop_design"] = function <T extends FairDoCodeGenerator>(
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

forBlock["log_value"] = function <T extends FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const text_desc = block.getFieldValue("DESC")
    const value_invar = generator.valueToCode(block, "INVAR", generator.getOrderAtomic())

    const code = `log(${value_invar}, "${text_desc}")\n`
    return [code, generator.getOrderNone()]
}

forBlock["otherwise"] = function <T extends FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T,
) {
    const value_value = generator.valueToCode(block, "VALUE", generator.getOrderAtomic())
    const value_other = generator.valueToCode(block, "OTHER", generator.getOrderAtomic())
    const code = `otherwise(lambda: ${value_value}, lambda: ${value_other})\n`
    return [code, generator.getOrderNone()]
}

forBlock["backlink_declaration"] = function <
    T extends FairDoCodeGenerator,
>(block: Blockly.Block, generator: T) {
    const value_attribute_key = generator.valueToCode(
        block,
        "ATTRIBUTE_KEY",
        generator.getOrderAtomic(),
    )
    const code = "BackwardLinkFor(" + value_attribute_key + ")"
    return [code, generator.getOrderAtomic()]
}

forBlock["profile_hmc_reference_block"] = function <T extends FairDoCodeGenerator>(
    block: Blockly.Block,
    generator: T
) {
    const dropdown_attribute = block.getFieldValue("ATTRIBUTE")
    const code = `"${dropdown_attribute}"`
    return [code, generator.getOrderAtomic()]
}

forBlock["lists_create_with"] = function <T extends FairDoCodeGenerator>(
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
