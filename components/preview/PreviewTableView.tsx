import { PIDRecord } from "@/lib/types"
import { useState } from "react"
import { useResolvedAttributePID } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const tdStyle = "break-keep text-nowrap whitespace-nowrap"

export function PreviewTableView({ records }: { records: PIDRecord[] }) {
    const [attributes, setAttributes] = useState<Set<string>>(new Set())

    const localAttributes = new Set<string>()
    for (const record of records) {
        for (const entry of record.record) {
            if (!localAttributes.has(entry.key)) {
                localAttributes.add(entry.key)
            }
        }
    }
    if (attributes.symmetricDifference(localAttributes).size > 0) {
        setAttributes(localAttributes)
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>PID</TableHead>
                    {Array.from(attributes).map((attribute) => (
                        <PreviewTableHeaderCell
                            className={tdStyle}
                            key={attribute}
                            attributePID={attribute}
                        />
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                    <TableRow key={record.pid} className="hover:bg-muted">
                        <TableCell className={cn("font-medium", tdStyle)}>
                            {record.pid}
                        </TableCell>
                        {Array.from(attributes).map((attribute) => (
                            <TableCell key={attribute} className={tdStyle}>
                                {
                                    record.record.find(
                                        (entry) => entry.key === attribute,
                                    )?.value
                                }
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function PreviewTableHeaderCell({
    attributePID,
    className,
}: {
    attributePID: string
    className: string
}) {
    const { data, isLoading, error } = useResolvedAttributePID(attributePID)

    if (error) {
        console.warn("Failed to resolve attribute PID", attributePID, error)
    }

    return (
        <TableHead className={className}>
            {error ? (
                attributePID
            ) : !isLoading && data ? (
                data.name
            ) : (
                <Skeleton className="h-4 w-20" />
            )}
        </TableHead>
    )
}
