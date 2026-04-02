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

type Options = {
    generate_trace_calls?: boolean
    boilerplate?: Dict<string>
}

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
    options: Options = {}
    // inner state indicating whether trace calls are already applied
    hasTraceCalls: boolean = false

    constructor(name: string, flags?: Dict<boolean>) {
        super(name)
        Object.assign(this.forBlock, javascriptGenerator.forBlock)
        Object.assign(this.forBlock, Common.forBlock)
        if (flags) {
            this.configure(flags)
        }
    }

    configure(options: Dict<any>): void {
        this.options = options
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
        if (!this.options.boilerplate) {
            this.options.boilerplate = {}
        }
        if (this.options.generate_trace_calls == null) {
            this.options.generate_trace_calls = false // default value
        }
        for (const [key, value] of Object.entries(this.options.boilerplate)) {
            if (!value) {
                continue
            }
            this.definitions_[`boilerplate-${key}`] = value
        }
        this.addReservedWords("current_source_json")
        this.addReservedWords("EXECUTOR")

        this.definitions_["executor"] = "const EXECUTOR = new Executor(INPUT)"
        this.definitions_["import-jsonpointer"] =
            "import { JsonPointer } from 'jsonpointer.js';"
        this.definitions_["import-jsonpath"] =
            "import { JSONPath } from 'jsonpath.js';"

        if (this.options.generate_trace_calls && !this.hasTraceCalls) {
            Object.keys(this.forBlock).forEach((key) => {
                let ignore_tracing =
                    without_trace.has(key) ||
                    prefixes_without_trace.some((prefix) =>
                        key.startsWith(prefix),
                    )
                if (ignore_tracing) {
                    return
                }
                let oldFunc = this.forBlock[key]
                this.forBlock[key] = function (
                    block: Blockly.Block,
                    generator /*: this*/,
                ) {
                    let result = oldFunc.call(this, block, generator)
                    let name = block.type
                    if (result == null) {
                        return `trace("${block.id}", () => null)`
                    } else if (typeof result === "string") {
                        return `trace("${block.id}", () => ${result})`
                    } else {
                        result[0] = `trace("${block.id}", () => ${result[0]})`
                        return result
                    }
                }
            })
            this.hasTraceCalls = true
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
        return `JsonPointer.get(current_source_json, ${jsonPointer})`
    }

    makeJsonpathCall(jsonpath: string): string {
        return `JSONPath({ path: ${jsonpath}, json: current_source_json})`
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
            return `.setId(${this.makeLambda(String(id))})\n`
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
        const suffix: string = [
            "\n",
            "const result = EXECUTOR.execute()",
            "globalThis.result = result",
        ].join("\n")
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

const without_trace = new Set([
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
    "procedures_defreturn",
    "logic_boolean",
    "math_number",
])

const prefixes_without_trace = [
    "controls_",
    "procedures_",
    "profile_",
    "lists_set",
]
