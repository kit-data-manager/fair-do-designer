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
    "%1 %2 ⭐ Mandatory Attributes %3 %4 %5 %6 %7 %8 %9 %10 %11 %12 %13 %14 %15 %16 %17 %18 %19",
  args0: [
    {
      type: "field_label_serializable",
      text: "Helmholtz KIP",
      name: "profile_title",
    },
    {
      type: "input_dummy",
      name: "profile_header",
    },
    {
      type: "input_dummy",
      name: "NAME",
    },
    {
      type: "field_label_serializable",
      text: "Digital Object Location",
      name: "dolocations_label",
    },
    {
      type: "input_value",
      name: "dolocations",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "Topic",
      name: "topic_label",
    },
    {
      type: "input_value",
      name: "topic",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "dateCreated",
      name: "date_label",
    },
    {
      type: "input_value",
      name: "date",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "Contact",
      name: "contact_label",
    },
    {
      type: "input_value",
      name: "contact",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "Contact_important",
      name: "contact2_label",
    },
    {
      type: "input_value",
      name: "contact2",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "Contact_special",
      name: "contact3_label",
    },
    {
      type: "input_value",
      name: "contact3",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "Has Metadata",
      name: "hasmd_label",
    },
    {
      type: "input_value",
      name: "hasmd",
      check: "String",
    },
    {
      type: "field_label_serializable",
      text: "⭐Recommended Attributes",
      name: "opt_label",
    },
    {
      type: "input_value",
      name: "optionals",
      check: "attribute_array",
    },
  ],
  previousStatement: ["profile", "attribute_key"],
  nextStatement: ["profile", "attribute_key"],
  colour: 330,
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
