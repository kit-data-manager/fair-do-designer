import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"

export const pidrecord = {
    init: function () {
        this.appendValueInput("local-id")
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField("Create PID Record with ID:")
        this.appendStatementInput("record")
            .setCheck(["profile", "attribute_key"])
        this.setInputsInline(false)
        this.setTooltip(
            "Defines a PID record, which holds a set of attributes and profiles.",
        )
        this.setHelpUrl(addBasePath("/docs/blocks/records"))
        this.setColour(300)
    },
} as Blockly.Block

export const pidrecord_skipable = {
    init: function () {
        this.appendValueInput("local-id")
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField("Create PID Record with ID:")
        this.appendValueInput("skip-condition")
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField("Skip if:")
        this.appendStatementInput("record")
            .setCheck(["profile", "attribute_key"])
        this.setInputsInline(false)
        this.setTooltip(
            "Defines a PID record, which holds a set of attributes and profiles. It can be skipped based on a condition.",
        )
        this.setHelpUrl(addBasePath("/docs/blocks/records"))
        this.setColour(300)
    },
} as Blockly.Block
