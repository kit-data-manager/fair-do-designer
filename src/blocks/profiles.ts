import * as Blockly from "blockly/core";

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
const profile = {
  type: "hmc_profile",
  tooltip: "",
  helpUrl: "",
  message0:
    "Profile %1 %2 Digital Object Type %3 Digital Object Location [+] %4 [-] %5 Add %6 %7 hasMetadata [+] %8 [-] %9",
  args0: [
    {
      type: "field_label_serializable",
      text: '"Helmholtz KIP"',
      name: "name_label",
    },
    {
      type: "input_dummy",
      name: "name",
    },
    {
      type: "input_value",
      name: "dot",
      check: "String",
    },
    {
      type: "input_value",
      name: "NAME",
      check: "String",
    },
    {
      type: "input_value",
      name: "loc1",
      align: "RIGHT",
      check: "attribute_array",
    },
    {
      type: "field_dropdown",
      name: "opt_selector",
      options: [
        ["--some optional attribute--", "empty"],
        ["hasMetadata (repeatable)", "hasmd"],
        ["isMetadataFor", "ismd"],
        ["Contact (repeatable)", "contact"],
      ],
    },
    {
      type: "input_dummy",
      name: "opt",
    },
    {
      type: "input_value",
      name: "NAME",
    },
    {
      type: "input_value",
      name: "loc1",
      align: "RIGHT",
      check: "attribute_array",
    },
  ],
  previousStatement: "hmc_profile",
  nextStatement: ["hmc_profile", "attribute_key"],
  colour: 195,
  inputsInline: false,
};

const attribute = {
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
// Create the block definitions for the JSON-only blocks.
// This does not register their definitions with Blockly.
// This file has no side effects!
export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  profile,
  attribute,
]);
