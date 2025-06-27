import * as Blockly from "blockly"
import { FieldButton } from "../fields/FieldButton"

export const input_jsonpath = {
    init: function () {
        this.appendDummyInput()
            .appendField("👁️")
            .appendField("JSON", "QUERY")
            .appendField(new FieldButton("⚙️", () => alert("click")))
            .appendField(new FieldButton("🔍", () => alert("click")))
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
