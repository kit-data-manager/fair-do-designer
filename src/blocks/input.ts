import * as Blockly from "blockly/core";

export const input_json = {
    type: "input_json",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2 read %3",
    "args0": [
        {
            "type": "field_label_serializable",
            "text": "From",
            "name": "label"
        },
        {
            "type": "field_input",
            "name": "INPUT",
            "text": "A"
        },
        {
            "type": "input_value",
            "name": "KEY",
            check: "String"
        }
    ],
    "output": "JSON",
    "colour": 225,
    "inputsInline": true
};

export const input_read_object = {
    "type": "input_read_object",
    "tooltip": "",
    "helpUrl": "",
    "message0": "From %1 read %2 %3",
    "args0": [
        {
            "type": "input_value",
            "name": "OBJ",
            "check": "JSON"
        },
        {
            "type": "input_dummy",
            "name": "label"
        },
        {
            "type": "input_value",
            "name": "KEY",
            "check": "String"
        }
    ],
    "colour": 225,
    output: null,
    "inputsInline": true
}

