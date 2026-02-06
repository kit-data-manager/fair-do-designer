import { PIDRecord } from "@/lib/types"

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
    return (
        <div>
            <div>{entryKey}</div>
            <div>{value}</div>
        </div>
    )
}
