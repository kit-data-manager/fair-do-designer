import * as Blockly from "blockly/core";

export const attribute = {
  type: "attribute_key",
  tooltip: "asdf",
  helpUrl:
    "https://dtr-test.pidconsortium.net/#objects/21.T11148/b9b76f887845e32d29f7",
  message0: "%1 On failure %2 %3 %4 %5",
  args0: [
    {
      type: "field_label_serializable",
      text: "digitalObjectLocation",
      name: "name",
    },
    {
      type: "field_dropdown",
      name: "on_fail",
      options: [
        ["stop", "fail-stop"],
        ["continue silent", "fail-continue"],
        ["continue with warning", "fail-warn"],
      ],
    },
    {
      type: "input_value",
      name: "slot",
      check: "String",
    },
    {
      type: "field_input",
      name: "pid",
      text: "21.11152/a3f19b32-4550-40bb-9f69-b8ffd4f6d0ea",
    },
    {
      type: "input_dummy",
      name: "NAME",
    },
  ],
  previousStatement: ["attribute_key", "profile"],
  nextStatement: ["attribute_key", "profile"],
  colour: 285,
  inputsInline: false,
};
