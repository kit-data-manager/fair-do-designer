import { IUnifiedDocumentEntry } from "@/lib/data-source-picker/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useStore } from "zustand/react"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"
import { useCallback, useEffect, useState } from "react"
import {
    ArrowLeft,
    FileIcon,
    ListIcon,
    ListTreeIcon,
    SearchIcon,
} from "lucide-react"
import { pathSegmentsToPointer } from "@/lib/data-source-picker/json-path"
import { AvailabilityScale } from "@/components/data-source-picker/AvailabilityScale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function InspectNonPrimitiveModal({
    entry,
    open,
    onOpenChange,
    searchFor,
    inspect,
    addToDesign,
}: {
    entry?: IUnifiedDocumentEntry
    open: boolean
    onOpenChange: (open: boolean) => void
    searchFor: (searchTerm: string) => void
    inspect: (entry: IUnifiedDocumentEntry) => void
    addToDesign: (entry: IUnifiedDocumentEntry) => void
}) {
    const unifier = useStore(dataSourcePickerStore, (s) => s.unifier)
    const totalDocumentCount = useStore(
        dataSourcePickerStore,
        (s) => s.totalDocumentCount,
    )

    const getContent = useCallback(() => {
        if (!entry) return []
        return unifier.executeQuery(entry.path)
    }, [entry, unifier])

    const [content, setContent] = useState(() => getContent())

    const reloadContent = useCallback(() => {
        setContent(getContent())
    }, [getContent])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        reloadContent()
    }, [reloadContent])

    useEffect(() => {
        const unsubscribe = dataSourcePickerStore.subscribe(() => {
            reloadContent()
        })

        return () => unsubscribe()
    }, [reloadContent])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px]! w-[800px]!">
                <DialogHeader>
                    <DialogTitle>Inspect Entry</DialogTitle>
                    <DialogDescription>
                        This modal shows the contents of the selected entry over
                        the provided files as well as all child entries.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div className="text-sm text-muted-foreground font-medium">
                        Inspecting {entry?.isArray() ? "Array" : "Object"}:
                    </div>
                    {entry && (
                        <div className={"flex items-center gap-2"}>
                            <Tooltip delayDuration={700}>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            onOpenChange(false)
                                            addToDesign(entry)
                                        }}
                                        variant="ghost"
                                        size="mini-inline"
                                        className="text-muted-foreground"
                                    >
                                        <ArrowLeft />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add to Design</TooltipContent>
                            </Tooltip>
                            <AvailabilityScale
                                total={entry.timesObserved}
                                current={entry.timesObserved}
                            />
                            {entry.arrayElement ? `[${entry.key}]` : entry.key}
                            <Button
                                variant="ghost"
                                size="mini-inline"
                                onClick={() => {
                                    onOpenChange(false)
                                    searchFor(pathSegmentsToPointer(entry.path))
                                }}
                            >
                                <SearchIcon className="size-3.5 shrink-0" />
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs defaultValue={"document"} className="max-w-full min-w-0">
                    <TabsList className="w-full pr-2">
                        <TabsTrigger value={"document"}>
                            <ListIcon /> Values
                        </TabsTrigger>
                        <TabsTrigger value={"key"}>
                            <ListTreeIcon /> Child Entries
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value={"document"}
                        className="max-w-full min-w-0"
                    >
                        <div className="max-h-[60vh] overflow-auto max-w-full space-y-3 pr-2">
                            <div className="text-muted-foreground text-sm">
                                This entry was found in{" "}
                                {entry?.timesObserved ?? 0} of{" "}
                                {totalDocumentCount} documents.
                            </div>
                            {content.map(([documentName, content]) => (
                                <div
                                    key={documentName}
                                    className={"border rounded-lg"}
                                >
                                    <div className="p-2 border-b flex items-center gap-2">
                                        <FileIcon className="size-4 shrink-0" />
                                        {documentName}
                                    </div>
                                    <pre className="p-2">
                                        {JSON.stringify(
                                            content.length === 1
                                                ? content[0]
                                                : content,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value={"key"}>
                        <div className="max-h-[60vh] overflow-auto space-y-1 pr-2">
                            <div className="text-muted-foreground text-sm">
                                This entry has {entry?.children.length ?? 0}{" "}
                                child entries and{" "}
                                {entry?.observedValues.size ?? 0} primitive
                                values. The shown availabilities are relative to
                                the availability of the non-primitive entry
                                under inspection.
                            </div>
                            {entry &&
                                entry.children
                                    .sort(
                                        (a, b) =>
                                            b.timesObserved - a.timesObserved,
                                    )
                                    .map((child) => (
                                        <div
                                            key={child.key}
                                            className={
                                                "flex items-center gap-2"
                                            }
                                        >
                                            <Tooltip delayDuration={700}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={() => {
                                                            onOpenChange(false)
                                                            addToDesign(child)
                                                        }}
                                                        variant="ghost"
                                                        size="mini-inline"
                                                        className="text-muted-foreground"
                                                    >
                                                        <ArrowLeft />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Add to Design
                                                </TooltipContent>
                                            </Tooltip>
                                            <AvailabilityScale
                                                total={entry.timesObserved}
                                                current={child.timesObserved}
                                            />
                                            {child.arrayElement
                                                ? `[${child.key}]`
                                                : child.key}
                                            <ValueRenderer
                                                values={child.observedValues}
                                                unifiedDocumentEntry={child}
                                                timesObserved={
                                                    child.timesObserved
                                                }
                                                showInspectModal={() =>
                                                    inspect(child)
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="mini-inline"
                                                onClick={() => {
                                                    onOpenChange(false)
                                                    searchFor(
                                                        pathSegmentsToPointer(
                                                            child.path,
                                                        ),
                                                    )
                                                }}
                                            >
                                                <SearchIcon className="size-3.5 shrink-0" />
                                            </Button>
                                        </div>
                                    ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
