import { DocumentEntry } from "@/lib/data-source-picker/json-unifier"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import {
    useCallback,
    DragEvent,
    useRef,
    useEffect,
    useState,
    Fragment,
} from "react"
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
    shortened,
}: {
    entry: DocumentEntry
    totalDocuments: number
    onEntryClick?: (entry: DocumentEntry) => void
    shortened: string
}) {
    // Optimization to only render entries that are visible on screen. Otherwise, the number
    // of entries becomes a performance bottleneck quickly, especially while searching
    const divRef = useRef<HTMLDivElement>(null)
    const [isInViewport, setIsInViewport] = useState(false) // If false, an empty entry is rendered. Still has to render two divs to not break the grid, also has to be 32 px tall to not break the scroll indicator
    useEffect(() => {
        if (divRef.current) {
            const observer = new IntersectionObserver((entries) => {
                setIsInViewport(entries[0].isIntersecting)
            })

            observer.observe(divRef.current)

            return () => observer.disconnect()
        }
    }, [])

    const onDragStart = useCallback(
        (e: DragEvent) => {
            e.dataTransfer?.setData(
                "application/json",
                JSON.stringify(entry.path),
            )
            e.dataTransfer?.setData("text/plain", shortened)
        },
        [entry.path, shortened],
    )

    const onSelfClick = useCallback(() => {
        if (onEntryClick) onEntryClick(entry)
    }, [entry, onEntryClick])

    return (
        <div className="contents [&:hover:nth-child(2n)_>_div]:bg-muted/70 [&:hover:nth-child(2n+1)_>_div]:bg-muted/70">
            <div
                className="p-1 flex justify-between items-center min-w-0 max-w-full min-h-[32px]"
                draggable
                onDragStart={onDragStart}
                ref={divRef}
            >
                {isInViewport && (
                    <Fragment>
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
                            <TooltipTrigger asChild>
                                <div className="truncate">{shortened}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {pathSegmentsToPointer(entry.path)}
                            </TooltipContent>
                        </Tooltip>
                    </Fragment>
                )}
            </div>
            {isInViewport ? (
                <ValueRenderer
                    values={entry.observedValues}
                    timesObserved={entry.timesObserved}
                />
            ) : (
                <div />
            )}
        </div>
    )
}
