import { PIDRecord } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { camelToTitleCase } from "@/lib/utils"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import { useResolvedAttributePID } from "@/lib/hooks"
import { FileIcon } from "lucide-react"
import { AttributePIDHelp } from "@/components/preview/AttributePIDHelp"

export function PreviewRecordsView({ records }: { records: PIDRecord[] }) {
    return (
        <div className="grid grid-cols-1 gap-4">
            {records.map((record) => (
                <PreviewRecordView key={record.pid} record={record} />
            ))}
        </div>
    )
}

export function PreviewRecordView({ record }: { record: PIDRecord }) {
    return (
        <div className="rounded-md shadow-xs bg-profile text-profile-foreground">
            <div className="bg-record text-record-foreground p-2 rounded-t-md truncate flex justify-between text-sm">
                <div className="font-medium">PID: {record.pid}</div>
                <div className="flex gap-1 items-center">
                    <FileIcon className="size-3.5 shrink-0" /> example.json
                </div>
            </div>
            <div className="grid grid-cols-2">
                {record.record.map((entry) => (
                    <PIDRecordEntry
                        key={entry.key}
                        entryKey={entry.key}
                        value={entry.value}
                    />
                ))}
            </div>
        </div>
    )
}

export function PIDRecordEntry({
    entryKey,
    value,
}: {
    entryKey: string
    value: string
}) {
    const {
        data: keyPIDDataType,
        isLoading: keyPIDDataTypeIsLoading,
        error: keyPIDDataTypeError,
    } = useResolvedAttributePID(entryKey)

    return (
        <div className="contents">
            <div className="py-1 px-2 border-t border-r border-white/20 truncate font-medium text-sm text-right h-full w-full">
                {keyPIDDataTypeIsLoading ? (
                    <div className="flex justify-end items-center h-full">
                        <Skeleton className="bg-profile-foreground/50 h-2 w-24" />
                    </div>
                ) : keyPIDDataType ? (
                    <div className="flex gap-1 items-center justify-end">
                        {camelToTitleCase(keyPIDDataType.name)}
                        <AttributePIDHelp data={keyPIDDataType} />
                    </div>
                ) : (
                    <div>{entryKey}</div>
                )}
                <ErrorDisplay
                    error={keyPIDDataTypeError}
                    size={"sm"}
                    className="mt-1 bg-destructive/40"
                />
            </div>
            <div className="border-t border-white/20 py-1 px-2 truncate h-full w-full text-sm">
                <div>{value}</div>
            </div>
        </div>
    )
}
