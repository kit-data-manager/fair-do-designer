import * as Blockly from "blockly/core"
import { addBasePath } from "next/dist/client/add-base-path"
import {
    ValidationField,
    ValidationFieldOptions,
} from "../fields/ValidationField"
import { RecordMappingGenerator } from "../generators/python"

const handleCache = new Map<string, boolean | string>()

export interface StandaloneAttribute extends Blockly.BlockSvg {
    keyValidationIndicatorName: string
    valueValidationIndicatorName: string
    // event handlers
    onBlockMove(event: Blockly.Events.BlockMove): void
}

/* @ts-expect-error Object can't be cast to class */
export const attribute: StandaloneAttribute = {
    keyValidationIndicatorName: "KEY_VALIDATION",
    valueValidationIndicatorName: "VAL_VALIDATION",
    init: function init() {
        const allowedValueTypes = [
            "JSON",
            "String",
            "Boolean",
            "Number",
            "BackwardLinkFor",
        ]

        this.appendValueInput("KEY")
            .setCheck("String")
            .appendField("Attribute-PID")
            .appendField(
                new ValidationField({
                    mandatory: true,
                    repeatable: false,
                    customCheck: attributePIDCheckFunction,
                }),
                this.keyValidationIndicatorName,
            )
        this.appendValueInput("VALUE")
            .appendField(
                new Blockly.FieldLabelSerializable("with value"),
                "VALUE",
            )
            .appendField(
                new ValidationField({
                    // not bound to a profile
                    mandatory: false,
                    // same reason. To repeat it, clone the block.
                    repeatable: false,
                }),
                this.valueValidationIndicatorName,
            )
            .setCheck(allowedValueTypes)
            .setAlign(1)
        const allowedStatementTypes = ["profile_hmc", "attribute_key"]
        this.setPreviousStatement(true, allowedStatementTypes)
        this.setNextStatement(true, allowedStatementTypes)
        this.setTooltip("Additional Attribute, independent of profiles.")
        this.setHelpUrl(
            addBasePath(
                "/docs/blocks/profile#additional-attributes-and-multiple-profiles",
            ),
        )
        this.setColour(225)
    },

    onBlockMove(event: Blockly.Events.BlockMove) {
        if (
            event.newParentId === this.id &&
            event.reason?.includes("connect")
        ) {
            setTimeout(() => {
                if (event.newInputName === "KEY") {
                    const field = this.getField(this.keyValidationIndicatorName)
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }
                if (event.newInputName === "VALUE") {
                    const field = this.getField(
                        this.valueValidationIndicatorName,
                    )
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }
            }, 100)
        }

        if (
            event.oldParentId === this.id &&
            event.reason?.includes("disconnect")
        ) {
            setTimeout(() => {
                if (event.oldInputName === "KEY") {
                    const field = this.getField(this.keyValidationIndicatorName)
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }
                if (event.oldInputName === "VALUE") {
                    const field = this.getField(
                        this.valueValidationIndicatorName,
                    )
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }
            }, 100)
        }
    },

    onchange: function onchange(abstract) {
        if (abstract instanceof Blockly.Events.BlockMove) {
            this.onBlockMove(abstract)
        }
    },
}

const attributePIDCheckFunction: ValidationFieldOptions["customCheck"] = async (
    workspace,
    conn,
) => {
    if (!conn) return false
    if (!conn.isConnected()) return false
    if (conn.targetBlock()?.isInsertionMarker()) return false

    const connectedBlock = conn.targetBlock()
    const g = new RecordMappingGenerator("PidRecordMappingPython")

    g.init(workspace)
    let code = g.blockToCode(connectedBlock)

    // remove python-like string quotes
    if (Array.isArray(code)) {
        code = code[0].replace(/^['"]|['"]$/g, "")
    } else {
        code = code.replace(/^['"]|['"]$/g, "")
    }

    // check if code matches regex for PIDs
    const isPid: boolean = /^[0-9A-Za-z]+\.[0-9A-Za-z]+.*\/[!-~]+$/.test(code)
    if (!isPid) {
        return `The attached block does not return a valid PID: ${code}`
    }
    if (handleCache.has(code)) return handleCache.get(code)!

    try {
        const response = await fetch(`https://hdl.handle.net/${code}`, {
            redirect: "follow",
            cache: "force-cache",
        })

        if (response.ok) {
            await response.json()
            handleCache.set(code, true)
            return true
        } else if (response.status === 404) {
            const msg = `The provided PID could not be resolved: ${code}`
            handleCache.set(code, msg)
            return msg
        } else {
            console.warn(
                "PID could not be resolved due to unknown error",
                response,
            )
            return false
        }
    } catch (e) {
        console.log(`PID ${code} could not be resolved`, e)

        const msg = "PID could not be resolved due to an error."
        handleCache.set(code, msg)
        return msg
    }
}

export const backlink_declaration = {
    init: function () {
        this.appendValueInput("ATTRIBUTE_KEY")
            .setCheck(["attribute_key", "String"])
            .appendField("Inverse reference to attribute")
        this.setOutput(true, "BackwardLinkFor")
        this.setTooltip(
            "Adds reverse references (backlinks) if another record links to this record using the given attribute key.",
        )
        this.setHelpUrl(
            addBasePath(
                "/docs/blocks/automatic-backlinks#inverse-reference-to-attribute",
            ),
        )
        this.setColour(120)
    },
} as Blockly.Block
