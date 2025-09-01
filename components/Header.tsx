import { ChevronDown, FrameIcon, SquarePenIcon } from "lucide-react"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { Input } from "@/components/ui/input"
import {
    loadFromFile,
    saveToDisk,
    saveToLocalStorage,
} from "@/lib/serialization"
import { RecordMappingGenerator } from "@/lib/generators/python"
import { PythonCodeDownload } from "@/lib/python_code_download"

export function Header() {
    const designName = useStore(workspaceStore, (s) => s.designName)
    const setDesignName = useStore(workspaceStore, (s) => s.setDesignName)
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const fileUploadInput = useRef<HTMLInputElement>(null)

    const [nameInputValue, setNameInputValue] = useState(designName)
    const [editName, setEditName] = useState(false)

    const confirmNameChange = useCallback(() => {
        setDesignName(nameInputValue)
        setEditName(false)
        if (workspace) saveToLocalStorage(workspace)
    }, [nameInputValue, setDesignName, workspace])

    useEffect(() => {
        setNameInputValue(designName)
    }, [designName])

    const doSaveToDisk = useCallback(() => {
        if (workspace) saveToDisk(workspace)
    }, [workspace])

    const triggerLoadFromDisk = useCallback(() => {
        if (fileUploadInput.current) {
            fileUploadInput.current.click()
        }
    }, [])

    const onFileUploadInputChange = useCallback(() => {
        if (fileUploadInput.current && fileUploadInput.current.files) {
            const file = fileUploadInput.current.files.item(0)
            if (file && workspace) loadFromFile(file, workspace)
        }
    }, [workspace])

    const codeGenerator = useRef(
        new RecordMappingGenerator("PidRecordMappingPython"),
    )
    const codeDownloader = useRef(new PythonCodeDownload())

    const exportCode = useCallback(() => {
        const code = codeGenerator.current.workspaceToCode(workspace)
        codeDownloader.current.downloadCodeZip(code).then()
    }, [workspace])

    return (
        <div className="h-12 flex items-center px-4 gap-3 max-w-full">
            <FrameIcon className="size-5 shrink-0" />
            <div className="font-bold text-nowrap">Fair-DO Designer</div>
            {editName ? (
                <Input
                    className="w-60"
                    value={nameInputValue}
                    onChange={(e) => setNameInputValue(e.target.value)}
                    onBlur={confirmNameChange}
                    onKeyDown={(e) => e.key === "Enter" && confirmNameChange()}
                    autoFocus
                />
            ) : (
                <div
                    className="flex items-center gap-1 min-w-none truncate group text-sm"
                    onClick={() => setEditName(true)}
                >
                    <span className={"truncate"}>{designName}</span>
                    <SquarePenIcon className="size-3 text-muted-foreground shrink-0 group-hover:opacity-100 opacity-0" />
                </div>
            )}

            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>
                        File
                        <ChevronDown
                            className={"size-4 ml-1 text-muted-foreground"}
                        />
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={triggerLoadFromDisk}>
                            Load Design
                        </MenubarItem>
                        <MenubarItem onClick={doSaveToDisk}>
                            Save Design
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        Code
                        <ChevronDown
                            className={"size-4 ml-1 text-muted-foreground"}
                        />
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={exportCode}>
                            Export Code
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>

            <input
                className="hidden"
                type="file"
                ref={fileUploadInput}
                accept={"application/json"}
                onChange={onFileUploadInputChange}
            />
        </div>
    )
}
