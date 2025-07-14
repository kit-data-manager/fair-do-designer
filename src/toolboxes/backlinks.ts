import { WorkspaceSvg } from "blockly"
import { BlockInfo } from "blockly/core/utils/toolbox"

export function register(workspace: WorkspaceSvg) {
    workspace.registerToolboxCategoryCallback("BACKLINKS", (workspace) => {
        return [
            {
                kind: "block",
                type: "backlink_declaration",
            },
        ] as BlockInfo[]
    })
}
