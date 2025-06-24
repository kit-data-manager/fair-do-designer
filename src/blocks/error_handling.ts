import * as Blockly from 'blockly/core';

/* @ts-ignore */
export const stop_design = {
  init: function() {
    this.appendDummyInput('ERROR')
      .appendField('✋Stop Design execution');
    this.appendValueInput('MESSAGE')
      .appendField('with error message:');
    this.setInputsInline(false)
    this.setOutput(true, null);
    this.setTooltip('Throws an error and stops the execution of the design. No PID will be created. Use for irreparable situations which you do not expect to happen.');
    this.setHelpUrl('');
    this.setColour(345);
  }
} as Blockly.Block;
