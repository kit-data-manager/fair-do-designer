/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PythonGenerator } from "blockly/python";
import * as Blockly from "blockly/core";

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock["add_text"] = function (
  block: Blockly.Block,
  generator: PythonGenerator,
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
  generator: PythonGenerator,
): String {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_dot = generator.valueToCode(block, "dot", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_name2 = generator.valueToCode(block, "NAME", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_loc1 = generator.valueToCode(block, "loc1", Order.ATOMIC);

  const dropdown_opt_selector = block.getFieldValue("opt_selector");

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_name = generator.valueToCode(block, "NAME", Order.ATOMIC);

  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_loc2 = generator.valueToCode(block, "loc1", Order.ATOMIC);

  // TODO: Assemble javascript into the code variable.
  const code = "var profile = 1\n";
  return code;
};

forBlock["attribute_key"] = function (
  block: Blockly.Block,
  generator: Blockly.CodeGenerator,
): String {
  const code = "var attr = 1\n";
  return code;
};
