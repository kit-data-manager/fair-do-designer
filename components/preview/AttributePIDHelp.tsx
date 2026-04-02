import type { PIDDataType } from "@kit-data-manager/pid-component"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircleIcon } from "lucide-react"

export function AttributePIDHelp({ data }: { data: PIDDataType }) {
    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger>
                <HelpCircleIcon className="size-3.5 shrink-0 opacity-70" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px]">
                <div>PID: {data.pid.toString()}</div>
                <div>
                    Description: {data.description ?? "No description provided"}
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
