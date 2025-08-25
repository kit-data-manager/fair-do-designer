import { WorkspaceSvg } from "blockly"
import { create } from "zustand"

interface WorkspaceStore {
    designName: string
    setDesignName: (name: string) => void
    workspace: WorkspaceSvg | undefined
    setWorkspace: (workspace: WorkspaceSvg) => void
    unsetWorkspace: () => void
}

export const workspaceStore = create<WorkspaceStore>()((set) => ({
    designName: "Unnamed Design",
    setDesignName(name: string) {
        set({ designName: name })
    },
    workspace: undefined,
    setWorkspace(workspace: WorkspaceSvg) {
        set({ workspace })
    },
    unsetWorkspace() {
        set({ workspace: undefined })
    },
}))
