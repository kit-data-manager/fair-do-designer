"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RecordMappingGenerator } from "@/lib/generators/python"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import * as Blockly from "blockly"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "usehooks-ts"
import { CheckIcon } from "lucide-react"

/**
 * Runs the code generator and shows the result
 * @constructor
 */
export function OutputPane() {
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const [, copy] = useCopyToClipboard()

    const codeBlock = useRef<HTMLElement>(null)
    const codeGenerator = useRef(
        new RecordMappingGenerator("PidRecordMappingPython"),
    )

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

    const [copied, setCopied] = useState(false)
    const copiedTimeoutRef = useRef<number>(null)
    const copyCode = useCallback(() => {
        if (codeBlock.current) {
            if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
            copy(codeBlock.current.innerText).then()
            setCopied(true)

            copiedTimeoutRef.current = window.setTimeout(() => {
                setCopied(false)
            }, 1000)
        }
    }, [copy])

    return (
        <div className="flex flex-col grow max-w-full">
            <div className="p-2 bg-muted w-full flex flex-wrap gap-2 shrink-0 items-center">
                <Button variant="outline" onClick={copyCode}>
                    {copied ? (
                        <>
                            <CheckIcon /> Copied
                        </>
                    ) : (
                        "Copy Code"
                    )}
                </Button>
                <div className="p-1 text-muted-foreground">
                    Language: Python
                </div>
            </div>
            <pre className="overflow-auto p-2">
                <code ref={codeBlock}></code>
            </pre>
        </div>
    )
}
