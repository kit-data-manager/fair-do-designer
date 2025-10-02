import * as Blockly from "blockly"
import { FieldLabel } from "blockly"
import { addBasePath } from "next/dist/client/add-base-path"
import {
    pathSegmentsToPointer,
    pathToPathSegments,
} from "@/lib/data-source-picker/json-path"

export interface InputJsonPointer extends Blockly.BlockSvg {
    updateQuery(query: string): void
}

/* @ts-expect-error Object can't be cast to class */
export const input_json_pointer: InputJsonPointer = {
    init: function () {
        const hiddenQueryField = new FieldLabel("JSON")
        hiddenQueryField.setVisible(false)

        this.appendDummyInput()
            .appendField("Read")
            .appendField("JSON", "DISPLAY_QUERY")
            .appendField(hiddenQueryField, "QUERY")
        this.setTooltip(
            "Read value from Source Document. Right-click for more.",
        )
        this.setHelpUrl(addBasePath("/docs/blocks/data-access#read-block"))
        this.setOutput(true, null)
        this.setColour(210)
    },

    customContextMenu(menu) {
        menu.splice(0, 0, {
            // @ts-expect-error Incorrectly typed
            id: "separatorAfterCollapseBlock",
            scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
            weight: 11, // Between the weights of the two items you want to separate.
            separator: true,
        })
        menu.splice(0, 0, {
            text: "Edit Query",
            callback: () => {
                const result = prompt(
                    "⭐️ Enter the new Query below:",
                    this.getField("QUERY")?.getValue() ?? "",
                )
                if (result) {
                    this.updateQuery(result)
                }
            },
            enabled: true,
        })
        menu.splice(0, 0, {
            text: "Show full Query",
            callback: () => {
                alert(
                    this.getField("QUERY")?.getValue() ?? "Failed to get query",
                )
            },
            enabled: true,
        })
    },

    updateQuery: function (query: string) {
        const display = query.startsWith("/")
            ? query.split("/")[query.split("/").length - 1]
            : query.split(".")[query.split(".").length - 1]
        this.setFieldValue(display, "DISPLAY_QUERY")
        this.setFieldValue(query, "QUERY")
        this.getField("QUERY")?.setVisible(false)
    },

    saveExtraState: function () {
        return this.getField("QUERY")?.getValue()
    },

    loadExtraState: function (query: unknown) {
        if (typeof query !== "string") {
            console.error("input_jsonpath extra state is not a string")
            return
        }

        if (query.startsWith("$")) {
            // Query is in JSON Path format, converting to JSON Pointer
            const temp = pathToPathSegments(query)
            const pointer = pathSegmentsToPointer(temp)
            this.updateQuery(pointer)
        } else {
            this.updateQuery(query)
        }
    },
}

/* @ts-expect-error Object can't be cast to class */
export const input_custom_json_pointer: Blockly.BlockSvg = {
    init: function () {
        this.appendValueInput("QUERY")
            .setCheck("String")
            .appendField(
                new Blockly.FieldLabelSerializable("Custom JSON Pointer"),
                "NAME",
            )
        this.setInputsInline(true)
        this.setOutput(true, "JSON")
        this.setTooltip(
            "Resolve a custom JSON Pointer against the current Source Document",
        )
        this.setHelpUrl(
            addBasePath("/docs/blocks/data-access#advanced-queries"),
        )
        this.setColour(210)
    },
}

/* @ts-expect-error Object can't be cast to class */
export const input_custom_json_path: Blockly.BlockSvg = {
    init: function () {
        this.appendValueInput("QUERY")
            .setCheck("String")
            .appendField(
                new Blockly.FieldLabelSerializable("Custom JSON Path"),
                "NAME",
            )
        this.setInputsInline(true)
        this.setOutput(true, "JSON")
        this.setTooltip(
            "Execute a custom JSON Path query against the current Source Document",
        )
        this.setHelpUrl(
            addBasePath("/docs/blocks/data-access#advanced-queries"),
        )
        this.setColour(210)
    },
}
