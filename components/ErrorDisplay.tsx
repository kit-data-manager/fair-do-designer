import { CircleAlert, TriangleAlert, XIcon } from "lucide-react"
import { PropsWithChildren, useMemo } from "react"

function cn(size?: "md" | "xl" | "sm") {
    if (!size || size == "md") {
        return "text-destructive-foreground bg-destructive rounded p-2 flex items-center text-sm"
    } else if (size == "xl") {
        return "text-destructive-foreground bg-destructive rounded p-4 flex items-center text-xl"
    } else {
        return "text-destructive-foreground bg-destructive rounded p-1 flex items-center text-xs"
    }
}

function cnIcon(size?: "md" | "xl" | "sm") {
    if (!size || size == "md") {
        return "size-4 mr-2 shrink-0"
    } else if (size == "xl") {
        return "w-8 h-8 mr-4 shrink-0"
    } else {
        return "size-3 mr-1 shrink-0"
    }
}

/**
 * Handler for any kind of error that is caught somewhere
 * Can handle any instance of Error
 * @param e The error that will be turned into a string
 */
export function handleError(e: unknown) {
    if (typeof e === "string") return e
    if (e !== null && e instanceof window.Error)
        return `${e.message} (type: ${e.name})`
    else return JSON.stringify(e)
}

export function ErrorDisplay(
    props: (
        | {
              title?: string
              error: unknown
              prefix?: string
          }
        | PropsWithChildren
    ) & {
        size?: "md" | "xl" | "sm"
        className?: string
        warn?: boolean
        onClear?: () => void
    },
) {
    const parsedText = useMemo(() => {
        if (!("error" in props)) return undefined
        return props.error ? handleError(props.error) : ""
    }, [props])

    if ("error" in props && !props.error) return null
    if ("children" in props && !props.children) return null

    return (
        <div
            className={
                cn(props.size) +
                " " +
                props.className +
                (props.warn
                    ? " bg-transparent! border-warn border text-warn"
                    : "")
            }
        >
            {props.warn ? (
                <TriangleAlert className={cnIcon(props.size)} />
            ) : (
                <CircleAlert className={cnIcon(props.size)} />
            )}
            {"error" in props ? (
                <div>
                    <div className="">{props.title}</div>
                    <div className={props.title ? "text-xs" : ""}>
                        {props.prefix} {parsedText}
                    </div>
                </div>
            ) : (
                props.children
            )}
            <div className="grow" />
            {props.onClear ? (
                <button
                    className={
                        "p-2 rounded transition hover:bg-primary/10" +
                        (props.warn
                            ? ""
                            : "bg-destructive hover:bg-destructive-foreground/20")
                    }
                    onClick={() => props.onClear?.call(null)}
                >
                    <XIcon className="size-4" />
                </button>
            ) : null}
        </div>
    )
}
