import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react"
import {
    DocumentEntry,
    JSONValues,
    Unifier,
} from "@/lib/data-source-picker/json-unifier"
import { Entry } from "@/components/data-source-picker/Entry"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export type DataSourcePickerRef = {
    addFile: (doc: JSONValues) => void
    reset: () => void
}

export const DataSourcePicker = forwardRef<
    DataSourcePickerRef,
    { onEntryClick?: (entry: DocumentEntry) => void }
>(function DataSourcePicker({ onEntryClick }, ref) {
    const jsonUnifier = useRef(new Unifier())
    const [flat, setFlat] = useState<DocumentEntry[]>([])
    const [search, setSearch] = useState("")
    const [totalDocuments, setTotalDocuments] = useState(0)

    const addFile = useCallback((doc: JSONValues) => {
        jsonUnifier.current.process(doc)
        setFlat(jsonUnifier.current.getFlattenedDocument())
        setTotalDocuments(
            jsonUnifier.current.getUnifiedDocument().timesObserved,
        )
    }, [])

    const reset = useCallback(() => {
        jsonUnifier.current.reset()
        setFlat([])
        setTotalDocuments(0)
    }, [])

    useImperativeHandle(ref, () => ({
        addFile,
        reset,
    }))

    const filtered = useMemo(() => {
        return flat
            .filter(
                (doc) =>
                    doc.key.includes(search) ||
                    [...doc.observedValues.keys()].some((e) =>
                        (e + "").includes(search),
                    ),
            )
            .sort((a, b) => a.key.localeCompare(b.key))
            .sort(
                (a, b) =>
                    b.timesObserved / totalDocuments -
                    a.timesObserved / totalDocuments,
            )
    }, [flat, search, totalDocuments])

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
                        totalDocuments={totalDocuments}
                        onEntryClick={onEntryClick}
                    />
                ))}
            </div>
        </div>
    )
})
