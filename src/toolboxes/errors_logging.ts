import { WorkspaceSvg } from "blockly"

export function registerErrorsToolbox(workspace: WorkspaceSvg) {
    workspace.registerToolboxCategoryCallback("ERRORS", (workspace) => {
        return [
            {
                kind: "block",
                type: "stop_design",
                inputs: {
                    MESSAGE: {
                        shadow: {
                            type: "text",
                            fields: {
                                TEXT: "Something went wrong!",
                            },
                        },
                    },
                },
            },
        ]
    })
}
