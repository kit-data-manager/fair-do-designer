import * as Blockly from 'blockly/core';

export const stop_design = {
    init: function() {
        this.appendValueInput('MESSAGE')
            .appendField('🛑 Stop with error');
        this.setInputsInline(false)
        this.setOutput(true, null);
        this.setTooltip('Throws an error and stops the execution of the design. No PID will be created. Use for irreparable situations which you do not expect to happen.');
        this.setHelpUrl('');
        this.setColour(345);
    }
} as Blockly.Block;

export const log_value = {
  init: function() {
    this.appendValueInput('INVAR')
    .setCheck(null)
      .appendField('🗨️Print')
      .appendField(new Blockly.FieldTextInput('Description'), 'DESC');
    this.setOutput(true, null);
    this.setTooltip('Print given information and continue. Continues in any case (no cancellation)!');
    this.setHelpUrl('');
    this.setColour(0);
  }
} as Blockly.Block;

export const otherwise = {
  init: function() {
    this.appendValueInput('VALUE');
    this.appendDummyInput('LABEL')
      .appendField('otherwise');
    this.appendValueInput('OTHER');
    this.setInputsInline(true)
    this.setOutput(true, null);
    this.setTooltip('Test if a value has an empty-ish value. If so, return a given alternative. If not, return the value itself. This is useful to provide a default value in case the value is not set or empty.');
    this.setHelpUrl('');
    this.setColour(210);
  }
} as Blockly.Block;
