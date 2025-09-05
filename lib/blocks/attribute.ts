import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"

// addBasePath("/docs/blocks/profile#additional-attributes-and-multiple-profiles")

export const attribute = {
  init: function() {
    this.appendValueInput('KEY')
    .setCheck('String')
      .appendField('Attribute-PID');
    this.appendValueInput('VALUE')
      .appendField(new Blockly.FieldLabelSerializable('with value'), 'VALUE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Additional Attribute, independent of profiles.');
    this.setHelpUrl(addBasePath("/docs/blocks/profile#additional-attributes-and-multiple-profiles"));
    this.setColour(225);
  }
} as Blockly.Block;

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
} as Blockly.Block;
