import * as Blockly from "blockly/core";

export class AttributeValueInput extends Blockly.inputs.ValueInput {
  pid: string | undefined = undefined;

  constructor(name: string, block: Blockly.Block, pid: string) {
    super(name, block);
    this.pid = pid;
    this.connection = this.makeConnection(Blockly.ConnectionType.INPUT_VALUE);
  }
}
Blockly.registry.register(
  Blockly.registry.Type.INPUT,
  "attribute_value",
  AttributeValueInput,
);
