"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
} from "./ui/select"
import { alertStore } from "@/lib/stores/alert-store"
import { useCodeDownloader, useCodeGenerator } from "@/lib/hooks"
import { FunctionWorker } from "@/lib/function-worker"
import { jsSandboxFunctions } from "@/lib/workers/js-sandbox/functions"
import { JavascriptMappingGenerator } from "@/lib/generators/javascript"

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
    const [jsStandaloneCodeGenerator, setJsStandaloneCodeGenerator] = useState(new JavascriptMappingGenerator("tmp"));

    useEffect(() => {
        const generator = async () => {
            const basepath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
            const prefix = `${window.location.origin}/${basepath}`
            const executor_boilerplate = await fetch(`${prefix}/js/executor.js`).then((res) => res.text())
            const error_boilerplate = await fetch(`${prefix}/js/error_handling.js`).then((res) => res.text())
            const flags: Dict<any> = {
                generate_trace_calls: true,
                boilerplate: {
                    "executor": executor_boilerplate,
                    "error-handling": error_boilerplate,
                }
            }
            return new JavascriptMappingGenerator("PidRecordMappingJavascriptStandalone", flags)
        }
        generator().then(g => setJsStandaloneCodeGenerator(g))
    }, [])

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
            alert("Error", "Failed to download code", "error")
        } finally {
            setPreparingDownload(false)
        }
    }, [alert, code, codeDownloader])

    const [sandbox] = useState(
        new FunctionWorker(jsSandboxFunctions, { localFallback: false }),
    )

    if (!sandbox.workerMounted)
        sandbox.mount(
            (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/workers/js-sandbox.js",
        )

    const runLongCode = useCallback(async () => {
        console.time("runLongCode")
        const fullCode = jsStandaloneCodeGenerator.workspaceToCode(workspace)
        sandbox.execute("executeCode", fullCode).then((result => {
            console.timeEnd("runLongCode")
            console.log(result)
        }))
    }, [sandbox, code, workspace, jsStandaloneCodeGenerator])

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
                <Button variant="outline" onClick={runLongCode}>
                    Run code
                </Button>
            </div>
            <pre className="overflow-auto grow p-2">
                <code>{code}</code>
            </pre>
        </div>
    )
}
