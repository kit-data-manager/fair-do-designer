import { WorkspaceSvg } from "blockly"
import { create } from "zustand"

interface WorkspaceStore {
    designName: string
    setDesignName: (name: string) => void
    codeGenerator: "javascript" | "python"
    setCodeGenerator: (generator: "javascript" | "python") => void
    workspace: WorkspaceSvg | undefined
    setWorkspace: (workspace: WorkspaceSvg) => void
    unsetWorkspace: () => void
}

export const workspaceStore = create<WorkspaceStore>()((set) => ({
    designName: "Unnamed Design",
    setDesignName(name: string) {
        set({ designName: name })
    },
    codeGenerator: "python",
    setCodeGenerator(generator: "javascript" | "python") {
        set({ codeGenerator: generator })
    },
    workspace: undefined,
    setWorkspace(workspace: WorkspaceSvg) {
        set({ workspace })
    },
    unsetWorkspace() {
        set({ workspace: undefined })
    },
}))
