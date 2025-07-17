"use client"

import { useEffect, useRef } from "react"
import * as Blockly from "blockly"
import { toolbox } from "@/lib/toolbox"
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { blocks as profile_blocks } from "@/lib/blocks/all"
import { RecordMappingGenerator } from "@/lib/generators/python"
import { load, save } from "@/lib/serialization"
import * as ErrorsToolbox from "@/lib/toolboxes/errors_logging"
import * as BacklinksToolbox from "@/lib/toolboxes/backlinks"
import { ValidationField } from "@/lib/fields/ValidationField"

export function Workspace() {
    const divRef = useRef<HTMLDivElement>(null)
    const setWorkspace = useStore(workspaceStore, (s) => s.setWorkspace)
    const unsetWorkspace = useStore(workspaceStore, (s) => s.unsetWorkspace)

    useEffect(() => {
        if (!divRef.current) {
            console.error("Failed to mount workspace: divRef empty")
            return
        }

        Blockly.common.defineBlocks(profile_blocks)
        BlockDynamicConnection.overrideOldBlockDefinitions()

        const workspace = Blockly.inject(divRef.current, {
            rtl: false,
            toolbox,
            grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
            plugins: {
                connectionPreviewer: BlockDynamicConnection.decoratePreviewer(
                    Blockly.InsertionMarkerPreviewer,
                ),
            },
        })

        setWorkspace(workspace)

        workspace.addChangeListener(Blockly.Events.disableOrphans)
        workspace.addChangeListener(BlockDynamicConnection.finalizeConnections)

        const codeGenerator = new RecordMappingGenerator(
            "PidRecordMappingPython",
        )
        const codeDiv = document.getElementById("generatedCode")?.firstChild
        // This function resets the code and output divs, shows the
        // generated code from the workspace, and evals the code.
        // In a real application, you probably shouldn't use `eval`.
        const runCode = () => {
            const code = codeGenerator.workspaceToCode(
                workspace as Blockly.Workspace,
            )
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

        ErrorsToolbox.register(workspace)
        BacklinksToolbox.register(workspace)

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
        const interval = setInterval(() => {
            checkAllValidationFields()
        }, 2000)

        // Return cleanup function for clean unmounting
        return () => {
            console.warn("Unloading workspace")
            workspace.dispose()
            unsetWorkspace()
            clearInterval(interval)
        }
    }, [setWorkspace, unsetWorkspace])

    return <div className={"h-screen w-screen"} ref={divRef}></div>
}
