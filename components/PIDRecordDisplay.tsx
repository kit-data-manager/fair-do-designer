import { PIDRecord } from "@/lib/types"
import { useCallback } from "react"
import { PID, PIDDataType } from "@kit-data-manager/pid-component"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { camelToTitleCase } from "@/lib/utils"
import { ErrorDisplay } from "@/components/ErrorDisplay"

export function PIDRecordDisplay({ record }: { record: PIDRecord }) {
    return (
        <div className="rounded-md shadow-xs bg-profile text-profile-foreground">
            <div className="bg-record text-record-foreground border-b border-white/20 p-2 rounded-t-md truncate">
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
    const resolveKeyPID = useCallback(async (key: string) => {
        if (PID.isPID(key)) {
            const pid = PID.getPIDFromString(key)
            return await PIDDataType.resolveDataType(pid)
        } else throw new Error("Invalid PID")
    }, [])

    const {
        data: keyPIDDataType,
        isLoading: keyPIDDataTypeIsLoading,
        error: keyPIDDataTypeError,
    } = useSWR(entryKey, resolveKeyPID)

    return (
        <div className="contents">
            <div className="p-2 border-b border-r border-white/20 truncate font-medium text-sm text-right h-full w-full">
                {keyPIDDataTypeIsLoading ? (
                    <Skeleton className="h-6 w-56" />
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
            <div className="border-b border-white/20 p-2 truncate h-full w-full text-sm">
                <div>{value}</div>
            </div>
        </div>
    )
}
