import * as Blockly from "blockly/core";
import {FieldTextInput} from "blockly";
import {InputDataQueryButton} from "./InputDataQueryButton";

Blockly.Blocks["input_dataquery"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Data Query")
            .appendField(new FieldTextInput(), "QUERY")
            .appendField(new InputDataQueryButton("Ändern", () => alert("click")))
        this.setTooltip("A block with an interactive button.");
        this.setHelpUrl("");
        this.setOutput(true, null)
        this.setColour(230);
    }
} as Blockly.Block;

