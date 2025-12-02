/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core"
import { workspaceStore } from "@/lib/stores/workspace"
import { runAllMigrations } from "@/lib/migrate/json_migrate"
import { JSONValues, Unifier } from "@/lib/data-source-picker/json-unifier"
import { Workspace } from "blockly"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"

const storageKey = "fairdoWorkspace"
const version = 2

export interface BlockData extends Record<string, unknown> {
    type: string
    id: string
    x?: number
    y?: number
    fields?: Record<string, unknown>
    inputs?: Record<string, { block?: BlockData; shadow?: BlockData }>
}

export interface WorkspaceData {
    version: number
    name: string
    data: {
        blocks: {
            languageVersion: number // seems to always be 0
            blocks: BlockData[]
        }
        variables: unknown[]
    }
    documents: { name: string; doc: unknown }[]
}

/**
 * Utility that prepares the workspace for saving.
 * @param workspace Blockly workspace to save.
 * @param unifier Unifier instance to save documents from.
 * @returns Serializable workspace data.
 */
function save(workspace: Blockly.Workspace, unifier: Unifier): WorkspaceData {
    const data = Blockly.serialization.workspaces.save(
        workspace,
    ) as WorkspaceData["data"]
    const name = workspaceStore.getState().designName

    return {
        version,
        name,
        data,
        documents: unifier.getDocuments(),
    }
}

/**
 * Utility that saves the state of the designer to browser's local storage.
 */
export function saveToLocalStorage() {
    const workspace = workspaceStore.getState().workspace
    if (!workspace) return

    window.localStorage?.setItem(
        storageKey,
        JSON.stringify(
            save(workspace, dataSourcePickerStore.getState().unifier),
        ),
    )
}

/**
 * Utility that saves the state of the workspace to disk by downloading a JSON file.
 */
export function saveToDisk() {
    const workspace = workspaceStore.getState().workspace
    if (!workspace) return

    const data = save(workspace, dataSourcePickerStore.getState().unifier)
    const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `FAIR DO Designer - ${data.name.replaceAll(/[^a-zA-Z0-9 _-]/gm, "")} - ${new Date().toISOString()}.json`
    a.click()
}

const load = function (workspaceData: WorkspaceData) {
    const workspace = workspaceStore.getState().workspace
    if (!workspace) return

    workspaceData = runAllMigrations(workspaceData)

    function loadWorkspace() {
        Blockly.serialization.workspaces.load(
            workspaceData.data,
            workspace as Workspace,
            {
                recordUndo: true,
            },
        )

        workspaceStore.getState().setDesignName(workspaceData.name)
    }

    function loadDocuments() {
        for (const doc of workspaceData.documents) {
            dataSourcePickerStore
                .getState()
                .unifier.process(doc.name, doc.doc as JSONValues)
        }
        dataSourcePickerStore.getState().updateFlat()
    }

    if (workspaceData.version === 1) {
        loadWorkspace()
    } else if (workspaceData.version === version) {
        loadWorkspace()
        loadDocuments()
    } else {
        throw `Unsupported save file version: ${workspaceData.version}`
    }
}

/**
 * Loads saved state from local storage into the given workspace.
 */
export const loadFromLocalStorage = function () {
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
export const loadFromFile = async function (file: Blob) {
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
}
