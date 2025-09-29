"use client"

import { Button } from "@/components/ui/button"
import { useCallback, useRef, useState } from "react"
import * as Blockly from "blockly"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import type {
    JSONKeyClickEvent,
    UnifiedDocumentCustomEvent,
} from "@kit-data-manager/json-picker"
import { lastUsedFilesStore } from "@/lib/stores/last-used-files"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import {
    DataSourcePicker,
    DataSourcePickerRef,
} from "@/components/data-source-picker/DataSourcePicker"

export function InputPane() {
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const dataSourcePicker = useRef<DataSourcePickerRef>(null)
    const addToUsedFiles = useStore(lastUsedFilesStore, (s) => s.appendToFiles)
    const setUsedFiles = useStore(lastUsedFilesStore, (s) => s.setFiles)
    const clearUsedFiles = useStore(lastUsedFilesStore, (s) => s.clearFiles)
    const lastUsedFiles = useStore(lastUsedFilesStore, (s) => s.files)

    // True if user files or example files have been loaded
    const [somethingLoaded, setSomethingLoaded] = useState(false)

    const workspace = useStore(workspaceStore, (s) => s.workspace)

    const uploadFiles = useCallback(() => {
        if (uploadInputRef.current) {
            uploadInputRef.current.click()
        }
    }, [])

    const onUploadInputChange = useCallback(() => {
        if (uploadInputRef.current) {
            if (
                uploadInputRef.current.files &&
                uploadInputRef.current.files.length > 0
            ) {
                if (somethingLoaded) {
                    addToUsedFiles(
                        [...uploadInputRef.current.files].map((f) => ({
                            name: f.name,
                            path: f.webkitRelativePath,
                        })),
                    )
                } else {
                    setUsedFiles(
                        [...uploadInputRef.current.files].map((f) => ({
                            name: f.name,
                            path: f.webkitRelativePath,
                        })),
                    )
                }

                setSomethingLoaded(true)
            }
        }
    }, [addToUsedFiles, setUsedFiles, somethingLoaded])

    const loadExampleFiles = useCallback(async () => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
        const urls = [
            `${basePath}/demo/json/metadata.json`,
            `${basePath}/demo/json/metadata(1).json`,
            `${basePath}/demo/json/metadata(2).json`,
            `${basePath}/demo/json/metadata(3).json`,
            `${basePath}/demo/json/metadata(4).json`,
        ]
        const blobs: Blob[] = []

        for (const url of urls) {
            const req = await fetch(url)
            const json = await req.json()
            const blob = new Blob([JSON.stringify(json)], {
                type: "application/json",
            })
            blobs.push(blob)
        }

        for (const blob of blobs) {
            dataSourcePicker.current!.addFile(JSON.parse(await blob.text()))
        }

        setSomethingLoaded(true)
    }, [])

    const reset = useCallback(() => {
        clearUsedFiles()
    }, [clearUsedFiles])

    const onJsonKeyClick = useCallback(
        (event: UnifiedDocumentCustomEvent<JSONKeyClickEvent>) => {
            if (!workspace) return
            const query = event.detail.path
            if (!query) {
                console.error("Unexpected empty query", query)
                return
            }
            const block = workspace.newBlock("input_jsonpath")

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
                    (workspace.getInjectionDiv().offsetWidth * 2) / 3 -
                        offset.x,
                    workspace.getInjectionDiv().offsetHeight / 3 - offset.y,
                ),
            )
            block.render()
        },
        [workspace],
    )

    return (
        <div className="min-h-0 w-full justify-stretch flex flex-col">
            <div className="p-2 bg-muted w-full flex flex-wrap gap-2">
                <Button variant="outline" onClick={uploadFiles}>
                    Upload files
                </Button>
                <Button variant="outline" onClick={loadExampleFiles}>
                    Add example files
                </Button>
                <Button variant="outline" onClick={reset}>
                    Reset
                </Button>
            </div>
            <div className="min-h-0 overflow-x-auto">
                <div className="min-h-0 h-full p-2 flex flex-col">
                    <input
                        type="file"
                        className="hidden"
                        accept="application/json"
                        multiple
                        ref={uploadInputRef}
                        onChange={onUploadInputChange}
                    />
                    {!somethingLoaded && lastUsedFiles.length > 0 && (
                        <Alert className="mb-2">
                            <InfoIcon />
                            <AlertTitle className="flex items-start justify-between">
                                The following files were previously used with
                                this design
                            </AlertTitle>
                            <AlertDescription>
                                {lastUsedFiles.map((file) => (
                                    <div
                                        key={file.path + file.name}
                                        className="text-sm max-w-full truncate"
                                    >
                                        {file.path}
                                        {file.name}
                                    </div>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div>
                        <DataSourcePicker ref={dataSourcePicker} />
                    </div>
                </div>
            </div>
        </div>
    )
}
