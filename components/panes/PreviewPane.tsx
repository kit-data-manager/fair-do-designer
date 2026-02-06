import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LoaderCircleIcon } from "lucide-react"
import { PIDRecord } from "@/lib/types"
import { PIDRecordDisplay } from "@/components/PIDRecordDisplay"

// Please generate some example PID records for me
const exampleRecords: PIDRecord[] = [
    {
        pid: "12345",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "application/json",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://location.com",
            },
        ],
    },
    {
        pid: "67",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "text/plain",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://example.org",
            },
        ],
    },
    {
        pid: "123451",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "application/json",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://location.com",
            },
        ],
    },
    {
        pid: "671",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "text/plain",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://example.org",
            },
        ],
    },
    {
        pid: "123452",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "application/json",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://location.com",
            },
        ],
    },
    {
        pid: "672",
        record: [
            {
                key: "21.DigitalObjectType",
                value: "text/plain",
            },
            {
                key: "21.DigitalObjectLocation",
                value: "https://example.org",
            },
        ],
    },
]

export function PreviewPane() {
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
                    <Select>
                        <SelectTrigger id={"preview-document-select"}>
                            <SelectValue placeholder={"Select a Document"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"doc0"}>
                                All Documents
                            </SelectItem>
                            <SelectSeparator />
                            <SelectItem value={"doc1"}>Document 1</SelectItem>
                            <SelectItem value={"doc2"}>Document 2</SelectItem>
                            <SelectItem value={"doc3"}>Document 3</SelectItem>
                        </SelectContent>
                    </Select>
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
