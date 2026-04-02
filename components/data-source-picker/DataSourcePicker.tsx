import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"
import { Entry } from "@/components/data-source-picker/Entry"
import { Input } from "@/components/ui/input"
import { BlocksIcon, SearchIcon, SettingsIcon } from "lucide-react"
import { pathSegmentsToPointer } from "@/lib/data-source-picker/json-path"
import { saveToLocalStorage } from "@/lib/serialization"
import { useStore } from "zustand/react"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"
import {
    IUnifiedDocumentEntry,
    JSONValues,
} from "@/lib/data-source-picker/types"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDataSourcePickerSettings } from "@/lib/settings/data-source-picker-settings"
import { shortenPathsUnique } from "@/lib/data-source-picker/shorten-path"
import { InspectNonPrimitiveModal } from "@/components/data-source-picker/InspectNonPrimitiveModal"

export type DataSourcePickerRef = {
    addFile: (name: string, doc: JSONValues) => void
    reset: () => void
}

export const DataSourcePicker = forwardRef<
    DataSourcePickerRef,
    {
        onEntryClick?: (entry: IUnifiedDocumentEntry, label: string) => void
    }
>(function DataSourcePicker({ onEntryClick }, ref) {
    const {
        unifier: jsonUnifier,
        flat,
        updateFlat,
        totalDocumentCount,
    } = useStore(dataSourcePickerStore)
    const [search, setSearch] = useState("")
    const {
        showNonPrimitiveEntries,
        setShowNonPrimitiveEntries,
        setShowFullPath,
        showFullPath,
        showObjectEntries,
        setShowObjectEntries,
    } = useDataSourcePickerSettings()

    const [inspectNonPrimitiveModalOpen, setInspectNonPrimitiveModalOpen] =
        useState(false)
    const [inspectNonPrimitiveEntry, setInspectNonPrimitiveEntry] =
        useState<IUnifiedDocumentEntry>()

    const openInspectNonPrimitiveModal = useCallback(
        (entry: IUnifiedDocumentEntry) => {
            setInspectNonPrimitiveEntry(entry)
            setInspectNonPrimitiveModalOpen(true)
        },
        [],
    )

    const onlyShowLeaves = useMemo(() => {
        return (
            (showNonPrimitiveEntries === "auto" && search === "") ||
            showNonPrimitiveEntries === "never"
        )
    }, [search, showNonPrimitiveEntries])

    const addFile = useCallback(
        (name: string, doc: JSONValues) => {
            if (!jsonUnifier) throw "UnifiedContext not mounted"
            jsonUnifier.process(name, doc)
            updateFlat()
            saveToLocalStorage()
        },
        [jsonUnifier, updateFlat],
    )

    const reset = useCallback(() => {
        if (!jsonUnifier) throw "UnifiedContext not mounted"
        jsonUnifier.reset()
        updateFlat()
        saveToLocalStorage()
    }, [jsonUnifier, updateFlat])

    useImperativeHandle(ref, () => ({
        addFile,
        reset,
    }))

    const shortenedPaths = useMemo(() => {
        const pointers = flat.map((d) => d.path)
        const shortened = shortenPathsUnique(pointers)
        const zipped = pointers.map(
            (pointer, i) =>
                [pathSegmentsToPointer(pointer), shortened[i]] as [
                    string,
                    string,
                ],
        )
        return new Map(zipped)
    }, [flat])

    const withFullPointers = useMemo(() => {
        return flat.map((p) => ({
            fullPointer: pathSegmentsToPointer(p.path),
            entry: p,
        }))
    }, [flat])

    const filtered = useMemo(() => {
        return withFullPointers
            .filter((withFullPointer) =>
                onlyShowLeaves
                    ? withFullPointer.entry.isLeaf()
                    : showObjectEntries
                      ? true
                      : withFullPointer.entry.isArray() ||
                        withFullPointer.entry.isLeaf(),
            )
            .filter((withFullPointer) => withFullPointer.entry.key !== "$")
            .filter(
                (withFullPointer) =>
                    withFullPointer.entry.key.includes(search) ||
                    [...withFullPointer.entry.observedValues.keys()].some((e) =>
                        (e + "").includes(search),
                    ) ||
                    withFullPointer.fullPointer.includes(search),
            )
            .sort((a, b) => a.entry.key.localeCompare(b.entry.key))
            .sort(
                (a, b) =>
                    b.entry.timesObserved / totalDocumentCount -
                    a.entry.timesObserved / totalDocumentCount,
            )
    }, [
        onlyShowLeaves,
        search,
        showObjectEntries,
        totalDocumentCount,
        withFullPointers,
    ])

    const searchNoResults = useMemo(() => {
        return flat.length > 0 && filtered.length === 0
    }, [filtered.length, flat.length])

    const noData = useMemo(() => {
        return flat.length === 0
    }, [flat.length])

    return (
        <div>
            <InspectNonPrimitiveModal
                open={inspectNonPrimitiveModalOpen}
                entry={inspectNonPrimitiveEntry}
                onOpenChange={setInspectNonPrimitiveModalOpen}
                searchFor={setSearch}
                inspect={(entry) => setInspectNonPrimitiveEntry(entry)}
                addToDesign={(entry) =>
                    onEntryClick?.(
                        entry,
                        shortenedPaths.get(pathSegmentsToPointer(entry.path)) ??
                            pathSegmentsToPointer(entry.path),
                    )
                }
            />

            {!noData && (
                <div className="flex items-center mb-2 gap-2">
                    <div className="relative grow">
                        <SearchIcon className="absolute size-4 left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                            value={search}
                            className="pl-8"
                            placeholder="Search for keys or values..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size={"icon"} variant="outline">
                                <SettingsIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuCheckboxItem
                                checked={showFullPath}
                                onCheckedChange={(val) => setShowFullPath(val)}
                            >
                                Show full path
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <BlocksIcon className="size-4 shrink-0" />
                                    Show non-primitive entries
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuCheckboxItem
                                        checked={
                                            showNonPrimitiveEntries === "always"
                                        }
                                        onCheckedChange={(v) =>
                                            v &&
                                            setShowNonPrimitiveEntries("always")
                                        }
                                    >
                                        Always
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={
                                            showNonPrimitiveEntries === "auto"
                                        }
                                        onCheckedChange={(v) =>
                                            v &&
                                            setShowNonPrimitiveEntries("auto")
                                        }
                                    >
                                        Show on Search
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={
                                            showNonPrimitiveEntries === "never"
                                        }
                                        onCheckedChange={(v) =>
                                            v &&
                                            setShowNonPrimitiveEntries("never")
                                        }
                                    >
                                        Never
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuSubContent>
                                <DropdownMenuCheckboxItem
                                    checked={showObjectEntries}
                                    onCheckedChange={setShowObjectEntries}
                                >
                                    Show Object entries
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="grid grid-cols-[max(55%)_1fr]">
                {noData && (
                    <div className="col-span-2 flex justify-center text-muted-foreground p-4">
                        Upload files or add example files to show values here
                    </div>
                )}
                {searchNoResults && (
                    <div className="col-span-2 flex justify-center text-muted-foreground p-4">
                        No Results
                    </div>
                )}
                {filtered.map((withFullPointer, i) => (
                    <Entry
                        entry={withFullPointer.entry}
                        key={i}
                        totalDocuments={totalDocumentCount}
                        onEntryClick={onEntryClick}
                        shortened={
                            shortenedPaths.get(
                                pathSegmentsToPointer(
                                    withFullPointer.entry.path,
                                ),
                            ) ??
                            pathSegmentsToPointer(withFullPointer.entry.path)
                        }
                        showShortened={!showFullPath}
                        showInspectModal={() =>
                            openInspectNonPrimitiveModal(withFullPointer.entry)
                        }
                    />
                ))}
            </div>
        </div>
    )
})
