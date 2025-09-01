import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"

export const attribute = {
    type: "attribute_key",
    tooltip: "asdf",
    helpUrl:
        "https://dtr-test.pidconsortium.net/#objects/21.T11148/b9b76f887845e32d29f7",
    message0: "%1 On failure %2 %3 %4 %5",
    args0: [
        {
            type: "field_label_serializable",
            text: "digitalObjectLocation",
            name: "name",
        },
        {
            type: "field_dropdown",
            name: "on_fail",
            options: [
                ["stop", "fail-stop"],
                ["continue silent", "fail-continue"],
                ["continue with warning", "fail-warn"],
            ],
        },
        {
            type: "input_value",
            name: "slot",
            check: "String",
        },
        {
            type: "field_input",
            name: "pid",
            text: "21.11152/a3f19b32-4550-40bb-9f69-b8ffd4f6d0ea",
        },
        {
            type: "input_dummy",
            name: "NAME",
        },
    ],
    previousStatement: ["attribute_key", "profile"],
    nextStatement: ["attribute_key", "profile"],
    colour: 230,
    inputsInline: false,
}

export const backlink_declaration = {
    init: function () {
        this.appendValueInput("ATTRIBUTE_KEY")
            .setCheck(["attribute_key", "String"])
            .appendField("Inverse reference to attribute")
        this.setOutput(true, "BackwardLinkFor")
        this.setTooltip(
            "Adds reverse references (backlinks) if another record links to this record using the given attribute key.",
        )
        this.setHelpUrl(
            addBasePath(
                "/docs/blocks/automatic-backlinks#inverse-reference-to-attribute",
            ),
        )
        this.setColour(120)
    },
} as Blockly.Block
