import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { EllipsisIcon, EyeIcon, XIcon } from "lucide-react"
import {
    IUnifiedDocumentEntry,
    JSONValuesPrimitive,
} from "@/lib/data-source-picker/types"

export function ValueRenderer({
    values,
    unifiedDocumentEntry,
    timesObserved,
    showInspectModal,
}: {
    values: Map<JSONValuesPrimitive, number>
    unifiedDocumentEntry: IUnifiedDocumentEntry
    timesObserved: number
    showInspectModal: () => void
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

    if (unifiedDocumentEntry.children.length > 0) {
        return (
            <div className="flex items-center p-1">
                <div className={`opacity-0 pr-1`}>-</div>
                <div className="text-primary dark:text-foreground/70 font-medium pr-2">
                    {unifiedDocumentEntry.isArray() ? "Array" : "Object"}
                </div>
                <Button
                    variant="ghost"
                    size="mini-inline"
                    className={`text-muted-foreground`}
                    onClick={showInspectModal}
                >
                    <EyeIcon className="size-4 shrink-0 " />
                </Button>
            </div>
        )
    }

    return (
        <div
            className={`p-1 flex items-center  ${showAll ? "justify-between" : "gap-2 truncate"}`}
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
                size="mini-inline"
                onClick={() => setShowAll(!showAll)}
                className={`text-muted-foreground ${canShowMore ? "" : "hidden"} ${showAll ? "p-1 h-6" : ""}`}
            >
                {showAll ? (
                    <XIcon className="size-4 shrink-0" />
                ) : (
                    <EllipsisIcon className="size-4 shrink-0" />
                )}
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
    value: JSONValuesPrimitive | IUnifiedDocumentEntry
    showAll: boolean
    observedTimes: number
    timesObserved: number
}) {
    const percentage = useMemo(() => {
        return ((observedTimes / timesObserved) * 100).toFixed(0)
    }, [observedTimes, timesObserved])

    return (
        <div className="flex items-start gap-1">
            <div
                className={`text-muted-foreground ${showAll ? "my-1 leading-tight" : "opacity-0"}`}
            >
                -
            </div>
            <div
                className={`text-primary dark:text-foreground/70 ${showAll ? "my-1 leading-tight" : "truncate"}`}
            >
                <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                        <span
                            className={`inline ${showAll ? "line-clamp-4" : "truncate"}`}
                        >
                            {typeof value === "object" &&
                                value !== null &&
                                !value.isArray() && (
                                    <span className="italic">Object </span>
                                )}
                            {typeof value === "object" &&
                                value !== null &&
                                value.isArray() && (
                                    <span className="italic">Array </span>
                                )}
                            {typeof value !== "object" && value + " "}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[400px]">
                        {typeof value === "object"
                            ? JSON.stringify(value)
                            : value + ""}
                    </TooltipContent>
                </Tooltip>
                {showAll && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground inline">
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
