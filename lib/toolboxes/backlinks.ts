import { WorkspaceSvg } from "blockly"
// @ts-expect-error Typings not exported from package.json but working anyway
import type { BlockInfo } from "blockly/core/utils/toolbox"

export function register(workspace: WorkspaceSvg) {
    workspace.registerToolboxCategoryCallback("BACKLINKS", () => {
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
