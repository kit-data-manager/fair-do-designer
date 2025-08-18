import { ChevronDown, FrameIcon, SquarePenIcon } from "lucide-react"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { useCallback, useEffect, useState } from "react"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { Input } from "@/components/ui/input"

export function Header() {
    const designName = useStore(workspaceStore, (s) => s.designName)
    const setDesignName = useStore(workspaceStore, (s) => s.setDesignName)

    const [nameInputValue, setNameInputValue] = useState(designName)
    const [editName, setEditName] = useState(false)

    const confirmNameChange = useCallback(() => {
        setDesignName(nameInputValue)
        setEditName(false)
    }, [nameInputValue, setDesignName])

    useEffect(() => {
        setNameInputValue(designName)
    }, [designName])

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
                        <MenubarItem>Load Design</MenubarItem>
                        <MenubarItem>Save Design</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    )
}
