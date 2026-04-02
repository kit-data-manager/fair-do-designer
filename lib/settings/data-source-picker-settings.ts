import { create } from "zustand"

export interface DataSourcePickerSettings {
    showFullPath: boolean
    showNonPrimitiveEntries: "auto" | "always" | "never"
    showObjectEntries: boolean
    setShowFullPath: (showFullPath: boolean) => void
    setShowNonPrimitiveEntries: (
        showNonPrimitiveEntries: "auto" | "always" | "never",
    ) => void
    setShowObjectEntries: (showObjectEntries: boolean) => void
}

export const useDataSourcePickerSettings = create<DataSourcePickerSettings>()(
    (set) => ({
        showFullPath: false,
        showNonPrimitiveEntries: "auto",
        showObjectEntries: false,
        setShowFullPath: (showFullPath: boolean) => set({ showFullPath }),
        setShowNonPrimitiveEntries: (
            showNonPrimitiveEntries: "auto" | "always" | "never",
        ) => set({ showNonPrimitiveEntries }),
        setShowObjectEntries: (showObjectEntries: boolean) =>
            set({ showObjectEntries }),
    }),
)
