"use client"

import { Button } from "@/components/ui/button"
import { useCallback, useRef } from "react"
import * as Blockly from "blockly"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import {
    DataSourcePicker,
    DataSourcePickerRef,
} from "@/components/data-source-picker/DataSourcePicker"
import { DocumentEntry } from "@/lib/data-source-picker/json-unifier"
import { InputJsonPointer } from "@/lib/blocks/input"

export function InputPane() {
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const dataSourcePicker = useRef<DataSourcePickerRef>(null)

    const workspace = useStore(workspaceStore, (s) => s.workspace)

    const uploadFiles = useCallback(() => {
        if (uploadInputRef.current) {
            uploadInputRef.current.click()
        }
    }, [])

    const onUploadInputChange = useCallback(async () => {
        if (uploadInputRef.current && dataSourcePicker.current) {
            if (
                uploadInputRef.current.files &&
                uploadInputRef.current.files.length > 0
            ) {
                for (const file of uploadInputRef.current.files) {
                    try {
                        dataSourcePicker.current.addFile(
                            file.name,
                            JSON.parse(await file.text()),
                        )
                    } catch (e) {
                        console.error("Failed to parse file", e)
                    }
                }
            }
        }
    }, [])

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
            try {
                dataSourcePicker.current!.addFile(
                    "Example metadata",
                    JSON.parse(await blob.text()),
                )
            } catch (e) {
                console.error("Failed to parse file", e)
            }
        }
    }, [])

    const reset = useCallback(() => {
        if (dataSourcePicker.current) dataSourcePicker.current.reset()
    }, [])

    const onEntryClick = useCallback(
        (event: DocumentEntry) => {
            if (!workspace) return

            const block = workspace.newBlock("input_jsonpath")

            if (
                "updateQuery" in block &&
                typeof block.updateQuery === "function"
            ) {
                ;(block as InputJsonPointer).updateQuery(event.path)
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
                    <DataSourcePicker
                        ref={dataSourcePicker}
                        onEntryClick={onEntryClick}
                    />
                </div>
            </div>
        </div>
    )
}
