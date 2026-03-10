import { create } from "zustand"

export interface DataSourcePickerSettings {
    showFullPath: boolean
    showNonPrimitiveEntries: "auto" | "always" | "never"
    setShowFullPath: (showFullPath: boolean) => void
    setShowNonPrimitiveEntries: (
        showNonPrimitiveEntries: "auto" | "always" | "never",
    ) => void
}

export const useDataSourcePickerSettings = create<DataSourcePickerSettings>()(
    (set) => ({
        showFullPath: false,
        showNonPrimitiveEntries: "auto",
        setShowFullPath: (showFullPath: boolean) => set({ showFullPath }),
        setShowNonPrimitiveEntries: (
            showNonPrimitiveEntries: "auto" | "always" | "never",
        ) => set({ showNonPrimitiveEntries }),
    }),
)
