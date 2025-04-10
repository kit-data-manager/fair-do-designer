import * as Blockly from "blockly/core";

export const pidrecord = {
  type: "pidrecord",
  tooltip: "",
  helpUrl: "",
  message0: "PID Record %1 %2 Local ID (pseudo-pid) %3 %4",
  args0: [
    {
      type: "field_label_serializable",
      text: "(no PID yet)",
      name: "pid",
    },
    {
      type: "input_dummy",
      name: "label",
    },
    {
      type: "input_value",
      name: "local-id",
    },
    {
      type: "input_statement",
      name: "record",
      check: ["profile", "attribute_key"],
    },
  ],
  colour: 330,
  inputsInline: false,
};
