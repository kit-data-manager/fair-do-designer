import { WorkspaceSvg } from "blockly";

export function registerInputToolbox(workspace: WorkspaceSvg) {
    workspace.registerToolboxCategoryCallback("INPUT", workspace => {
        return [
            {
                kind: "block",
                type: "input_json",
                fields: {
                    "INPUT": "A"
                },
                inputs: {
                    "KEY": {
                        shadow: {
                            type: "text",
                            fields: {
                                "TEXT": "Test"
                            }
                        }
                    }
                }
            },
            {
                kind: "block",
                type: "input_read_object",
                inputs: {
                    "KEY": {
                        shadow: {
                            type: "text",
                            fields: {
                                "TEXT": "Test"
                            }
                        }
                    }
                }
            },
            {
                kind: "block",
                type: "transform_string",
            },
            {
                kind: "block",
                type: "input_jsonpath",
            },
            {
                kind: "block",
                type: "input_read_key",
            },
            {
                kind: "block",
                type: "input_source",
            }
        ]
    })
}

