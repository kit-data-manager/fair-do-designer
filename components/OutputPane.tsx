"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RecordMappingGenerator } from "@/lib/generators/python"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import * as Blockly from "blockly"

/**
 * Runs the code generator and shows the result
 * @constructor
 */
export function OutputPane() {
    const [open, setOpen] = useState(false)
    const workspace = useStore(workspaceStore, (s) => s.workspace)

    const codeBlock = useRef<HTMLElement>(null)
    const codeGenerator = useRef(
        new RecordMappingGenerator("PidRecordMappingPython"),
    )

    const toggleOpen = useCallback(() => {
        setOpen((o) => !o)
    }, [])

    const generateCode = useCallback(() => {
        if (!workspace) return
        const code = codeGenerator.current.workspaceToCode(workspace)
        if (codeBlock.current) codeBlock.current.innerText = code
    }, [workspace])

    useEffect(() => {
        if (!workspace) return
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
            generateCode()
        })
    }, [generateCode, workspace])

    return (
        <>
            <div id="outputPane" className={`${open ? "flex" : "hidden"}`}>
                <pre id="generatedCode">
                    <code ref={codeBlock}></code>
                </pre>
            </div>
            <button
                id="collapseOutputPaneBtn"
                onClick={toggleOpen}
                title={`${open ? "Hide" : "Show"} output pane`}
            >
                {open ? "Hide" : "Show"} output pane
            </button>
        </>
    )
}
