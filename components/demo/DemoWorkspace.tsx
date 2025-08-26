"use client"

import { useEffect, useRef, useState } from "react"
import * as Blockly from "blockly"
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection"
import { blocks as profile_blocks } from "@/lib/blocks/all"
import { WorkspaceSvg } from "blockly"
import { cn } from "@/lib/utils"
import { OctagonAlert } from "lucide-react"
import "@/lib/theme"
import { useTheme } from "next-themes"

/**
 * Demo Workspace that displays blocks passed as props to this component. Use for documentation purposes only.
 * @constructor
 */
export function DemoWorkspace({
    className,
    blocks,
}: {
    blocks: Record<string, unknown>[]
    className?: string
}) {
    const [loading, setLoading] = useState(true)
    const divRef = useRef<HTMLDivElement>(null)
    const [workspace, setWorkspace] = useState<WorkspaceSvg | undefined>(
        undefined,
    )
    const [error, setError] = useState<unknown>(undefined)
    const theme = useTheme()

    useEffect(() => {
        try {
            if (!divRef.current) {
                console.error("Failed to mount workspace: divRef empty")
                return
            }

            Blockly.common.defineBlocks(profile_blocks)
            BlockDynamicConnection.overrideOldBlockDefinitions()

            const workspace = Blockly.inject(divRef.current, {
                rtl: false,
                renderer: "thrasos",
                theme: theme.resolvedTheme === "dark" ? "docs-dark" : undefined,
                grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
                plugins: {
                    connectionPreviewer:
                        BlockDynamicConnection.decoratePreviewer(
                            Blockly.InsertionMarkerPreviewer,
                        ),
                },
            })

            setWorkspace(workspace)
            setLoading(false)

            workspace.addChangeListener(
                BlockDynamicConnection.finalizeConnections,
            )

            workspace.registerButtonCallback("dataAccessToolboxHelp", () => {
                alert(
                    "Use the Data Access tab on the right side to create Data Access blocks by clicking or dragging-and-dropping JSON keys",
                )
            })

            Blockly.serialization.workspaces.load(
                {
                    blocks: {
                        languageVersion: 0,
                        blocks: blocks,
                    },
                },
                workspace,
            )

            setError(undefined)

            // Return cleanup function for clean unmounting
            return () => {
                try {
                    workspace.dispose()
                } catch (e) {
                    console.warn("Disposing workspace failed", e)
                }
            }
        } catch (e) {
            setError(e)
        }
    }, [blocks, setWorkspace, theme.resolvedTheme])

    // Resize the workspace if the surrounding div resizes
    useEffect(() => {
        if (workspace && divRef.current) {
            const observer = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    Blockly.svgResize(workspace)
                })
            })
            observer.observe(divRef.current)

            return () => observer.disconnect()
        }
    }, [workspace])

    if (error) {
        console.error("Failed to load example", error)
        return (
            <div className={cn("h-16 rounded-lg overflow-hidden", className)}>
                <div className="flex h-full justify-center items-center text-muted-foreground">
                    <OctagonAlert className="size-4 mr-2" /> Failed to load
                    example
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "h-16 rounded-lg overflow-hidden pointer-events-none my-2",
                className,
            )}
            ref={divRef}
        >
            {loading && (
                <div className="flex h-full justify-center items-center text-muted-foreground">
                    Loading...
                </div>
            )}
        </div>
    )
}
