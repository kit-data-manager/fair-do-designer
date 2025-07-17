import { WorkspaceSvg } from "blockly"
import { BlockInfo } from "@/node_modules/blockly/core/utils/toolbox"

export function register(workspace: WorkspaceSvg) {
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
            {
                kind: "block",
                type: "log_value",
            },
            {
                kind: "block",
                type: "otherwise",
                inputs: {
                    OTHER: {
                        shadow: {
                            type: "stop_design",
                            fields: {
                                MESSAGE: {
                                    shadow: {
                                        type: "text",
                                        fields: {
                                            TEXT: "WARNING: ???",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ] as BlockInfo[]
    })
}
