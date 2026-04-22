import { PIDRecord } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import { useResolvedAttributePID } from "@/lib/hooks"
import { AttributePIDHelp } from "@/components/preview/AttributePIDHelp"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function PreviewRecordsView({ records }: { records: PIDRecord[] }) {
    return (
        <div className="grid grid-cols-1 gap-3">
            {records.map((record) => (
                <PreviewRecordView key={record.pid} record={record} />
            ))}
        </div>
    )
}

export function PreviewRecordView({ record }: { record: PIDRecord }) {
    return (
        <div className="rounded-md shadow-xs text-profile-foreground">
            <div className="bg-record/80 dark:bg-record/40 border-record border border-b-0 text-record-foreground p-2 rounded-t-md truncate flex justify-between text-sm">
                <div className="font-medium truncate">PID: {record.pid}</div>
            </div>
            <div className="grid grid-cols-2 dark:bg-profile/40 bg-profile/80 border-profile border rounded-b-md border-t-0">
                {record.record.map((entry, i) => (
                    <PIDRecordEntry
                        key={`${record.pid}:${entry.key}#globalIndex:${i}`}
                        entryKey={entry.key}
                        value={entry.value + ""}
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
                    <div className="flex gap-1 items-center justify-end truncate">
                        <AttributePIDHelp
                            data={keyPIDDataType}
                            className="truncate"
                        />
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
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <span className="truncate">{value}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-100">
                        {value}
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}
