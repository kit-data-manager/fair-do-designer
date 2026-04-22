import type { PIDDataType } from "@kit-data-manager/pid-component"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { camelToTitleCase } from "@/lib/utils"

export function AttributePIDHelp({
    data,
    className,
}: {
    data: PIDDataType
    className?: string
}) {
    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger className={className}>
                {camelToTitleCase(data.name)}
            </TooltipTrigger>
            <TooltipContent className="max-w-100">
                <div>
                    <b>Name</b>: {camelToTitleCase(data.name)}
                </div>
                <div>
                    <b>PID</b>: {data.pid.toString()}
                </div>
                <div>
                    <b>Description</b>:{" "}
                    {data.description ?? "No description provided"}
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
