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
 * Target runtime is the acorn interpreter (sandboxed) within the browser.
 *
 * The acorn interpreter does not implement newer JS features (ES6+).
 * Translating to ES5 can be done quickly with babel or here:
 * https://neil.fraser.name/software/JS-Interpreter/demos/babel.html
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

    makeAddAttributeChainCall(key: string, value: string): string {
        if (value.startsWith("BackwardLinkFor(")) {
            return `.addAttribute(${key}, ${value})\n`
        } else {
            return `.addAttribute(${key}, lambda: ${value})\n`
        }
    }

    makeSetIDChainCall(id: string): string {
        if (!isEmptyPythonString(id)) {
            return `.setId(lambda: ${id})\n`
        } else {
            return ""
        }
    }

    makeLineComment(text: string): string {
        return this.prefixLines(`${text}\n`, "# ")
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