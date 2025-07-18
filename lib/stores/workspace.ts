import { WorkspaceSvg } from "blockly"
import { create } from "zustand"

interface WorkspaceStore {
    workspace: WorkspaceSvg | undefined
    setWorkspace: (workspace: WorkspaceSvg) => void
    unsetWorkspace: () => void
}

export const workspaceStore = create<WorkspaceStore>()((set) => ({
    workspace: undefined,
    setWorkspace(workspace: WorkspaceSvg) {
        set({ workspace })
    },
    unsetWorkspace() {
        set({ workspace: undefined })
    },
}))
