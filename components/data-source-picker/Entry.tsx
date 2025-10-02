import { DocumentEntry } from "@/lib/data-source-picker/json-unifier"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import { useCallback, DragEvent } from "react"
import { AvailabilityScale } from "@/components/data-source-picker/AvailabilityScale"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { pathSegmentsToPointer } from "@/lib/data-source-picker/json-path"

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

                <Tooltip delayDuration={700}>
                    <TooltipTrigger>
                        <div className="truncate">{entry.key}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {pathSegmentsToPointer(entry.path)}
                    </TooltipContent>
                </Tooltip>
            </div>
            <ValueRenderer
                values={entry.observedValues}
                timesObserved={entry.timesObserved}
            />
        </div>
    )
}
