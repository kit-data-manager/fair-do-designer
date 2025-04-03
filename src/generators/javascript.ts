/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from "blockly/javascript";
import * as Blockly from "blockly/core";

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock["add_text"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
) {
  const text = generator.valueToCode(block, "TEXT", Order.NONE) || "''";
  const addText = generator.provideFunction_(
    "addText",
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(text) {

  // Add text to the output area.
  const outputDiv = document.getElementById('output');
  const textEl = document.createElement('p');
  textEl.innerText = text;
  outputDiv.appendChild(textEl);
}`,
  );
  // Generate the function call for this block.
  const code = `${addText}(${text});\n`;
  return code;
};

forBlock["hmc_profile"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
) {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_mandatory = generator.valueToCode(
    block,
    "mandatory",
    Order.ATOMIC,
  );

  const statement_optional = generator.statementToCode(block, "optional");

  // TODO: Assemble javascript into the code variable.
  const code = "1";
  // TODO: Change Order.NONE to the correct operator precedence strength
  return [code, Order.NONE];
};

forBlock["attribute_key"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
) {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_attr_value = generator.valueToCode(
    block,
    "attr_value",
    Order.ATOMIC,
  );

  const dropdown_on_fail = block.getFieldValue("on_fail");

  // TODO: Assemble javascript into the code variable.
  const code = "1";
  return code;
};
