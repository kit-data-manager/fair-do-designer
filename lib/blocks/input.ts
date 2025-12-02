import * as Blockly from "blockly"
import { FieldLabel } from "blockly"
import { addBasePath } from "next/dist/client/add-base-path"
import {
    PathSegment,
    pathSegmentsToPointer,
    pathToPathSegments,
    pointerToPathSegments,
} from "@/lib/data-source-picker/json-path"

export interface InputJsonPointer extends Blockly.BlockSvg {
    path: PathSegment[]
    label?: string

    /**
     * Update the query field and optionally the label field. If no label is provided, the current label is used. If there is currently no label, it will be generated from the query, but not saved to the state of the block.
     * @param query Query to update the block with.
     * @param label Optional label to set for the block.
     */
    updateQuery(query: PathSegment[], label?: string): void
}

/**
 * Type for the extra state of the input_json_pointer block.
 */
type ExtraState = {
    version: number
    path: PathSegment[]
    label: string | null
}

/* @ts-expect-error Object can't be cast to class */
export const input_json_pointer: InputJsonPointer = {
    path: [],

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
            text: "Edit Label",
            callback: () => {
                const result = prompt(
                    "⭐️ Enter the new Label below:",
                    this.getField("DISPLAY_QUERY")?.getValue() ?? "",
                )
                if (result) {
                    this.updateQuery(this.path, result)
                }
            },
            enabled: true,
        })
        menu.splice(0, 0, {
            text: "Edit Query",
            callback: () => {
                const result = prompt(
                    "⭐️ Enter the new Query below:",
                    this.getField("QUERY")?.getValue() ?? "",
                )
                if (result) {
                    const pathSegments = pointerToPathSegments(result)
                    this.updateQuery(pathSegments)
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

    updateQuery: function (path: PathSegment[], label?: string) {
        this.path = path
        if (label) this.label = label

        const query = pathSegmentsToPointer(path)
        const display = query.startsWith("/")
            ? query.split("/")[query.split("/").length - 1]
            : query.split(".")[query.split(".").length - 1]
        this.setFieldValue(this.label ?? display, "DISPLAY_QUERY")
        this.setFieldValue(query, "QUERY")
        this.getField("QUERY")?.setVisible(false)
    },

    saveExtraState: function () {
        return JSON.stringify({
            version: 1,
            path: this.path,
            label: this.label ?? null,
        } satisfies ExtraState)
    },

    loadExtraState: function (query: unknown) {
        if (typeof query !== "string") {
            console.error("input_jsonpath extra state is not a string")
            return
        }

        if (query.startsWith("$")) {
            // Query is in JSON Path format (version 1 of this block)
            this.path = pathToPathSegments(query)
        } else if (!query.startsWith("{")) {
            // Query probably in JSON Pointer format (version 2 of this block)
            this.path = pointerToPathSegments(query)
        } else {
            // Query in PathSegment format (version 3 of this block)
            try {
                const extraState = JSON.parse(query) as ExtraState
                this.path = extraState.path
                this.label = extraState.label ?? undefined
            } catch {
                console.error(
                    "Failed to load extra state of input_json_pointer",
                    query,
                )
                this.label = "Invalid state"
            }
        }

        this.updateQuery(this.path, this.label)
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
        this.setOutput(true, null)
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
        this.setOutput(true, null)
        this.setTooltip(
            "Execute a custom JSON Path query against the current Source Document",
        )
        this.setHelpUrl(
            addBasePath("/docs/blocks/data-access#advanced-queries"),
        )
        this.setColour(210)
    },
}
