import * as Blockly from "blockly"
import { FieldButton } from "../fields/FieldButton"
import { FieldLabel } from "blockly"

export interface InputJsonPath extends Blockly.BlockSvg {
    findQueryProperty(): void
    updateQuery(query: string): void
}

/* @ts-expect-error Object can't be cast to class */
export const input_jsonpath: InputJsonPath = {
    init: function () {
        const hiddenQueryField = new FieldLabel("JSON")
        hiddenQueryField.setVisible(false)

        this.appendDummyInput()
            .appendField("Read")
            .appendField("JSON", "DISPLAY_QUERY")
            .appendField(
                new FieldButton("🔍", this.findQueryProperty.bind(this)),
            )
            .appendField(hiddenQueryField, "QUERY")
        this.setTooltip("Read data from input")
        this.setHelpUrl("")
        this.setOutput(true, null)
        this.setColour(230)
    },

    findQueryProperty() {
        const query = this.getField("QUERY")?.getValue()
        if (!query || typeof query !== "string") return
        const unified = document.querySelector("unified-document")
        unified?.setFocusedPath(query)
    },

    updateQuery: function (query: string) {
        const display = query.split(".")[query.split(".").length - 1]
        this.setFieldValue(display, "DISPLAY_QUERY")
        this.setFieldValue(query, "QUERY")
        this.getField("QUERY")?.setVisible(false)
        this.getField("DISPLAY_QUERY")?.setTooltip(query)
    },

    saveExtraState: function () {
        return this.getField("QUERY")?.getValue()
    },

    loadExtraState: function (query: unknown) {
        if (typeof query !== "string") {
            console.error("input_jsonpath extra state is not a string")
            return
        }

        this.updateQuery(query)
    },
}

/* @ts-expect-error Object can't be cast to class */
export const input_custom_json: Blockly.BlockSvg = {
    init: function () {
        this.appendValueInput("QUERY")
            .setCheck("String")
            .appendField(
                new Blockly.FieldLabelSerializable("JSON Query"),
                "NAME",
            )
        this.setInputsInline(true)
        this.setOutput(true, "JSON")
        this.setTooltip("")
        this.setHelpUrl("")
        this.setColour(315)
    },
}
