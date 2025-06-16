import * as Blockly from "blockly"
import { ValidationField } from "../fields/ValidationField"
import * as HMCProfile from "./profiles/HMC.json"
import { WorkspaceSvg } from "blockly"
import { FieldButton } from "../fields/FieldButton"

export const profile = {
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
            name: "digitalObjectType",
            check: "String",
        },
        {
            type: "input_value",
            name: "digitalObjectLocation",
            check: "String",
        },
        {
            type: "input_value",
            name: "digitalObjectLocation1",
            align: "RIGHT",
            check: "String",
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
            name: "hasMetadata",
        },
        {
            type: "input_value",
            name: "hasMetadata1",
            align: "RIGHT",
            check: "String",
        },
    ],
    previousStatement: "profile",
    nextStatement: ["profile", "attribute_key"],
    colour: 195,
    inputsInline: false,
}

/**
 * Contains data associated with the profile.
 *
 * NOTE: This means that the data will be associated at runtime
 * and is not being serialized! Implications:
 *
 * - assuming we load a design with a newer version of the designer,
 *   and updated data will be considered
 * - the old data will be forgotten
 * - good to keep things up to date, somehow
 * - bad for documentation, reproduction, and understandability
 *
 * Possible improvements:
 * - serialize data using the data string attribute or a mutator
 * - handle serialized, old data ... somehow, in case of updates
 * - use for each input a serializable field, for example a
 *   serializable label. Could be inherited from to change its
 *   visual appearance. See more on this here:
 *     - https://developers.google.com/blockly/guides/create-custom-blocks/fields/anatomy-of-a-field#serialization
 *     - Serializable Label docs: https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label-serializable
 *
 * Why this is designed this way:
 * - The mixins and extensions are quite hard / unsound to use from
 *   typescript. Probably caused by the transition of blockly to typescript
 *   still somehow being in progress.
 * - We need to assign a PID and the reference attribute of a profile
 * - We need to assign a PID to each attribute (=input) of a profile
 * - For repeatable attribute, the amount of inputs may be dynamic (at runtime)
 */
export const data = {
    self_pid: "21.T11148/b9b76f887845e32d29f7",
    self_attribute_key: "21.T11148/076759916209e5d62bd5",
    pidMap: {
        digitalObjectType: "21.T11148/1c699a5d1b4ad3ba4956",
        digitalObjectLocation: "21.T11148/b8457812905b83046284",
        hasMetadata: "21.T11148/d0773859091aeb451528",
    },
}

interface HMCBlock extends Blockly.BlockSvg {
    profile: typeof HMCProfile
    activeOptionalProperties: string[]
    addFieldForProperty(propertyName: string): void
    removeFieldForProperty(propertyName: string): void
}

