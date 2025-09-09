import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"
import { ValidationField } from "../fields/ValidationField";
import { RecordMappingGenerator } from "../generators/python";
import { pythonGenerator } from "blockly/python";

export interface StandaloneAttribute extends Blockly.BlockSvg {
  keyValidationIndicatorName: string,
  valueValidationIndicatorName: string,
  // event handlers
  onBlockMove(event: Blockly.Events.BlockMove): void
}

/* @ts-expect-error Object can't be cast to class */
export const attribute: StandaloneAttribute = {
  keyValidationIndicatorName: "KEY_VALIDATION",
  valueValidationIndicatorName: "VAL_VALIDATION",
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
      .appendField('Attribute-PID')
      .appendField(
        new ValidationField({
          mandatory: true,
          repeatable: false,
          customCheck: (
            workspace: Blockly.Workspace,
            conn: Blockly.Connection | null
          ) => {
            if (!conn) return false;
            if (!conn.isConnected()) return false;
            if (conn.targetBlock()?.isInsertionMarker()) return false;
            const connectedBlock = conn.targetBlock()
            const g = new RecordMappingGenerator("PidRecordMappingPython");
            g.init(workspace);
            let code = g.blockToCode(connectedBlock);
            // remove python-like string quotes
            if (Array.isArray(code)) {
              code[0] = code[0].replace(/^['"]|['"]$/g, '');
            } else if (typeof code === 'string') {
              code = code.replace(/^['"]|['"]$/g, '');
            } else {
              return false;
            }
            // check if code matches regex for PIDs
            const isPid: boolean = code.length > 0 && /^[0-9,A-Z,a-z]+\.[0-9,A-Z,a-z]+.*\/[!-~]+$/.test(code[0]);
            return isPid;
          }
        }),
        this.keyValidationIndicatorName
      );
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
        this.valueValidationIndicatorName
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
        const field = this.getField(this.valueValidationIndicatorName)
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
        const field = this.getField(this.valueValidationIndicatorName)
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
