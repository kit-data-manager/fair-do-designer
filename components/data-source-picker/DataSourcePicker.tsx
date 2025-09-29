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
import { ValueRenderer } from "@/components/data-source-picker/ValueRenderer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
                    <div className="contents group" key={i}>
                        <div
                            className="text-chart-3 p-1 group-hover:bg-muted/50 flex justify-between truncate"
                            draggable
                        >
                            <Button
                                variant="ghost"
                                className="shrink-0 p-0 text-muted-foreground h-5.5"
                            >
                                <ArrowLeft />
                            </Button>
                            <div className="truncate">{entry.key}</div>
                        </div>
                        <ValueRenderer values={entry.observedValues} />
                    </div>
                ))}
            </div>
        )
    },
)
