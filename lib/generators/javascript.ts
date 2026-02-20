/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    Order,
    JavascriptGenerator,
    javascriptGenerator,
} from "blockly/javascript"
import * as Blockly from "blockly/core"
import * as Common from "./common"

/**
 * Specialized generator for generating JS code to generate records.
 * Target runtime: Sandboxed interpreter (quickjs) in Browser.
 *
 * This generator is intended to generate code that will output records within the
 * FAIR DO Designer, either for preview or for direct use. This means it
 * (or the generated code) might contain special handling, like specialized
 * logging for communication with the designer.
 */
export class JavascriptMappingGenerator
    extends JavascriptGenerator
    implements Common.RecordMappingGenerator
{
    generate_trace_calls: boolean = true
    boilerplate: Dict<string> = {}

    constructor(name: string, flags?: Dict<boolean>) {
        super(name)
        Object.assign(this.forBlock, javascriptGenerator.forBlock)
        Object.assign(this.forBlock, Common.forBlock)
        if (flags) {
            this.configure(flags)
        }
    }

    configure(options: Dict<any>): void {
        this.generate_trace_calls = options.generate_trace_calls === true
        this.boilerplate = options.boilerplate
    }

    /**
     * Hook for code to run before code generation starts.
     * Subclasses may override this, e.g. to initialise the database of variable
     * names.
     *
     * @param _workspace Workspace to generate code from.
     */
    init(workspace: Blockly.Workspace) {
        super.init(workspace)
        /* TODO
        this.definitions_["import-jsonpath"] = "import jsonpath"
        this.addReservedWords("math,random,Number")
        */
        for (const [key, value] of Object.entries(this.boilerplate)) {
            if (!value) {
                continue
            }
            this.definitions_[`boilerplate-${key}`] = value
        }
        this.addReservedWords("current_source_json")
        this.addReservedWords("EXECUTOR")

        if (this.generate_trace_calls) {
            Object.keys(this.forBlock).forEach((key) => {
                if (without_trace.includes(key)) {
                    return
                }
                let oldFunc = this.forBlock[key]
                this.forBlock[key] = function (
                    block: Blockly.Block,
                    generator /*: this*/,
                ) {
                    let result = oldFunc.call(this, block, generator)
                    if (result == null) {
                        return `trace_block("${block.id}", () => null)`
                    } else if (typeof result === "string") {
                        return `trace_block("${block.id}", () => ${result})`
                    } else {
                        result[0] = `trace_block("${block.id}", () => ${result[0]})`
                        return result
                    }
                }
            })
        }
    }

    getOrderAtomic(): number {
        return Order.ATOMIC
    }
    getOrderCollection(): number {
        return Order.MEMBER
    }
    getOrderNone(): number {
        return Order.NONE
    }

    makeJsonPointerCall(jsonPointer: string): string {
        return `jsonpointer.get(executor.current_source_json, ${jsonPointer})`
    }

    makeJsonpathCall(jsonpath: string): string {
        return `jsonpath.get(executor.current_source_json, ${jsonpath})`
    }

    makeLambda(body: string): string {
        return `() => ${body}`
    }

    makeNewInstanceCall(className: string, args: string[]): string {
        return `new ${className}(${args.join(", ")})`
    }

    makeAddAttributeChainCall(key: string, value: string): string {
        if (value.startsWith("BackwardLinkFor(")) {
            return `.addAttribute(${key}, ${value})\n`
        } else {
            return `.addAttribute(${key}, ${this.makeLambda(value)})\n`
        }
    }

    makeSetIDChainCall(id: string): string {
        if (!isEmptyJavascriptString(id)) {
            return `.setId(${this.makeLambda(id)})\n`
        } else {
            return ""
        }
    }

    makeLineComment(text: string): string {
        return this.prefixLines(`${text}\n`, "// ")
    }

    prefixNonemptyLines(text: string, prefix: string): string {
        if (isEmptyJavascriptString(text)) {
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

function isEmptyJavascriptString(s: string): boolean {
    return (
        s == null ||
        false ||
        s.length <= 0 ||
        s == "``" ||
        s == '""' ||
        s == "''"
    )
}

const without_trace = [
    // use `console.log("Key in forBlock: ", Object.keys(this.forBlock))` in the constructor
    // to get an up-to-date list of all available block types.
    // --------------------------------------------------------------------------------------
    "pidrecord",
    "pidrecord_skipable",
    "attribute_key",
    //"input_json_pointer",
    //"input_jsonpath",
    //"input_custom_json_path",
    //"input_custom_json",
    //"input_custom_json_pointer",
    "profile_hmc",
    //"stop_design",
    //"log_value",
    //"otherwise",
    //"backlink_declaration",
    "profile_hmc_reference_block",
]
