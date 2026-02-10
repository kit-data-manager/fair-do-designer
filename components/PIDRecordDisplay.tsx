import { PIDRecord } from "@/lib/types"
import { useCallback } from "react"
import { PID } from "@kit-data-manager/pid-component"
import useSWR from "swr"

export function PIDRecordDisplay({ record }: { record: PIDRecord }) {
    return (
        <div className="rounded-md border shadow-xs">
            <div className="bg-blue-500/30 p-2 rounded-t-md">
                PID: {record.pid}
            </div>
            <div className="p-2">
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
            return await pid.resolve()
        }
    }, [])

    const {
        data: keyPIDRecord,
        isLoading: keyPIDRecordIsLoading,
        error: keyPIDRecordError,
    } = useSWR(entryKey, resolveKeyPID)

    console.log(keyPIDRecord)

    return (
        <div>
            <div>{entryKey}</div>
            <div>{value}</div>
        </div>
    )
}
