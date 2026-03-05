import {
    ChevronDown,
    DatabaseIcon,
    RectangleHorizontal,
    TableIcon,
} from "lucide-react"
import { PIDRecord } from "@/lib/types"
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
import { useCallback, useMemo, useState } from "react"
import { useCopyToClipboard } from "usehooks-ts"
import { PreviewTableView } from "@/components/preview/PreviewTableView"
import { ButtonGroup } from "@/components/ui/button-group"

// Please generate some example PID records for me
const exampleRecords: PIDRecord[] = [
    {
        pid: "12345",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "application/json",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://location.com",
            },
            {
                key: "21.T11148/aafd5fb4c7222e2d950a",
                value: "10.02.2026",
            },
        ],
    },
    {
        pid: "67",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "text/plain",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://example.org",
            },
        ],
    },
    {
        pid: "123451",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "application/json",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://location.com",
            },
        ],
    },
    {
        pid: "671",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "text/plain",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://example.org",
            },
        ],
    },
    {
        pid: "123452",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "application/json",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://location.com",
            },
        ],
    },
    {
        pid: "672",
        record: [
            {
                key: "21.T11148/1c699a5d1b4ad3ba4956",
                value: "text/plain",
            },
            {
                key: "21.T11148/b8457812905b83046284",
                value: "https://example.org",
            },
        ],
    },
]

export function PreviewPane() {
    const [viewType, setViewType] = useState<"records" | "table">("records")
    const unifier = useStore(dataSourcePickerStore, (s) => s.unifier)
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

    const exportPreviewToClipboard = useCallback(() => {
        const data = {
            records: exampleRecords,
        }
        copy(JSON.stringify(data)).then()
    }, [copy])

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
        const escapeField = (value: string): string => {
            // If field contains comma, double quote, or newline, wrap in quotes
            // and escape internal double quotes by doubling them
            if (
                value.includes(",") ||
                value.includes('"') ||
                value.includes("\n") ||
                value.includes("\r")
            ) {
                return `"${value.replace(/"/g, '""')}"`
            }
            return value
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
        const csv = recordsToCsv(exampleRecords)
        copy(csv).then()
    }, [copy, recordsToCsv])

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
            records: exampleRecords,
        }
        downloadFile(
            JSON.stringify(data),
            "application/json",
            "preview-export.json",
        )
    }, [downloadFile])

    const exportPreviewToCsvDownload = useCallback(() => {
        const csv = recordsToCsv(exampleRecords)
        downloadFile(csv, "text/csv;charset=utf-8;", "preview-export.csv")
    }, [downloadFile, recordsToCsv])

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

            {viewType === "records" ? (
                <div className="overflow-auto p-3">
                    <PreviewRecordsView records={exampleRecords} />
                </div>
            ) : (
                <div className="overflow-auto">
                    <PreviewTableView records={exampleRecords} />
                </div>
            )}
        </div>
    )
}
