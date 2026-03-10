import { DocumentEntry } from "@/lib/data-source-picker/json-unifier"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FingerprintIcon } from "lucide-react"
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import {
    useCallback,
    DragEvent,
    useRef,
    useEffect,
    useState,
    Fragment,
    useMemo,
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

    // Whether all the observed values in the merged document entry are unique.
    // This indicates that this value can be well-used for identifiers and the likes.
    const isUnique = useMemo(() => {
        return (
            entry.observedValues.values().every((v) => v === 1) &&
            entry.timesObserved === totalDocuments
        )
    }, [entry.observedValues, entry.timesObserved, totalDocuments])

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
                            <Tooltip delayDuration={700}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onSelfClick}
                                        variant="ghost"
                                        className="shrink-0 p-0 text-muted-foreground h-5.5"
                                    >
                                        <ArrowLeft />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add to Design (also possible with
                                    drag-and-drop)
                                </TooltipContent>
                            </Tooltip>
                            <AvailabilityScale
                                total={totalDocuments}
                                current={entry.timesObserved}
                            />
                            {isUnique && (
                                <Tooltip delayDuration={700}>
                                    <TooltipTrigger asChild>
                                        <FingerprintIcon className="ml-1 size-4 shrink-0 text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-96">
                                        The values of this entry are different
                                        in each provided file. Therefore, this
                                        value might be suitable as an
                                        identifier.
                                    </TooltipContent>
                                </Tooltip>
                            )}
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
