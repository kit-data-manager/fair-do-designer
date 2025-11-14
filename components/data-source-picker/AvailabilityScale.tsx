import { useMemo } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { DotIcon } from "lucide-react"

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
                        className={`absolute z-20 left-0 top-0 bottom-0 border-primary rounded-md bg-primary`}
                        style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute z-10 left-0 top-0 bottom-0 right-0 bg-primary/50 rounded-md" />
                    {percentage === "100" && (
                        <DotIcon className="text-background/70 size-5 absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {percentage}% Availability ({current}/{total} documents)
            </TooltipContent>
        </Tooltip>
    )
}
