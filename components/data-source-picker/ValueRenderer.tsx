import { JSONValuesSingle } from "@/lib/data-source-picker/json-unifier"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

export function ValueRenderer({
    values,
}: {
    values: Map<JSONValuesSingle, number>
}) {
    const [showAll, setShowAll] = useState(false)

    const arr = useMemo(() => {
        return [...values.keys()]
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
            className={`p-1 group-hover:bg-muted/50 flex items-center truncate ${showAll ? "flex-col items-start" : "gap-2"}`}
        >
            <div className="truncate">
                {sliced.map((value, i) => (
                    <SingleValueRenderer
                        value={value}
                        key={i}
                        showAll={showAll}
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
}: {
    value: JSONValuesSingle
    showAll: boolean
}) {
    return (
        <div className={`text-chart-1 truncate ${showAll ? "pb-1" : ""}`}>
            {value + ""}
        </div>
    )
}
