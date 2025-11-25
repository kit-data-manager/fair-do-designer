/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core"
import { workspaceStore } from "@/lib/stores/workspace"
import { LastUsedFile, lastUsedFilesStore } from "@/lib/stores/last-used-files"
import { useCallback, useContext } from "react"
import { UnifierContext } from "@/components/UnifierContext"
import { JSONValues, Unifier } from "@/lib/data-source-picker/json-unifier"
import { Workspace } from "blockly"

const storageKey = "fairdoWorkspace"
const version = 2

interface WorkspaceData {
    version: number
    name: string
    data: Record<string, unknown>
    lastUsedFiles?: LastUsedFile[]
    documents: { name: string; doc: unknown }[]
}

/**
 * Utility that prepares the workspace for saving.
 * @param workspace Blockly workspace to save.
 * @param unifier Unifier instance to save documents from.
 * @returns Serializable workspace data.
 */
function save(workspace: Blockly.Workspace, unifier: Unifier): WorkspaceData {
    const data = Blockly.serialization.workspaces.save(workspace)
    const name = workspaceStore.getState().designName
    const lastUsedFiles = lastUsedFilesStore.getState().files

    return {
        version,
        name,
        data,
        lastUsedFiles,
        documents: unifier.getDocuments(),
    }
}

/**
 * Hook that saves the state of the designer to browser's local storage.
 */
export function useSaveToLocalStorage() {
    const { unifier } = useContext(UnifierContext)

    return useCallback(() => {
        const workspace = workspaceStore.getState().workspace
        if (!workspace || !unifier) return

        window.localStorage?.setItem(
            storageKey,
            JSON.stringify(save(workspace, unifier)),
        )
    }, [unifier])
}

/**
 * Hook that saves the state of the workspace to disk by downloading a JSON file.
 */
export function useSaveToDisk() {
    const { unifier } = useContext(UnifierContext)

    return useCallback(() => {
        const workspace = workspaceStore.getState().workspace
        if (!workspace || !unifier) return

        const data = save(workspace, unifier)
        const blob = new Blob([JSON.stringify(data)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `FAIR DO Designer - ${data.name.replaceAll(/[^a-zA-Z0-9 _-]/gm, "")} - ${new Date().toISOString()}.json`
        a.click()
    }, [unifier])
}

const useLoad = function () {
    const { unifier, updateFlat } = useContext(UnifierContext)

    return useCallback(
        (workspaceData: WorkspaceData) => {
            const workspace = workspaceStore.getState().workspace
            if (!workspace || !unifier) return

            function loadWorkspace() {
                Blockly.serialization.workspaces.load(
                    workspaceData.data,
                    workspace as Workspace,
                    {
                        recordUndo: true,
                    },
                )

                workspaceStore.getState().setDesignName(workspaceData.name)
                if (workspaceData.lastUsedFiles) {
                    lastUsedFilesStore
                        .getState()
                        .setFiles(workspaceData.lastUsedFiles)
                }
            }

            function loadDocuments() {
                for (const doc of workspaceData.documents) {
                    unifier?.process(doc.name, doc.doc as JSONValues)
                }
                updateFlat()
            }

            if (workspaceData.version === 1) {
                loadWorkspace()
            } else if (workspaceData.version === version) {
                loadWorkspace()
                loadDocuments()
            } else {
                throw `Unsupported save file version: ${workspaceData.version}`
            }
        },
        [unifier, updateFlat],
    )
}

/**
 * Loads saved state from local storage into the given workspace.
 */
export const useLoadFromLocalStorage = function () {
    const load = useLoad()

    return useCallback((): "no-data" | "loaded" | "error" => {
        try {
            const data = window.localStorage?.getItem(storageKey)
            if (!data) return "no-data"

            const workspaceData = JSON.parse(data) as WorkspaceData

            load(workspaceData)
            return "loaded"
        } catch (error) {
            console.error("Error loading workspace from local storage:", error)
            return "error"
        }
    }, [load])
}

/**
 * Removes save data from local storage
 */
export function clearLocalStorage() {
    window.localStorage?.removeItem(storageKey)
}

/**
 * Loads saved state from local storage into the given workspace.
 */
export const useLoadFromFile = function () {
    const load = useLoad()

    return useCallback(
        async (file: Blob): Promise<"no-data" | "loaded" | "error"> => {
            const data = await file.text().catch((e) => {
                console.error("Failed to read file", e)
                return undefined
            })

            if (!data) return "no-data"

            try {
                const workspaceData = JSON.parse(data) as WorkspaceData

                load(workspaceData)
                return "loaded"
            } catch (error) {
                console.error("Error loading workspace from file:", error)
                return "error"
            }
        },
        [load],
    )
}
