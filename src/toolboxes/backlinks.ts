import { WorkspaceSvg } from "blockly"
import { BlockInfo } from "blockly/core/utils/toolbox"

export function register(workspace: WorkspaceSvg) {
    workspace.registerToolboxCategoryCallback("BACKLINKS", (workspace) => {
        return [
            {
                kind: "block",
                type: "backlink_declaration",
            },
            {
                kind: "block",
                type: "profile_hmc_reference_block",
            },
        ] as BlockInfo[]
    })
}
