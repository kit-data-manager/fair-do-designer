/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator, pythonGenerator } from "blockly/python"
import * as Blockly from "blockly/core"
import * as Common from "./common"

/**
 * Specialized generator for our code.
 * In order to make the basic blocks reusable and generate proper code,
 * we should not override the existing methods but write new ones
 * (possibly reusing the existing functionality).
 */
export class RecordMappingGenerator
    extends PythonGenerator
    implements Common.RecordMappingGenerator
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
        Object.assign(this.forBlock, Common.forBlock)
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
