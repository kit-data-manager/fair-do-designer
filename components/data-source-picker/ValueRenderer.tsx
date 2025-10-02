import { JSONValuesSingle } from "@/lib/data-source-picker/json-unifier"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ValueRenderer({
    values,
    timesObserved,
}: {
    values: Map<JSONValuesSingle, number>
    timesObserved: number
}) {
    const [showAll, setShowAll] = useState(false)

    const arr = useMemo(() => {
        return [...values.entries()].sort((a, b) => b[1] - a[1])
    }, [values])

    const canShowMore = useMemo(() => {
        return arr.length > 1
    }, [arr.length])

    const sliced = useMemo(() => {
        if (showAll) {
            return arr
        } else {
            return arr.slice(0, 1)
        }
    }, [arr, showAll])

    return (
        <div
            className={`p-1 group-hover:bg-muted/50 flex items-center  ${showAll ? "flex-col items-start" : "gap-2 truncate"}`}
        >
            <div className={showAll ? "" : "truncate"}>
                {sliced.map(([value, observedTimes], i) => (
                    <SingleValueRenderer
                        value={value}
                        key={i}
                        showAll={showAll}
                        observedTimes={observedTimes}
                        timesObserved={timesObserved}
                    />
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className={`shrink-0 p-0 text-muted-foreground h-4 ${canShowMore ? "" : "hidden"}`}
            >
                {showAll ? "Show less" : "[...]"}
            </Button>
        </div>
    )
}

export function SingleValueRenderer({
    value,
    showAll,
    observedTimes,
    timesObserved,
}: {
    value: JSONValuesSingle
    showAll: boolean
    observedTimes: number
    timesObserved: number
}) {
    const percentage = useMemo(() => {
        return ((observedTimes / timesObserved) * 100).toFixed(0)
    }, [observedTimes, timesObserved])

    return (
        <div className="flex items-start gap-1 pb-1">
            {showAll && <div className="text-muted-foreground">-</div>}
            <div className={`text-chart-1 ${showAll ? "" : "truncate"}`}>
                <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                        <span
                            className={`${showAll ? "line-clamp-4" : "truncate"}`}
                        >
                            {value + " "}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[400px]">
                        {value}
                    </TooltipContent>
                </Tooltip>
                {showAll && (
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="text-xs text-muted-foreground">
                                {percentage}%
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {observedTimes} of {timesObserved} occurrences of
                            this entry had this value
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}
