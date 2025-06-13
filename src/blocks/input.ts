import * as Blockly from "blockly"
import { FieldTextInput } from "blockly"
import { FieldButton } from "../fields/FieldButton"

export const input_json = {
    type: "input_json",
    tooltip: "",
    helpUrl: "",
    message0: "%1 %2 read %3",
    args0: [
        {
            type: "field_label_serializable",
            text: "From",
            name: "label",
        },
        {
            type: "field_input",
            name: "INPUT",
            text: "A",
        },
        {
            type: "input_value",
            name: "KEY",
            check: "String",
        },
    ],
    output: null, //"JSON",
    colour: 225,
    inputsInline: true,
}

export const input_read_object = {
    type: "input_read_object",
    tooltip: "",
    helpUrl: "",
    message0: "From %1 read %2 %3",
    args0: [
        {
            type: "input_value",
            name: "OBJ",
            check: "JSON",
        },
        {
            type: "input_dummy",
            name: "label",
        },
        {
            type: "input_value",
            name: "KEY",
            check: "String",
        },
    ],
    colour: 225,
    output: null,
    inputsInline: true,
}

export const input_read_key = {
    type: "input_read_key",
    tooltip: "",
    helpUrl: "",
    message0: "Read key %1 %2",
    args0: [
        {
            type: "field_input",
            name: "KEY",
            text: "key",
        },
        {
            type: "input_value",
            name: "INPUT",
            check: "JSON",
        },
    ],
    output: null, //"JSON",
    colour: 0,
    inputsInline: false,
}

export const input_read_index = {
    type: "input_read_index",
    tooltip: "",
    helpUrl: "",
    message0: "Read index %1 %2",
    args0: [
        {
            type: "field_input",
            name: "KEY",
            text: "0",
        },
        {
            type: "input_value",
            name: "INPUT",
            check: "JSON",
        },
    ],
    output: null, //"JSON",
    colour: 0,
    inputsInline: false,
}

export const input_source = {
    type: "input_source",
    tooltip: "",
    helpUrl: "",
    message0: "%1 %2 %3",
    args0: [
        {
            type: "field_label_serializable",
            text: "Source",
            name: "NAME",
        },
        {
            type: "field_dropdown",
            name: "SOURCE",
            options: [
                ["A", "A"],
                ["JSON", "JSON"],
            ],
        },
        {
            type: "input_end_row",
            name: "NAME",
        },
    ],
    output: null, //"JSON",
    colour: 225,
}

export const input_jsonpath = {
    init: function () {
        this.appendDummyInput()
            .appendField("Data Query")
            .appendField(new FieldTextInput(), "QUERY")
            .appendField(new FieldButton("Ändern", () => alert("click")))
        this.setTooltip("A block with an interactive button.")
        this.setHelpUrl("")
        this.setOutput(true, null)
        this.setColour(230)
    },

    onchange: function (abstract) {
        if ("blockId" in abstract && abstract.blockId === this.id) {
            console.log("Change event", abstract)
        }
    },
} as Blockly.Block
