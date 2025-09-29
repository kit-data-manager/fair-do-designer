import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from "react"
import {
    DocumentEntry,
    JSONValues,
    Unifier,
} from "@/lib/data-source-picker/json-unifier"
import { Entry } from "@/components/data-source-picker/Entry"

export type DataSourcePickerRef = {
    addFile: (doc: JSONValues) => void
}

export const DataSourcePicker = forwardRef<DataSourcePickerRef>(
    function DataSourcePicker(_, ref) {
        const jsonUnifier = useRef(new Unifier())
        const [flat, setFlat] = useState<DocumentEntry[]>([])

        const addFile = useCallback((doc: JSONValues) => {
            jsonUnifier.current.process(doc)
            setFlat(jsonUnifier.current.getFlattenedDocument())
        }, [])

        useImperativeHandle(ref, () => ({
            addFile,
        }))

        return (
            <div className="grid grid-cols-[max(50%)_1fr]">
                {flat.map((entry, i) => (
                    <Entry entry={entry} key={i} />
                ))}
            </div>
        )
    },
)
