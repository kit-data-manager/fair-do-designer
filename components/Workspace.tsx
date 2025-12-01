"use client"

import { useCallback, useEffect, useRef, useState, DragEvent } from "react"
import * as Blockly from "blockly"
import { toolbox } from "@/lib/toolbox"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import "@/lib/blocks/all"
import {
    clearLocalStorage,
    loadFromLocalStorage,
    saveToLocalStorage,
} from "@/lib/serialization"
import * as BacklinksToolbox from "@/lib/toolboxes/backlinks"
import { ValidationField } from "@/lib/fields/ValidationField"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import "@/lib/theme"
import { DarkTheme } from "@/lib/theme"
import { applyFillAttrAsStyle } from "@/lib/utils"
import { InputJsonPointer } from "@/lib/blocks/input"
import { PathSegment } from "@/lib/data-source-picker/json-path"

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
    const router = useRouter()
    const theme = useTheme()
    const themeRef = useRef(theme)

    useEffect(() => {
        themeRef.current = theme
        if (workspace)
            workspace.setTheme(
                themeRef.current.resolvedTheme === "dark"
                    ? DarkTheme
                    : Blockly.Themes.Classic,
            )
    }, [theme, workspace])

    const validationFieldCheckInterval = useRef<number>(null)

    const [remountCounter, setRemountCounter] = useState(0)
    const forceRemount = useCallback((max?: number) => {
        setRemountCounter((v) => (max ? (v >= max ? v : v + 1) : v + 1))
    }, [])

    const mount = useCallback(() => {
        if (!divRef.current) {
            console.error("Failed to mount workspace: divRef empty")
            return
        }

        const workspace = Blockly.inject(divRef.current, {
            rtl: false,
            toolbox,
            renderer: "thrasos",
            theme:
                themeRef.current.resolvedTheme === "dark"
                    ? "docs-dark"
                    : undefined,
            grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
            plugins: {
                connectionPreviewer: Blockly.InsertionMarkerPreviewer,
            },
        })

        setWorkspace(workspace)
        setLoading(false)

        workspace.addChangeListener(Blockly.Events.disableOrphans)
        workspace.addChangeListener(applyFillAttrAsStyle)

        workspace.registerButtonCallback("dataAccessToolboxHelp", () => {
            router.push("/docs/blocks/data-access#advanced-queries")
        })

        // Load the initial state from storage and run the code.
        const loadResult = loadFromLocalStorage()

        if (loadResult === "error") {
            clearLocalStorage()
            forceRemount(1)
            return
        }

        // Every time the workspace changes state, save the changes to storage.
        workspace.addChangeListener((e: Blockly.Events.Abstract) => {
            // UI events are things like scrolling, zooming, etc.
            // No need to save after one of these.
            if (e.isUiEvent) return
            saveToLocalStorage()
        })

        BacklinksToolbox.register(workspace)

        // Initialize all validation fields
        checkAllValidationFields()

        function checkAllValidationFields() {
            workspace.getAllBlocks().forEach((block) => {
                if (
                    block.type === "profile_hmc" ||
                    block.type === "attribute_key"
                ) {
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
        validationFieldCheckInterval.current = window.setInterval(() => {
            checkAllValidationFields()
        }, 2000)
    }, [forceRemount, router, setWorkspace])

    const unmount = useCallback(() => {
        console.warn("Unloading workspace")

        unsetWorkspace()
        if (validationFieldCheckInterval.current)
            window.clearInterval(validationFieldCheckInterval.current)

        try {
            // Directly access the store to remove unwanted dependency on the workspace state
            workspaceStore.getState().workspace?.dispose()
        } catch (e) {
            console.warn("Disposing workspace failed", e)
        } finally {
            if (divRef.current) divRef.current.innerHTML = ""
        }
    }, [unsetWorkspace])

    useEffect(() => {
        // Automatically (re-)mount when dependencies of the mount function change
        mount()

        // Cleanup function
        return unmount
    }, [mount, unmount, remountCounter])

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

            Blockly.Events.setGroup(true)

            try {
                const block = workspace.newBlock("input_json_pointer")
                const rawQuery = event.dataTransfer?.getData("application/json")
                const label = event.dataTransfer?.getData("text/plain")

                if (!rawQuery) {
                    console.error(
                        "Received drop event that did not include a valid application/json data point",
                    )
                    return
                }
                if (!label) {
                    console.error(
                        "Received drop event that did not include a valid text/plain data point",
                    )
                    return
                }

                const query = JSON.parse(rawQuery) as PathSegment[]

                if (
                    "updateQuery" in block &&
                    typeof block.updateQuery === "function"
                ) {
                    ;(block as InputJsonPointer).updateQuery(query, label)
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
            } finally {
                Blockly.Events.setGroup(false)
            }
        },
        [workspace],
    )

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }, [])

    return (
        <div
            className="grow"
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
