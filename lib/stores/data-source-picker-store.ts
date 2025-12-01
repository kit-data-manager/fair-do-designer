import { DocumentEntry, Unifier } from "@/lib/data-source-picker/json-unifier"
import { create } from "zustand"

interface DataSourcePickerStore {
    unifier: Unifier
    flat: DocumentEntry[]
    updateFlat: () => void
    totalDocumentCount: number
}

export const dataSourcePickerStore = create<DataSourcePickerStore>()(
    (set, get) => ({
        unifier: new Unifier(),
        flat: [],
        totalDocumentCount: 0,
        updateFlat: () => {
            const { unifier } = get()
            set({
                flat: unifier.getFlattenedDocument(),
                totalDocumentCount: unifier.getUnifiedDocument().timesObserved,
            })
        },
    }),
)
