import { useMemo } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function AvailabilityScale({
    total,
    current,
}: {
    total: number
    current: number
}) {
    const percentage = useMemo(() => {
        return ((current / total) * 100).toFixed(0)
    }, [current, total])

    return (
        <Tooltip>
            <TooltipTrigger>
                <div className="text-xs relative p-1 h-3 w-6 text-center text-foreground">
                    <div
                        className={`absolute z-20 left-0 top-0 bottom-0 border-chart-3 rounded-md ${percentage == "100" ? "border-4" : "bg-chart-3"}`}
                        style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute z-10 left-0 top-0 bottom-0 right-0 bg-chart-3/50 rounded-md" />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {percentage}% Availability ({current}/{total} documents)
            </TooltipContent>
        </Tooltip>
    )
}
