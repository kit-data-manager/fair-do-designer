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
    init(workspace: Blockly.Workspace) {
        super.init(workspace)
        Object.assign(this.forBlock, javascriptGenerator.forBlock)
        Object.assign(this.forBlock, Common.forBlock)
        /* TODO
        this.definitions_["import-main"] = "import js_executor"
        this.definitions_["import-from-main"] =
        "from executor import RecordDesign, Executor, log"
        this.definitions_["import-from-conditionals"] =
        "from conditionals import *"
        this.definitions_["import-jsonpath"] = "import jsonpath"
        this.definitions_["executor"] = "EXECUTOR: Executor = Executor()"
        this.addReservedWords("math,random,Number")
        this.addReservedWords("EXECUTOR")
        this.addReservedWords("current_source_json")
        */
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
        return `jsonpointer.get(executor.current_source_json, ${jsonPointer});`
    }

    makeJsonpathCall(jsonpath: string): string {
        return `jsonpath.get(executor.current_source_json, ${jsonpath});`
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
        if (!isEmptyPythonString(id)) {
            return `.setId(${this.makeLambda(id)})\n`
        } else {
            return ""
        }
    }

    makeLineComment(text: string): string {
        return this.prefixLines(`${text}\n`, "// ")
    }

    prefixNonemptyLines(text: string, prefix: string): string {
        if (isEmptyPythonString(text)) {
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

function isEmptyPythonString(s: string): boolean {
    return s == null || false || s.length <= 0 || s == "''" || s == '""'
}