/* @ts-ignore */
export const hmc_testblock: HMCBlock = {
    profile: HMCProfile,
    activeOptionalProperties: [],

    init: function init() {
        this.addIcon(
            new Blockly.icons.MutatorIcon(["lists_create_with_item"], this),
        )

        this.appendDummyInput("0").appendField(
            `Profile "Helmholtz KIP" with Validation`,
        )

        for (const property of this.profile.properties) {
            const details = property.representationsAndSemantics[0]
            if (details.obligation !== "Mandatory") continue // Skip optional properties by default
            this.addFieldForProperty(property.name)
        }

        this.appendDummyInput("DUMMY-DROPDOWN")
            .appendField(
                new Blockly.FieldDropdown([
                    ["-- Add Property --", "ADD"] as [string, string],
                    ...this.profile.properties
                        .filter(
                            (profile) =>
                                profile.representationsAndSemantics[0]
                                    .obligation === "Optional",
                        )
                        .map(
                            (profile) =>
                                [profile.name, profile.name] as [
                                    string,
                                    string,
                                ],
                        ),
                ]),
                "DROPDOWN",
            )
            .setAlign(0)

        this.setInputsInline(false)
        this.setTooltip("Tooltip")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setHelpUrl("")
        this.setColour(230)
    },

    addFieldForProperty(propertyName) {
        const property = this.profile.properties.find(
            (p) => p.name === propertyName,
        )
        if (!property) return

        const details = property.representationsAndSemantics[0]

        const input = this.appendValueInput(property.name)
            .appendField(property.name)
            .appendField(
                new ValidationField({
                    mandatory: details.obligation == "Mandatory",
                    repeatable: details.repeatable == "Yes",
                }),
                `val-${property.name}`,
            )
            .setCheck(
                details.repeatable == "Yes" ? ["Array", "JSON"] : ["JSON"],
            )
            .setAlign(1)

        if (details.obligation === "Optional") {
            input.appendField(
                new FieldButton("X", () =>
                    this.removeFieldForProperty(propertyName),
                ),
            )
        }
    },

    removeFieldForProperty(propertyName: string) {
        console.log(propertyName)
        this.activeOptionalProperties = this.activeOptionalProperties.filter(
            (e) => e !== propertyName,
        )
        this.removeInput(propertyName)
    },

    onchange: function onchange(abstract) {
        if (abstract instanceof Blockly.Events.BlockMove) {
            if (
                abstract.newParentId === this.id &&
                abstract.reason?.includes("connect")
            ) {
                setTimeout(() => {
                    if (!abstract.newInputName) return
                    const field = this.getField("val-" + abstract.newInputName)
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }, 100)
            }

            if (
                abstract.oldParentId === this.id &&
                abstract.reason?.includes("disconnect")
            ) {
                setTimeout(() => {
                    if (!abstract.oldInputName) return
                    const field = this.getField("val-" + abstract.oldInputName)
                    if (field instanceof ValidationField) {
                        field.forceCheck()
                    }
                }, 100)
            }
        }

        if (abstract instanceof Blockly.Events.BlockChange) {
            if (
                abstract.blockId === this.id &&
                abstract.name === "DROPDOWN" &&
                typeof abstract.newValue === "string" &&
                abstract.newValue !== "ADD"
            ) {
                this.setFieldValue("ADD", "DROPDOWN")

                if (
                    !this.activeOptionalProperties.includes(abstract.newValue)
                ) {
                    this.addFieldForProperty(abstract.newValue)
                    this.activeOptionalProperties.push(abstract.newValue)
                }
            }
        }
    },

    saveExtraState() {
        return JSON.stringify({
            activeOptionalProperties: this.activeOptionalProperties,
        })
    },

    loadExtraState(data) {
        const parsed = JSON.parse(data)
        if (
            typeof parsed === "object" &&
            "activeOptionalProperties" in parsed &&
            Array.isArray(parsed.activeOptionalProperties)
        ) {
            this.activeOptionalProperties = parsed.activeOptionalProperties

            for (const opt of this.activeOptionalProperties) {
                this.addFieldForProperty(opt)
            }
        }
    },

    decompose: function decompose(workspace) {
        const workspaceSvg = workspace as WorkspaceSvg
        // This is a special sub-block that only gets created in the mutator UI.
        // It acts as our "top block"
        const topBlock = workspaceSvg.newBlock("lists_create_with_container")
        topBlock.initSvg()

        // Then we add one sub-block for each item in the list.
        let connection = topBlock.getInput("STACK")?.connection
        for (const property of this.profile.properties.filter(
            (p) => p.representationsAndSemantics[0].obligation === "Optional",
        )) {
            const itemBlock = workspaceSvg.newBlock("lists_create_with_item")
            const fields = [...itemBlock.getFields()]
            fields.forEach((f) => f.setValue(property.name))
            itemBlock.initSvg()
            if (connection) {
                connection.connect(itemBlock.previousConnection)
                connection = itemBlock.nextConnection
            }
        }

        // And finally we have to return the top-block.
        return topBlock
    },

    compose: function compose(topBlock) {},
}
