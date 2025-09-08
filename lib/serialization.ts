/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core"
import { workspaceStore } from "@/lib/stores/workspace"
import { LastUsedFile, lastUsedFilesStore } from "@/lib/stores/last-used-files"

const storageKey = "fairdoWorkspace"
const version = 1

interface WorkspaceData {
    version: number
    name: string
    data: Record<string, unknown>
    lastUsedFiles?: LastUsedFile[]
}

/**
 * Utility that prepares the workspace for saving.
 * @param workspace Blockly workspace to save.
 * @returns Serializable workspace data.
 */
function save(workspace: Blockly.Workspace): WorkspaceData {
    const data = Blockly.serialization.workspaces.save(workspace)
    const name = workspaceStore.getState().designName
    const lastUsedFiles = lastUsedFilesStore.getState().files

    return { version, name, data, lastUsedFiles }
}

/**
 * Saves the state of the workspace to browser's local storage.
 * @param workspace Blockly workspace to save.
 */
export function saveToLocalStorage(workspace: Blockly.Workspace) {
    window.localStorage?.setItem(storageKey, JSON.stringify(save(workspace)))
}

/**
 * Saves the state of the workspace to disk by downloading a JSON file.
 * @param workspace Blockly workspace to save.
 */
export function saveToDisk(workspace: Blockly.Workspace) {
    const data = save(workspace)
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `FAIR DO Designer - ${data.name.replaceAll(/[^a-zA-Z0-9 _-]/gm, "")} - ${new Date().toISOString()}.json`
    a.click()
}

/**
 * Loads saved state from local storage into the given workspace.
 * @param workspaceData Deserialized workspace data.
 * @param workspace Blockly workspace to load into.
 */
const load = function (
    workspaceData: WorkspaceData,
    workspace: Blockly.Workspace,
) {
    if (workspaceData.version !== version) {
        throw `Unsupported save file version: ${workspaceData.version}`
    }

    // Don't emit events during loading.
    Blockly.Events.disable()

    try {
        Blockly.serialization.workspaces.load(
            workspaceData.data,
            workspace,
            undefined,
        )
    } catch (e) {
        throw e
    } finally {
        Blockly.Events.enable()
    }

    workspaceStore.getState().setDesignName(workspaceData.name)
    if (workspaceData.lastUsedFiles) {
        lastUsedFilesStore.getState().setFiles(workspaceData.lastUsedFiles)
    }
}

/**
 * Loads saved state from local storage into the given workspace.
 * @param workspace Blockly workspace to load into.
 * @returns {"no-data" | "loaded" | "error"} Status code of the load operation. Only "loaded" indicates success.
 */
export const loadFromLocalStorage = function (
    workspace: Blockly.Workspace,
): "no-data" | "loaded" | "error" {
    try {
        const data = window.localStorage?.getItem(storageKey)
        if (!data) return "no-data"

        const workspaceData = JSON.parse(data) as WorkspaceData

        load(workspaceData, workspace)
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
 * @param file File to load from.
 * @param workspace Blockly workspace to load into.
 * @returns {Promise<"no-data" | "loaded" | "error">} Status code of the load operation. Only "loaded" indicates success.
 */
export const loadFromFile = async function (
    file: File,
    workspace: Blockly.Workspace,
): Promise<"no-data" | "loaded" | "error"> {
    const data = await file.text().catch((e) => {
        console.error("Failed to read file", e)
        return undefined
    })

    if (!data) return "no-data"

    try {
        const workspaceData = JSON.parse(data) as WorkspaceData

        load(workspaceData, workspace)
        return "loaded"
    } catch (error) {
        console.error("Error loading workspace from file:", error)
        return "error"
    }
}
