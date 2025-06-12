/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import { blocks as profile_blocks } from "./blocks/all";
import { RecordMappingGenerator } from "./generators/python";
import { save, load } from "./serialization";
import { toolbox } from "./toolbox";
import "./index.css";
import {registerInputToolbox} from "./toolboxes/input";
import {BlocklyFieldButton} from "./blocks/BlocklyFieldButton";
import {FieldTextInput} from "blockly";
import "unified-document"

Blockly.fieldRegistry.register("button_field", BlocklyFieldButton)

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(profile_blocks);

Blockly.Blocks["input_jsonpath"] = {
  init: function () {
    this.appendDummyInput()
        .appendField("Data Query")
        .appendField(new FieldTextInput(), "QUERY")
        .appendField(new BlocklyFieldButton("Ändern", () => alert("click")))
    this.setTooltip("A block with an interactive button.");
    this.setHelpUrl("");
    this.setOutput(true, null)
    this.setColour(230);
  }
} as Blockly.Block;

var codeGenerator = new RecordMappingGenerator("PidRecordMappingPython");

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById("generatedCode")?.firstChild;
//const outputDiv = document.getElementById("output");
const blocklyDiv = document.getElementById("blocklyDiv");

if (!blocklyDiv) {
  throw new Error(`div with id 'blocklyDiv' not found`);
}
const workspace = Blockly.inject(blocklyDiv, {
  rtl: false,
  toolbox,
  grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
});
workspace.addChangeListener(Blockly.Events.disableOrphans);

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = codeGenerator.workspaceToCode(workspace as Blockly.Workspace);
  if (codeDiv) codeDiv.textContent = code;

  //if (outputDiv) outputDiv.innerHTML = "";

  //eval(code);
};

if (workspace) {
  // Load the initial state from storage and run the code.
  load(workspace);
  runCode();

  // Every time the workspace changes state, save the changes to storage.
  workspace.addChangeListener((e: Blockly.Events.Abstract) => {
    // UI events are things like scrolling, zooming, etc.
    // No need to save after one of these.
    if (e.isUiEvent) return;
    save(workspace);
  });

  // Whenever the workspace changes meaningfully, run the code again.
  workspace.addChangeListener((e: Blockly.Events.Abstract) => {
    // Don't run the code when the workspace finishes loading; we're
    // already running it once when the application starts.
    // Don't run the code during drags; we might have invalid state.
    if (
      e.isUiEvent ||
      e.type == Blockly.Events.FINISHED_LOADING ||
      workspace.isDragging()
    ) {
      return;
    }
    runCode();
  });
}

registerInputToolbox(workspace)
