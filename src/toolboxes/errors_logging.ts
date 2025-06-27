import { WorkspaceSvg } from "blockly"
import { BlockInfo } from "blockly/core/utils/toolbox"

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
            {
                kind: "block",
                type: "log_value",
                inputs: {
                    DESC: {
                        shadow: {
                            type: "text",
                            fields: {
                                TEXT: "Variable in Situation X",
                            },
                        },
                    },
                    REASON: {
                        shadow: {
                            type: "text",
                            fields: {
                                TEXT: "debugging",
                            },
                        },
                    },
                },
            },
            {
                kind: "block",
                type: "logic_ternary",
                inputs: {
                    IF: {
                        shadow: {
                            type: "logic_boolean",
                            fields: {
                                BOOLEAN: true,
                            },
                        },
                    },
                    THEN: {
                        shadow: {
                            type: "text",
                            fields: {
                                TEXT: "My value",
                            },
                        },
                    },
                    ELSE: {
                        shadow: {
                            type: "log_value",
                            fields: {
                                DESC: {
                                    shadow: {
                                        type: "text",
                                        fields: {
                                            TEXT: "Variable in Situation X",
                                        },
                                    },
                                },
                                REASON: {
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
