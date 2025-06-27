import * as Blockly from "blockly"
import { FieldButton } from "../fields/FieldButton"
import { FieldLabel } from "blockly"

export interface InputJsonPath extends Blockly.BlockSvg {
    updateQuery(query: string): void
}

/* @ts-ignore */
export const input_jsonpath: InputJsonPath = {
    init: function () {
        const hiddenQueryField = new FieldLabel("JSON")
        hiddenQueryField.setVisible(false)

        this.appendDummyInput()
            .appendField("👁️")
            .appendField("JSON", "DISPLAY_QUERY")
            .appendField(new FieldButton("⚙️", () => alert("click")))
            .appendField(new FieldButton("🔍", () => alert("click")))
            .appendField(hiddenQueryField, "QUERY")
        this.setTooltip("Read data from input")
        this.setHelpUrl("")
        this.setOutput(true, null)
        this.setColour(230)
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

    loadExtraState: function (query: any) {
        if (typeof query !== "string") {
            console.error("input_jsonpath extra state is not a string")
            return
        }

        this.updateQuery(query)
    },

    onchange: function (abstract) {
        if ("blockId" in abstract && abstract.blockId === this.id) {
            console.log("Change event", abstract)
        }
    },
}
