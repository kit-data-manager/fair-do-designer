import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"
import { ValidationField } from "../fields/ValidationField";

export interface StandaloneAttribute extends Blockly.BlockSvg {
  // event handlers
  onBlockMove(event: Blockly.Events.BlockMove): void
}

/* @ts-expect-error Object can't be cast to class */
export const attribute: StandaloneAttribute = {
  init: function init() {
    const allowedValueTypes = [
      "JSON",
      "String",
      "Boolean",
      "Number",
      "BackwardLinkFor",
    ]

    this.appendValueInput('KEY')
      .setCheck('String')
      .appendField('Attribute-PID');
    this.appendValueInput('VALUE')
      .appendField(
        new Blockly.FieldLabelSerializable('with value'),
        'VALUE'
      )
      .appendField(
        new ValidationField({
          // not bound to a profile
          mandatory: false,
          // same reason. To repeat it, clone the block.
          repeatable: false,
        }),
        "validationfield"
      )
      .setCheck(allowedValueTypes)
      .setAlign(1);
    const allowedStatementTypes = ["profile_hmc", "attribute_key"]
    this.setPreviousStatement(true, allowedStatementTypes);
    this.setNextStatement(true, allowedStatementTypes);
    this.setTooltip('Additional Attribute, independent of profiles.');
    this.setHelpUrl(addBasePath("/docs/blocks/profile#additional-attributes-and-multiple-profiles"));
    this.setColour(225);
  },

  onBlockMove(event: Blockly.Events.BlockMove) {
    if (
      event.newParentId === this.id &&
      event.reason?.includes("connect")
    ) {
      setTimeout(() => {
        if (!event.newInputName) return
        const field = this.getField("validationfield")
        if (field instanceof ValidationField) {
          field.forceCheck()
        }
      }, 100)
    }

    if (
      event.oldParentId === this.id &&
      event.reason?.includes("disconnect")
    ) {
      setTimeout(() => {
        if (!event.oldInputName) return
        const field = this.getField("validationfield")
        if (field instanceof ValidationField) {
          field.forceCheck()
        }
      }, 100)
    }
  },

  onchange: function onchange(abstract) {
    if (abstract instanceof Blockly.Events.BlockMove) {
      this.onBlockMove(abstract)
    }
  },
};

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
