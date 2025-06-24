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

export const log_value = {
  "type": "log_value",
  "tooltip": "Prints a value to the logs. Give it a proper name or description to make it easier to identify it in the logs.",
  "helpUrl": "",
  "message0": "✍️Print value %1 named %2 with reason %3",
  "args0": [
    {
      "type": "input_value",
      "name": "VALUE"
    },
    {
      "type": "input_value",
      "name": "DESC",
      "check": "String"
    },
    {
      "type": "input_value",
      "name": "REASON",
      "check": "String"
    }
  ],
  "output": null,
  "colour": 345,
  "inputsInline": false
};