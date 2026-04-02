import {
    ChevronDown,
    DatabaseIcon,
    RectangleHorizontal,
    TableIcon,
} from "lucide-react"
import { PIDRecord, pidRecordSchema } from "@/lib/types"
import { PreviewRecordsView } from "@/components/preview/PreviewRecordsView"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useStore } from "zustand/react"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useCopyToClipboard, useDebounceCallback } from "usehooks-ts"
import { PreviewTableView } from "@/components/preview/PreviewTableView"
import { ButtonGroup } from "@/components/ui/button-group"
import { JavascriptMappingGenerator } from "@/lib/generators/javascript"
import * as Blockly from "blockly"
import { FunctionWorker } from "@/lib/function-worker"
import { jsSandboxFunctions } from "@/lib/workers/js-sandbox/functions"
import { workspaceStore } from "@/lib/stores/workspace"
import { z } from "zod/mini"
import { ErrorDisplay } from "@/components/ErrorDisplay"

export function PreviewPane() {
    const [viewType, setViewType] = useState<"records" | "table">("records")
    const unifier = useStore(dataSourcePickerStore, (s) => s.unifier)
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const totalDocumentCount = useStore(
        dataSourcePickerStore,
        (s) => s.totalDocumentCount,
    )
    const documents = useMemo(() => {
        return unifier
            .getDocuments()
            .slice(0, totalDocumentCount)
            .map((d) => d.name)
    }, [unifier, totalDocumentCount])
    const [previewRecords, setPreviewRecords] = useState<PIDRecord[]>([])
    const [previewError, setPreviewError] = useState<unknown>(undefined)

    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

    const toggleSelectDocument = useCallback(
        (doc: string) => {
            setSelectedDocuments((prev) => {
                if (!prev.includes(doc))
                    return [...prev.filter((d) => documents.includes(d)), doc]
                else return [...prev.filter((d) => d !== doc)]
            })
        },
        [documents],
    )

    const toggleSelectAllDocuments = useCallback(() => {
        setSelectedDocuments((prev) => {
            if (prev.length === documents.length) return []
            else return [...documents]
        })
    }, [documents])

    const [, copy] = useCopyToClipboard()

    const [jsStandaloneCodeGenerator, setJsStandaloneCodeGenerator] =
        useState<JavascriptMappingGenerator>()

    useEffect(() => {
        const generator = async () => {
            const basepath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
            const prefix = `${window.location.origin}/${basepath}`
            const executor_boilerplate = await fetch(
                `${prefix}/js/executor.js`,
            ).then((res) => res.text())
            const flags: Dict<any> = {
                generate_trace_calls: false,
                boilerplate: {
                    executor: executor_boilerplate,
                },
            }
            return new JavascriptMappingGenerator(
                "PidRecordMappingJavascriptStandalone",
                flags,
            )
        }
        generator().then((g) => setJsStandaloneCodeGenerator(g))
    }, [])

    const [sandbox] = useState(
        new FunctionWorker(jsSandboxFunctions, { localFallback: false }),
    )

    if (!sandbox.workerMounted)
        sandbox.mount(
            (process.env.NEXT_PUBLIC_BASE_PATH ?? "") +
                "/workers/js-sandbox.js",
        )

    const calculateRecords = useCallback(async (): Promise<PIDRecord[]> => {
        if (!jsStandaloneCodeGenerator) return []
        console.time("JS sandbox execution")
        const docs = unifier.getDocuments()
        const input_code: string = `const INPUT = [\n${docs.map((v) => `${JSON.stringify(v.doc)}`).join(",\n")}\n];\n`
        let withNewData = structuredClone(jsStandaloneCodeGenerator.options)
        if (!withNewData.boilerplate) {
            withNewData.boilerplate = {}
        }
        withNewData.boilerplate.input = input_code
        jsStandaloneCodeGenerator.configure(withNewData)
        const fullCode = jsStandaloneCodeGenerator.workspaceToCode(workspace)
        const result = await sandbox.execute("executeCode", fullCode)
        console.timeEnd("JS sandbox execution")
        console.log("Sandbox result:", result)

        if (result.value) {
            const parsedValue = z.array(pidRecordSchema).safeParse(result.value)
            if (parsedValue.success) {
                return parsedValue.data
            } else throw parsedValue.error
        } else
            throw (
                result.error ??
                new Error("Received empty response form record generator")
            )
    }, [unifier, jsStandaloneCodeGenerator, workspace, sandbox])

    // Monotonic counter to prevent slow updates from overriding faster updates
    const updateRecordsCounter = useRef(0)
    const updateRecords = useCallback(async () => {
        console.log("Updating records now...")
        const counter = ++updateRecordsCounter.current
        try {
            const records = await calculateRecords()
            if (counter === updateRecordsCounter.current) {
                setPreviewError(undefined)
                setPreviewRecords(records)
            }
        } catch (e) {
            if (counter == updateRecordsCounter.current) {
                setPreviewError(e)
            }
        }
    }, [calculateRecords])

    const debouncedUpdateRecords = useDebounceCallback(updateRecords, 500)

    useEffect(() => {
        if (!workspace) return

        function changeListener(e: Blockly.Events.Abstract) {
            if (!workspace) return

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
            debouncedUpdateRecords()
        }
        // Whenever the workspace changes meaningfully, run the code again.
        workspace.addChangeListener(changeListener)

        return () => workspace.removeChangeListener(changeListener)
    }, [debouncedUpdateRecords, workspace])

    const exportPreviewToClipboard = useCallback(() => {
        const data = {
            records: previewRecords,
        }
        copy(JSON.stringify(data)).then()
    }, [copy, previewRecords])

    const recordsToCsv = useCallback((records: PIDRecord[]): string => {
        // Collect all unique attribute keys
        const attributes = new Set<string>()
        for (const record of records) {
            for (const entry of record.record) {
                attributes.add(entry.key)
            }
        }
        const attributeList = Array.from(attributes)

        // Helper to escape a CSV field (RFC 4180 compliant)
        const escapeField = (value: unknown): string => {
            // If field contains comma, double quote, or newline, wrap in quotes
            // and escape internal double quotes by doubling them
            if (
                typeof value === "string" &&
                (value.includes(",") ||
                    value.includes('"') ||
                    value.includes("\n") ||
                    value.includes("\r"))
            ) {
                return `"${value.replace(/"/g, '""')}"`
            }
            return value + ""
        }

        // Build header row: PID + all attribute keys
        const headerRow = ["PID", ...attributeList].map(escapeField).join(",")

        // Build data rows
        const dataRows = records.map((record) => {
            const row = [
                record.pid,
                ...attributeList.map((attr) => {
                    const entry = record.record.find((e) => e.key === attr)
                    return entry?.value ?? ""
                }),
            ]
            return row.map(escapeField).join(",")
        })

        return [headerRow, ...dataRows].join("\n")
    }, [])

    const exportPreviewToCsvClipboard = useCallback(() => {
        const csv = recordsToCsv(previewRecords)
        copy(csv).then()
    }, [copy, previewRecords, recordsToCsv])

    const downloadFile = useCallback(
        (content: string, mimeType: string, fileName: string) => {
            const blob = new Blob([content], {
                type: mimeType,
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            a.click()
            URL.revokeObjectURL(url)
        },
        [],
    )

    const exportPreviewToDownload = useCallback(() => {
        const data = {
            records: previewRecords,
        }
        downloadFile(
            JSON.stringify(data),
            "application/json",
            "preview-export.json",
        )
    }, [downloadFile, previewRecords])

    const exportPreviewToCsvDownload = useCallback(() => {
        const csv = recordsToCsv(previewRecords)
        downloadFile(csv, "text/csv;charset=utf-8;", "preview-export.csv")
    }, [downloadFile, previewRecords, recordsToCsv])

    return (
        <div className="min-h-0 w-full justify-stretch flex flex-col">
            <div className="p-2 bg-muted w-full flex flex-wrap gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <DatabaseIcon /> Select Input (
                            {selectedDocuments.length}/{documents.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                            onClick={toggleSelectAllDocuments}
                            checked={
                                selectedDocuments.length === documents.length
                            }
                            onSelect={(e) => e.preventDefault()}
                        >
                            All Documents
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        {documents.map((d) => (
                            <DropdownMenuCheckboxItem
                                key={d}
                                checked={selectedDocuments.includes(d)}
                                onClick={() => toggleSelectDocument(d)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {d}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Export Preview{" "}
                            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={exportPreviewToClipboard}>
                            Copy to Clipboard (.json)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportPreviewToDownload}>
                            Download (.json)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={exportPreviewToCsvClipboard}>
                            Copy to Clipboard (.csv)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportPreviewToCsvDownload}>
                            Download (.csv)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="grow" />

                <ButtonGroup>
                    <Button
                        className={"border"}
                        variant={viewType === "records" ? "default" : "outline"}
                        onClick={() => setViewType("records")}
                    >
                        <RectangleHorizontal />
                    </Button>
                    <Button
                        className="border"
                        variant={viewType === "table" ? "default" : "outline"}
                        onClick={() => setViewType("table")}
                    >
                        <TableIcon />
                    </Button>
                </ButtonGroup>
            </div>

            <ErrorDisplay
                error={previewError}
                title={"Failed to generate preview"}
            />

            {viewType === "records" ? (
                <div className="overflow-auto p-3">
                    <PreviewRecordsView records={previewRecords} />
                </div>
            ) : (
                <div className="overflow-auto">
                    <PreviewTableView records={previewRecords} />
                </div>
            )}
        </div>
    )
}
