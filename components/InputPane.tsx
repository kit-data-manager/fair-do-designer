"use client"

import { Button } from "@/components/ui/button"
import { UnifiedDocument } from "@kit-data-manager/json-picker-react"
import { useCallback, useRef } from "react"
import * as Blockly from "blockly"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import type {
    JSONKeyClickEvent,
    UnifiedDocumentCustomEvent,
} from "@kit-data-manager/json-picker"

export function InputPane() {
    const unifiedDocument = useRef<HTMLUnifiedDocumentElement>(null)
    const uploadInputRef = useRef<HTMLInputElement>(null)

    const workspace = useStore(workspaceStore, (s) => s.workspace)

    const uploadFiles = useCallback(() => {
        if (uploadInputRef.current) {
            uploadInputRef.current.click()
        }
    }, [])

    const onUploadInputChange = useCallback(() => {
        if (uploadInputRef.current && unifiedDocument.current) {
            if (
                uploadInputRef.current.files &&
                uploadInputRef.current.files.length > 0
            ) {
                unifiedDocument.current
                    .addFiles([...uploadInputRef.current.files])
                    .catch(console.error)
            }
        }
    }, [])

    const loadExampleFiles = useCallback(async () => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
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

        if (!unifiedDocument.current) return
        unifiedDocument.current.addFiles(blobs).catch(console.error)
    }, [])

    const reset = useCallback(() => {
        if (unifiedDocument.current) {
            unifiedDocument.current.resetFiles().then()
        }
    }, [])

    const onJsonKeyClick = useCallback(
        (event: UnifiedDocumentCustomEvent<JSONKeyClickEvent>) => {
            if (!workspace) return
            const block = workspace.newBlock("input_jsonpath")
            const query = event.detail.path

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
        <div className="grow w-[800px] overflow-auto">
            <div className="bg-muted p-2">
                <h4 className="font-bold">Data Access</h4>
            </div>
            <div className="p-2">
                <div className="">
                    <div className="flex gap-2 mb-2">
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

                    <input
                        type="file"
                        className="hidden"
                        accept="application/json"
                        multiple
                        ref={uploadInputRef}
                        onChange={onUploadInputChange}
                    />
                    <div className="text-sm text-muted-foreground">
                        Hint: Use drag-and-drop to place Data Access blocks in
                        the workspace
                    </div>
                    <UnifiedDocument
                        ref={unifiedDocument}
                        onJsonKeyClick={onJsonKeyClick}
                    />
                </div>
            </div>
        </div>
    )
}
