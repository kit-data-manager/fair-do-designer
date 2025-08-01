"use client"

import { useCallback, useEffect, useRef, useState, DragEvent } from "react"
import * as Blockly from "blockly"
import { toolbox } from "@/lib/toolbox"
import * as BlockDynamicConnection from "@blockly/block-dynamic-connection"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { blocks as profile_blocks } from "@/lib/blocks/all"
import { load, save } from "@/lib/serialization"
import * as ErrorsToolbox from "@/lib/toolboxes/errors_logging"
import * as BacklinksToolbox from "@/lib/toolboxes/backlinks"
import { ValidationField } from "@/lib/fields/ValidationField"

/**
 * This component encapsulates the {@link Blockly.Workspace} and takes care of initializing it and registering any
 * toolboxes and listeners.
 *
 * To get a **reference** to the Workspace, use the {@link workspaceStore}. The workspaceStore always holds a reference to the current Blockly.Workspace.
 *
 * This component should be on the page exactly once if the Workspace is used.
 * @constructor
 */
export function Workspace() {
    const [loading, setLoading] = useState(true)
    const divRef = useRef<HTMLDivElement>(null)
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const setWorkspace = useStore(workspaceStore, (s) => s.setWorkspace)
    const unsetWorkspace = useStore(workspaceStore, (s) => s.unsetWorkspace)

    useEffect(() => {
        if (!divRef.current) {
            console.error("Failed to mount workspace: divRef empty")
            return
        }

        Blockly.common.defineBlocks(profile_blocks)
        BlockDynamicConnection.overrideOldBlockDefinitions()

        const workspace = Blockly.inject(divRef.current, {
            rtl: false,
            toolbox,
            renderer: "thrasos",
            grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
            plugins: {
                connectionPreviewer: BlockDynamicConnection.decoratePreviewer(
                    Blockly.InsertionMarkerPreviewer,
                ),
            },
        })

        setWorkspace(workspace)
        setLoading(false)

        workspace.addChangeListener(Blockly.Events.disableOrphans)
        workspace.addChangeListener(BlockDynamicConnection.finalizeConnections)

        workspace.registerButtonCallback("dataAccessToolboxHelp", () => {
            alert(
                "Use the Data Access tab on the right side to create Data Access blocks by clicking or dragging-and-dropping JSON keys",
            )
        })

        // Load the initial state from storage and run the code.
        load(workspace)

        // Every time the workspace changes state, save the changes to storage.
        workspace.addChangeListener((e: Blockly.Events.Abstract) => {
            // UI events are things like scrolling, zooming, etc.
            // No need to save after one of these.
            if (e.isUiEvent) return
            save(workspace)
        })

        ErrorsToolbox.register(workspace)
        BacklinksToolbox.register(workspace)

        // Initialize all validation fields
        checkAllValidationFields()

        function checkAllValidationFields() {
            workspace.getAllBlocks().forEach((block) => {
                if (block.type === "profile_hmc") {
                    const fields = Array.from(block.getFields())
                    for (const field of fields) {
                        if (field instanceof ValidationField) {
                            field.forceCheck()
                        }
                    }
                }
            })
        }

        // Periodically check them as well
        const interval = setInterval(() => {
            checkAllValidationFields()
        }, 2000)

        // Return cleanup function for clean unmounting
        return () => {
            console.warn("Unloading workspace")
            unsetWorkspace()
            clearInterval(interval)

            try {
                workspace.dispose()
            } catch (e) {
                console.warn("Disposing workspace failed", e)
            }
        }
    }, [setWorkspace, unsetWorkspace])

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

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            if (!workspace) return

            const block = workspace.newBlock("input_jsonpath")
            const query = event.dataTransfer?.getData("text/plain")

            if (!query) {
                console.error(
                    "Received drop event that did not include a valid text/plain data point",
                )
                return
            }

            if (
                "updateQuery" in block &&
                typeof block.updateQuery === "function"
            ) {
                block.updateQuery(query)
            }

            block.initSvg()
            const offset = workspace.getOriginOffsetInPixels()
            block.moveTo(
                new Blockly.utils.Coordinate(
                    event.nativeEvent.offsetX - offset.x,
                    event.nativeEvent.offsetY - offset.y,
                ),
            )
            block.render()
        },
        [workspace],
    )

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }, [])

    return (
        <div
            className="h-screen"
            ref={divRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            {loading && (
                <div className="flex h-full justify-center items-center text-muted-foreground">
                    Loading...
                </div>
            )}
        </div>
    )
}
