import { DocumentEntry } from "@/lib/data-source-picker/json-unifier"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import { useCallback, DragEvent } from "react"
import { AvailabilityScale } from "@/components/data-source-picker/AvailabilityScale"

export function Entry({
    entry,
    totalDocuments,
    onEntryClick,
}: {
    entry: DocumentEntry
    totalDocuments: number
    onEntryClick?: (entry: DocumentEntry) => void
}) {
    const onDragStart = useCallback(
        (e: DragEvent) => {
            e.dataTransfer?.setData(
                "application/json",
                JSON.stringify(entry.path),
            )
        },
        [entry.path],
    )

    const onSelfClick = useCallback(() => {
        if (onEntryClick) onEntryClick(entry)
    }, [entry, onEntryClick])

    return (
        <div className="contents group">
            <div
                className="text-chart-3 p-1 group-hover:bg-muted/50 flex justify-between truncate"
                draggable
                onDragStart={onDragStart}
            >
                <div className="flex items-center gap-1 mr-2">
                    <Button
                        onClick={onSelfClick}
                        variant="ghost"
                        className="shrink-0 p-0 text-muted-foreground h-5.5"
                    >
                        <ArrowLeft />
                    </Button>
                    <AvailabilityScale
                        total={totalDocuments}
                        current={entry.timesObserved}
                    />
                </div>

                <div className="truncate">{entry.key}</div>
            </div>
            <ValueRenderer values={entry.observedValues} />
        </div>
    )
}
