import { DatabaseIcon, LoaderCircleIcon } from "lucide-react"
import { PIDRecord } from "@/lib/types"
import { PIDRecordDisplay } from "@/components/PIDRecordDisplay"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useStore } from "zustand/react"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"
import { useCallback, useMemo, useState } from "react"

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

    return (
        <div className="min-h-0 w-full justify-stretch flex flex-col">
            <div className="p-2 bg-muted w-full flex flex-wrap gap-2">
                <div className="flex items-center">
                    <label
                        htmlFor="preview-document-select"
                        className="p-2 text-muted-foreground text-sm"
                    >
                        Input:
                    </label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <DatabaseIcon /> Choose Documents (
                                {selectedDocuments.length}/{documents.length})
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuCheckboxItem
                                onClick={toggleSelectAllDocuments}
                                checked={
                                    selectedDocuments.length ===
                                    documents.length
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
                </div>
                <div className="flex items-center justify-center gap-2">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                </div>
            </div>

            <div className="flex flex-col p-2 gap-2 overflow-auto">
                {exampleRecords.map((record) => (
                    <PIDRecordDisplay record={record} key={record.pid} />
                ))}
            </div>
        </div>
    )
}
