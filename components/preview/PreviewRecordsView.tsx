import { PIDRecord } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { camelToTitleCase } from "@/lib/utils"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import { useResolvedAttributePID } from "@/lib/hooks"

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
            <div className="bg-record text-record-foreground p-2 rounded-t-md truncate">
                <div>PID: {record.pid}</div>
                <div className="text-xs">Input Document: doc.example</div>
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
            <div className="p-2 border-t border-r border-white/20 truncate font-medium text-sm text-right h-full w-full">
                {keyPIDDataTypeIsLoading ? (
                    <div className="flex justify-end items-center h-full">
                        <Skeleton className="bg-profile-foreground/50 h-2 w-24" />
                    </div>
                ) : keyPIDDataType ? (
                    <div>{camelToTitleCase(keyPIDDataType.name)}</div>
                ) : (
                    <div>{entryKey}</div>
                )}
                <ErrorDisplay
                    error={keyPIDDataTypeError}
                    size={"sm"}
                    className="mt-1 bg-destructive/40"
                />
            </div>
            <div className="border-t border-white/20 p-2 truncate h-full w-full text-sm">
                <div>{value}</div>
            </div>
        </div>
    )
}
