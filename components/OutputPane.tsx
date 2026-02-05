"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PythonMappingGenerator as PythonGen } from "@/lib/generators/python"
import { JavascriptMappingGenerator as JsGen } from "@/lib/generators/javascript"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import * as Blockly from "blockly"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "usehooks-ts"
import { CheckIcon, LoaderCircle } from "lucide-react"
import { PythonCodeDownload } from "@/lib/python_code_download"
import { FairDoCodeGenerator, RecordMappingGenerator } from "@/lib/generators/common"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

/**
 * Runs the code generator and shows the result
 * @constructor
 */
export function OutputPane() {
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const [code, setCode] = useState("")
    const [, copy] = useCopyToClipboard()

    let codeGenerator = useRef<FairDoCodeGenerator>(
        new PythonGen("PidRecordMappingPython"),
    )
    const chooseGenerator = useCallback((value: String) => {
        if (value === "python") {
            codeGenerator.current = new PythonGen("PidRecordMappingPython")
        } else if (value === "javascript") {
            codeGenerator.current = new JsGen("PidRecordMappingJavascript")
        }
        generateCode()
    }, [code])
    const codeDownloader = useRef(new PythonCodeDownload())

    const generateCode = useCallback(() => {
        if (!workspace) return
        const code = codeGenerator.current.workspaceToCode(workspace)
        setCode(code)
    }, [workspace])

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
            await codeDownloader.current.downloadCodeZip(code)
        } catch (e) {
            console.error("Failed to download code", e)
            alert("Failed to download code")
        } finally {
            setPreparingDownload(false)
        }
    }, [code])

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
                        className="p-2 text-muted-foreground"
                    >Language:</label>

                    <Select
                        defaultValue="python"
                        onValueChange={chooseGenerator}
                    >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">Javascript (Browser)</SelectItem>
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
