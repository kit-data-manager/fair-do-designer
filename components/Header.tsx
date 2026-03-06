import {
    ChevronDown,
    FrameIcon,
    RedoIcon,
    SquarePenIcon,
    UndoIcon,
} from "lucide-react"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { Input } from "@/components/ui/input"
import {
    loadFromFile,
    loadFromLocalStorage,
    saveToDisk,
    saveToLocalStorage,
} from "@/lib/serialization"
import Link from "next/link"
import { RecordMappingGenerator } from "@/lib/generators/python"
import { PythonCodeDownload } from "@/lib/python_code_download"
import { useCopyToClipboard } from "usehooks-ts"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { version } from "@/package.json"
import Image from "next/image"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
    const designName = useStore(workspaceStore, (s) => s.designName)
    const setDesignName = useStore(workspaceStore, (s) => s.setDesignName)
    const workspace = useStore(workspaceStore, (s) => s.workspace)
    const fileUploadInput = useRef<HTMLInputElement>(null)

    const [nameInputValue, setNameInputValue] = useState(designName)
    const [editName, setEditName] = useState(false)
    const [loadingSaveFileFailed, setLoadingSaveFileFailed] = useState(false)

    const [aboutModalOpen, setAboutModalOpen] = useState(false)

    const [, copy] = useCopyToClipboard()

    const confirmNameChange = useCallback(() => {
        setDesignName(nameInputValue)
        setEditName(false)
        saveToLocalStorage()
    }, [nameInputValue, setDesignName])

    useEffect(() => {
        setNameInputValue(designName)
    }, [designName])

    const triggerLoadFromDisk = useCallback(() => {
        if (fileUploadInput.current) {
            fileUploadInput.current.click()
        }
    }, [])

    const onFileUploadInputChange = useCallback(async () => {
        if (fileUploadInput.current && fileUploadInput.current.files) {
            const file = fileUploadInput.current.files.item(0)
            if (file) {
                saveToLocalStorage()
                const result = await loadFromFile(file)
                if (result === "no-data" || result === "error") {
                    setLoadingSaveFileFailed(true)
                    loadFromLocalStorage()
                    return
                }
            }
        }
    }, [])

    const codeGenerator = useRef(
        new RecordMappingGenerator("PidRecordMappingPython"),
    )
    const codeDownloader = useRef(new PythonCodeDownload())

    const exportCode = useCallback(() => {
        const code = codeGenerator.current.workspaceToCode(workspace)
        codeDownloader.current.downloadCodeZip(code).then()
    }, [workspace])

    const copyCodeSnippet = useCallback(() => {
        const code = codeGenerator.current.workspaceToCode(workspace)
        copy(code).then()
    }, [copy, workspace])

    const undo = useCallback(() => {
        workspace?.undo(false)
    }, [workspace])

    const redo = useCallback(() => {
        workspace?.undo(true)
    }, [workspace])

    const clearWorkspace = useCallback(() => {
        workspace?.clear()
    }, [workspace])

    return (
        <div className="h-12 flex items-center pl-4 pr-2 gap-3 max-w-full">
            {/* Dialogs */}
            <Dialog
                open={loadingSaveFileFailed}
                onOpenChange={setLoadingSaveFileFailed}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Failed to load</DialogTitle>
                        <DialogDescription>
                            The Design you have selected could not be loaded.
                            Either the file is corrupted, or it does not contain
                            a valid Design.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <Dialog open={aboutModalOpen} onOpenChange={setAboutModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>About</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div> FAIR DO Designer v{version}</div>

                        <div>
                            <div>
                                GitHub Repository:{" "}
                                <a
                                    className="underline"
                                    href="https://github.com/kit-data-manager/fair-do-designer"
                                >
                                    kit-data-manager/fair-do-designer
                                </a>
                            </div>
                            <div>
                                Contact us:{" "}
                                <a
                                    className="underline"
                                    href="mailto:support@datamanager.kit.edu"
                                >
                                    support@datamanager.kit.edu
                                </a>
                            </div>
                        </div>

                        <div>
                            <Link
                                href={"https://doi.org/10.5281/zenodo.17897665"}
                                target={"_blank"}
                                rel={"noopener noreferrer"}
                            >
                                <Image
                                    src={
                                        "https://zenodo.org/badge/DOI/10.5281/zenodo.17897665.svg"
                                    }
                                    height={20}
                                    width={190}
                                    alt={"10.5281/zenodo.17897666"}
                                />
                            </Link>
                        </div>

                        <div>
                            Copyright © {new Date().getFullYear()} Karlsruhe
                            Institute of Technology (KIT)
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Dialogs End */}
            <FrameIcon className="size-5 shrink-0" />
            <div className="font-bold text-nowrap">FAIR DO Designer</div>
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
                <div className="flex justify-center items-center mr-1">
                    <Tooltip delayDuration={700}>
                        <TooltipTrigger asChild>
                            <Button
                                size="menubar"
                                variant="ghost"
                                onClick={undo}
                            >
                                <UndoIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={700}>
                        <TooltipTrigger asChild>
                            <Button
                                size="menubar"
                                variant="ghost"
                                onClick={redo}
                            >
                                <RedoIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo</TooltipContent>
                    </Tooltip>
                </div>

                <MenubarMenu>
                    <MenubarTrigger>
                        Design
                        <ChevronDown
                            className={"size-4 ml-1 text-muted-foreground"}
                        />
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={triggerLoadFromDisk}>
                            Load Design
                        </MenubarItem>
                        <MenubarItem onClick={saveToDisk}>
                            Save Design
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={clearWorkspace}>
                            New empty Design
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
                        <MenubarItem onClick={copyCodeSnippet}>
                            Copy Generated Snippet
                        </MenubarItem>
                        <MenubarItem onClick={exportCode}>
                            Export Code
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>
                        Help
                        <ChevronDown
                            className={"size-4 ml-1 text-muted-foreground"}
                        />
                    </MenubarTrigger>
                    <MenubarContent>
                        <Link href={"/docs"} target={"_blank"}>
                            <MenubarItem>Documentation</MenubarItem>
                        </Link>
                        <Link href={"/docs/getting-started"} target={"_blank"}>
                            <MenubarItem>Getting Started</MenubarItem>
                        </Link>
                        <MenubarSeparator />
                        <Link
                            href={
                                "https://github.com/kit-data-manager/fair-do-designer/issues"
                            }
                            target={"_blank"}
                        >
                            <MenubarItem>Report a bug</MenubarItem>
                        </Link>
                        <MenubarItem onClick={() => setAboutModalOpen(true)}>
                            About
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>

            <div className="grow" />

            <ThemeToggle />

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
