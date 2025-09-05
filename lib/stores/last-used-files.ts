import { create } from "zustand"

export interface LastUsedFile {
    name: string
    path?: string
    hash?: string
}

export interface LastUsedFilesStore {
    files: LastUsedFile[]
    setFiles(files: LastUsedFile[]): void
    appendToFiles(files: LastUsedFile[]): void
    clearFiles(): void
}

export const lastUsedFilesStore = create<LastUsedFilesStore>()((set) => ({
    files: [],
    setFiles(files: LastUsedFile[]) {
        set({ files })
    },
    appendToFiles(files: LastUsedFile[]) {
        set((state) => ({ files: [...state.files, ...files] }))
    },
    clearFiles() {
        set({ files: [] })
    },
}))
