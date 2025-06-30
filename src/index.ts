/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly"
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection"

import { blocks as profile_blocks } from "./blocks/all"
import { RecordMappingGenerator } from "./generators/python"
import { save, load } from "./serialization"
import { toolbox } from "./toolbox"
import "./index.css"

import { registerErrorsToolbox } from "./toolboxes/errors_logging"

import "json-picker-stencil"
import "./handlers"
import { ValidationField } from "./fields/ValidationField"

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(profile_blocks)
BlockDynamicConnection.overrideOldBlockDefinitions()

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById("blocklyDiv")
if (!blocklyDiv) {
    throw new Error(`div with id 'blocklyDiv' not found`)
}

const workspace = Blockly.inject(blocklyDiv, {
    rtl: false,
    toolbox,
    grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
    plugins: {
        connectionPreviewer: BlockDynamicConnection.decoratePreviewer(
            Blockly.InsertionMarkerPreviewer,
        ),
    },
})
workspace.addChangeListener(Blockly.Events.disableOrphans)
workspace.addChangeListener(BlockDynamicConnection.finalizeConnections)

const codeGenerator = new RecordMappingGenerator("PidRecordMappingPython")
const codeDiv = document.getElementById("generatedCode")?.firstChild
// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
    const code = codeGenerator.workspaceToCode(workspace as Blockly.Workspace)
    if (codeDiv) codeDiv.textContent = code

    //if (outputDiv) outputDiv.innerHTML = "";

    //eval(code);
}

if (workspace) {
    // Load the initial state from storage and run the code.
    load(workspace)
    runCode()

    // Every time the workspace changes state, save the changes to storage.
    workspace.addChangeListener((e: Blockly.Events.Abstract) => {
        // UI events are things like scrolling, zooming, etc.
        // No need to save after one of these.
        if (e.isUiEvent) return
        save(workspace)
    })

    // Whenever the workspace changes meaningfully, run the code again.
    workspace.addChangeListener((e: Blockly.Events.Abstract) => {
        // Don't run the code when the workspace finishes loading; we're
        // already running it once when the application starts.
        // Don't run the code during drags; we might have invalid state.
        if (
            e.isUiEvent ||
            e.type == Blockly.Events.FINISHED_LOADING ||
            workspace.isDragging()
        ) {
            return
        }
        runCode()
    })
}

registerErrorsToolbox(workspace)

// Initialize all validation fields
checkAllValidationFields()

function checkAllValidationFields() {
    workspace.getAllBlocks().forEach((block) => {
        if (block.type === "profile_hmc") {
            const fields = Array.from(block.getFields())
            for (const field of fields) {
                if (field instanceof ValidationField) {
                    field.forceCheck()
                }
            }
        }
    })
}

// Periodically check them as well
setInterval(() => {
    checkAllValidationFields()
}, 2000)
