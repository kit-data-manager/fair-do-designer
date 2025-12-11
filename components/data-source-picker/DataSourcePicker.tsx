import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"
import {
    DocumentEntry,
    JSONValues,
} from "@/lib/data-source-picker/json-unifier"
import { Entry } from "@/components/data-source-picker/Entry"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import {
    PathSegment,
    pathSegmentsToPointer,
} from "@/lib/data-source-picker/json-path"
import { saveToLocalStorage } from "@/lib/serialization"
import { useStore } from "zustand/react"
import { dataSourcePickerStore } from "@/lib/stores/data-source-picker-store"

export type DataSourcePickerRef = {
    addFile: (name: string, doc: JSONValues) => void
    reset: () => void
}

export const DataSourcePicker = forwardRef<
    DataSourcePickerRef,
    { onEntryClick?: (entry: DocumentEntry) => void }
>(function DataSourcePicker({ onEntryClick }, ref) {
    const {
        unifier: jsonUnifier,
        flat,
        updateFlat,
        totalDocumentCount,
    } = useStore(dataSourcePickerStore)
    const [search, setSearch] = useState("")

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
            ...p,
        }))
    }, [flat])

    const filtered = useMemo(() => {
        return withFullPointers
            .filter(
                (doc) =>
                    doc.key.includes(search) ||
                    [...doc.observedValues.keys()].some((e) =>
                        (e + "").includes(search),
                    ) ||
                    doc.fullPointer.includes(search),
            )
            .sort((a, b) => a.key.localeCompare(b.key))
            .sort(
                (a, b) =>
                    b.timesObserved / totalDocumentCount -
                    a.timesObserved / totalDocumentCount,
            )
    }, [search, totalDocumentCount, withFullPointers])

    const searchNoResults = useMemo(() => {
        return flat.length > 0 && filtered.length === 0
    }, [filtered.length, flat.length])

    const noData = useMemo(() => {
        return flat.length === 0
    }, [flat.length])

    return (
        <div>
            {!noData && (
                <div className="relative">
                    <SearchIcon className="absolute size-4 left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        value={search}
                        className="pl-8 mb-2"
                        placeholder="Search for keys or values..."
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                {filtered.map((entry, i) => (
                    <Entry
                        entry={entry}
                        key={i}
                        totalDocuments={totalDocumentCount}
                        onEntryClick={onEntryClick}
                        shortened={
                            shortenedPaths.get(
                                pathSegmentsToPointer(entry.path),
                            ) ?? pathSegmentsToPointer(entry.path)
                        }
                    />
                ))}
            </div>
        </div>
    )
})

/**
 * From an array of paths, returns the shortest unique partial pointers.
 * @param paths Array of paths to shorten. Each path is an array of path segments.
 * @returns Array of shortest unique partial pointers.
 */
function shortenPathsUnique(paths: PathSegment[][]) {
    const base = paths.map((p) => ({
        path: p,
        length: 1,
        fullPointer: pathSegmentsToPointer(p),
    }))
    let nextIteration = base.slice()

    while (nextIteration.length > 0) {
        const { conflicted, mapping } = findConflicted(nextIteration)
        const promoteToNextIteration = []

        for (const candidate of nextIteration) {
            const partialPointer = mapping.get(candidate.fullPointer)!
            if (conflicted.has(partialPointer)) {
                candidate.length += 1
                promoteToNextIteration.push(candidate)
            }
        }

        nextIteration = promoteToNextIteration.slice()
    }

    return base.map(getPartialPointer)
}

/**
 * Generates a partial pointer string from the provided part object. The partial pointer is constructed from the specified number of path segments, starting from the back of the path.
 *
 * @param {Object} part An object containing information to generate the partial pointer.
 * @param {PathSegment[]} part.path The array of path segments used to construct the pointer.
 * @param {number} part.length The number of segments from the start that will be included in the resulting partial pointer.
 * @return A partial pointer string constructed from the specified number of path segments, formatted for prettier output.
 */
function getPartialPointer(part: { path: PathSegment[]; length: number }) {
    return (
        part.path
            .slice()
            // Rename root segment from "$" to "" to make prettier partial pointer
            // e.g. "/title" instead of "$/title"
            .map((v, i) => (i === 0 ? { ...v, value: "" } : (v as PathSegment)))
            .reverse()
            .slice(0, part.length)
            .reverse()
            .map((p) => p.value)
            .join("/")
    )
}

/**
 * From an array of paths, find all paths that have the same partial pointer. The `length` is the current length of the paths partial pointer (from the back)
 * @param parts Array of paths to find conflicts in. Each part has the path, the current length of the partial path, as well as the full pointer (this is a performance optimization, the full pointer can always be calculated from the path)
 */
function findConflicted(
    parts: { path: PathSegment[]; length: number; fullPointer: string }[],
) {
    // Partial pointers are added here the first time they are encountered
    const firstPass = new Set<string>()
    // Partial pointers are added here if they were encountered twice (conflict)
    const secondPass = new Set<string>()
    // Mapping from full pointer to partial pointer, to recover the full pointers from the list of conflicting partial pointers
    // In case of a conflict, multiple unique full pointers map to the same partial pointer
    const mapping = new Map<string, string>()

    for (const part of parts) {
        const partialPointer = getPartialPointer(part)
        mapping.set(part.fullPointer, partialPointer)

        if (firstPass.has(partialPointer)) {
            secondPass.add(partialPointer)
        } else {
            firstPass.add(partialPointer)
        }
    }

    return { conflicted: secondPass, mapping }
}
