"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import * as Blockly from "blockly"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "usehooks-ts"
import { CheckIcon, LoaderCircle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { alertStore } from "@/lib/stores/alert-store"
import { useCodeDownloader, useCodeGenerator } from "@/lib/hooks"

/**
 * Runs the code generator and shows the result
 * @constructor
 */
export function OutputPane() {
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const setCodeGenerator = useStore(workspaceStore, (s) => s.setCodeGenerator)
    const [code, setCode] = useState("")
    const [, copy] = useCopyToClipboard()
    const alert = useStore(alertStore, (s) => s.alert)

    const codeGeneratorInstance = useCodeGenerator()
    const codeDownloader = useCodeDownloader()

    const generateCode = useCallback(() => {
        if (!workspace) return
        const code = codeGeneratorInstance.workspaceToCode(workspace)
        setCode(code)
    }, [codeGeneratorInstance, workspace])

    const chooseGenerator = useCallback(
        (value: String) => {
            if (value === "python") {
                setCodeGenerator("python")
            } else if (value === "javascript") {
                setCodeGenerator("javascript")
            }
        },
        [setCodeGenerator],
    )

    useEffect(() => {
        if (!workspace) return
        // Whenever the workspace changes meaningfully, run the code again.
        generateCode()
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
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
        copy(code).then()
        setCopied(true)

        copiedTimeoutRef.current = window.setTimeout(() => {
            setCopied(false)
        }, 1000)
    }, [code, copy])

    const [preparingDownload, setPreparingDownload] = useState(false)
    const downloadCode = useCallback(async () => {
        try {
            setPreparingDownload(true)
            await codeDownloader.downloadCodeZip(code)
        } catch (e) {
            console.error("Failed to download code", e)
            alert("ErrorDisplay", "Failed to download code", "error")
        } finally {
            setPreparingDownload(false)
        }
    }, [alert, code, codeDownloader])

    return (
        <div className="flex flex-col grow max-w-full">
            <div className="p-2 bg-muted w-full flex flex-wrap gap-2 shrink-0 items-center">
                <Button variant="outline" onClick={copyCode}>
                    {copied ? (
                        <>
                            <CheckIcon /> Copied
                        </>
                    ) : (
                        "Copy Snippet"
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={downloadCode}
                    disabled={preparingDownload}
                >
                    {preparingDownload ? (
                        <>
                            <LoaderCircle className={"animate-spin"} />
                            Preparing...
                        </>
                    ) : (
                        "Download Generated Code"
                    )}
                </Button>
                <div className="flex items-center">
                    <label
                        htmlFor="language-select"
                        className="p-2 text-muted-foreground text-sm"
                    >
                        Language:
                    </label>

                    <Select
                        defaultValue="python"
                        onValueChange={chooseGenerator}
                    >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">
                                Javascript (Browser)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <pre className="overflow-auto grow p-2">
                <code>{code}</code>
            </pre>
        </div>
    )
}
