import * as Blockly from "blockly/core"
import { FieldIcon } from "@/lib/fields/FieldIcon"
import { MessageCircleIcon, OctagonMinusIcon } from "@/lib/icons"
import { addBasePath } from "next/dist/client/add-base-path"

export const stop_design = {
    init: function () {
        this.appendValueInput("MESSAGE")
            .appendField(new FieldIcon(OctagonMinusIcon, () => {}))
            .appendField("Stop with error")
        this.setInputsInline(false)
        this.setOutput(true, null)
        this.setTooltip(
            "Throws an error and stops the execution of the design. No PID will be created. Use for irreparable situations which you do not expect to happen.",
        )
        this.setHelpUrl(
            addBasePath("/docs/blocks/checks-and-errors#stop-with-error"),
        )
        this.setColour(360)
    },
} as Blockly.Block

export const log_value = {
    init: function () {
        this.appendValueInput("INVAR")
            .setCheck(null)
            .appendField(new FieldIcon(MessageCircleIcon, () => {}))
            .appendField("Print")
            .appendField(new Blockly.FieldTextInput("Description"), "DESC")
        this.setOutput(true, null)
        this.setTooltip(
            "Print given information and continue. Continues in any case (no cancellation)!",
        )
        this.setHelpUrl(addBasePath("/docs/blocks/checks-and-errors#print"))
        this.setColour(160)
    },
} as Blockly.Block

export const otherwise = {
    init: function () {
        this.appendValueInput("VALUE")
        this.appendDummyInput("LABEL").appendField("otherwise")
        this.appendValueInput("OTHER")
        this.setInputsInline(true)
        this.setOutput(true, null)
        this.setTooltip(
            "Test if a value has an empty-ish value. If so, return a given alternative. If not, return the value itself. This is useful to provide a default value in case the value is not set or empty.",
        )
        this.setHelpUrl(addBasePath("/docs/blocks/checks-and-errors#otherwise"))
        this.setColour(210)
    },
} as Blockly.Block
