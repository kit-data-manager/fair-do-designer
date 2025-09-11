import * as Blockly from "blockly"
import { ValidationField } from "../fields/ValidationField"
import * as HMCProfile from "./profiles/HMC.json"
import { FieldImage } from "blockly"
import { camelToTitleCase } from "../utils"
import { addBasePath } from "next/dist/client/add-base-path"
import * as z from "zod/mini"

function recordMutation(block: Blockly.Block, mutation: () => void) {
    Blockly.Events.setGroup(true)
    const before = block.saveExtraState?.()
    mutation()
    const after = block.saveExtraState?.()
    Blockly.Events.fire(
        new Blockly.Events.BlockChange(block, "mutation", null, before, after),
    )
    Blockly.Events.setGroup(false)
}

export interface HMCBlock extends Blockly.BlockSvg {
    profile: typeof HMCProfile
    activeOptionalProperties: string[]
    profileAttributeKey: string
    // block methods
    addImplicitDummyField(propertyName: string, value: string): void
    addFieldForProperty(propertyName: string, before?: string): void
    removeFieldForProperty(propertyName: string): void
    addListBlockToEmptyInput(input: Blockly.Input): void
    // data methods
    extractPidFromProperty(propertyName: string): string | undefined
    // blocks created from profile data
    createAttributeReferenceBlock(): Blockly.Block
    // event handlers
    onBlockCreate(event: Blockly.Events.BlockCreate): void
    onBlockMove(event: Blockly.Events.BlockMove): void
    onBlockChange(event: Blockly.Events.BlockChange): void
}

/* @ts-expect-error Object can't be cast to class */
export const profile_hmc: HMCBlock = {
    profile: HMCProfile,
    activeOptionalProperties: [],
    profileAttributeKey: "",

    init: function init() {
        this.profileAttributeKey = extractProfileAttributeKey(this)

        this.appendDummyInput("0").appendField(
            camelToTitleCase(this.profile.name),
        )

        for (const property of this.profile.properties) {
            const details = property.representationsAndSemantics[0]
            if (details.obligation !== "Mandatory") continue // Skip optional properties by default
            const isSelfReference =
                property.identifier === this.profileAttributeKey
            if (!isSelfReference) {
                this.addFieldForProperty(property.name)
            } else {
                this.addImplicitDummyField(
                    property.name,
                    this.profile.identifier,
                )
            }
        }

        const optionalPropertiesSelector = new Blockly.FieldDropdown([
            ["-- Add Property --", "ADD"] as [string, string],
            ...this.profile.properties
                .filter(
                    (property) =>
                        property.representationsAndSemantics[0].obligation ===
                        "Optional",
                )
                .map(
                    (property) =>
                        [camelToTitleCase(property.name), property.name] as [
                            string,
                            string,
                        ],
                ),
        ])
        optionalPropertiesSelector.setTooltip(
            "Adds optional properties of this profile to your record.",
        )

        this.appendDummyInput("DUMMY-DROPDOWN")
            .appendField(optionalPropertiesSelector, "DROPDOWN")
            .setAlign(0)

        this.setInputsInline(false)
        this.setTooltip(this.profile.name + ": " + this.profile.description)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setHelpUrl(addBasePath("/docs/blocks/profile"))
        this.setColour(230)
    },

    extractPidFromProperty(propertyName: string): string | undefined {
        return this.profile.properties.find((p) => p.name === propertyName)
            ?.identifier
    },

    addImplicitDummyField(propertyName: string, value: string) {
        const nameLabel = new Blockly.FieldLabel(
            camelToTitleCase(propertyName) + " (constant)",
        )
        nameLabel.setTooltip(propertyName + " / " + value)

        this.appendDummyInput(propertyName)
            .appendField(nameLabel, value)
            .appendField(
                new ValidationField({ customCheck: async () => true }),
                `val-${propertyName}`,
            )
            .setAlign(Blockly.inputs.Align.RIGHT)
    },

    addFieldForProperty(propertyName, before) {
        const property = this.profile.properties.find(
            (p) => p.name === propertyName,
        )
        if (!property) return

        const details = property.representationsAndSemantics[0]
        const isRepeatable = details.repeatable == "Yes"

        const typeCheck = [
            "JSON",
            "String",
            "Boolean",
            "Number",
            "BackwardLinkFor",
        ]
        if (isRepeatable) typeCheck.push("Array")

        const nameLabel = new Blockly.FieldLabel(
            camelToTitleCase(property.name),
        )
        nameLabel.setTooltip(property.name + " / " + property.identifier)

        const input = this.appendValueInput(property.name).appendField(
            nameLabel,
        )

        // Required when re-establishing the order of an input on undo
        if (before && this.getInput(before))
            this.moveInputBefore(input.name, before)

        if (details.obligation === "Optional") {
            const tooltip = "Click to remove this property"
            const image = new FieldImage(
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyYXNoMi1pY29uIGx1Y2lkZS10cmFzaC0yIj48cGF0aCBkPSJNMTAgMTF2NiIvPjxwYXRoIGQ9Ik0xNCAxMXY2Ii8+PHBhdGggZD0iTTE5IDZ2MTRhMiAyIDAgMCAxLTIgMkg3YTIgMiAwIDAgMS0yLTJWNiIvPjxwYXRoIGQ9Ik0zIDZoMTgiLz48cGF0aCBkPSJNOCA2VjRhMiAyIDAgMCAxIDItMmg0YTIgMiAwIDAgMSAyIDJ2MiIvPjwvc3ZnPg==",
                16,
                16,
                tooltip,
                () =>
                    recordMutation(this, () =>
                        this.removeFieldForProperty(propertyName),
                    ),
            )
            image.setTooltip(tooltip)
            input.appendField(image, "trash_icon")
        }

        input
            .appendField(
                new ValidationField({
                    mandatory: details.obligation == "Mandatory",
                    repeatable: isRepeatable,
                }),
                `val-${property.name}`,
            )
            .setCheck(typeCheck)
            .setAlign(1)
    },

    removeFieldForProperty(propertyName: string) {
        this.activeOptionalProperties = this.activeOptionalProperties.filter(
            (e) => e !== propertyName,
        )
        this.removeInput(propertyName)
    },

    addListBlockToEmptyInput(input: Blockly.Input) {
        const property = this.profile.properties.find(
            (p) => p.name === input.name,
        )
        if (!property) return

        const details = property.representationsAndSemantics[0]
        const isRepeatable: boolean = details.repeatable == "Yes"
        const hasConnection: boolean = input.connection != null
        const isConnected: boolean =
            hasConnection && input.connection?.targetConnection != null
        if (isRepeatable && !isConnected) {
            // Spawn a new list block and connect it to input
            const listBlock = this.workspace.newBlock("lists_create_with")
            listBlock.initSvg()
            listBlock.render()

            if ("minus" in listBlock && typeof listBlock.minus === "function") {
                listBlock.minus()
                listBlock.minus()
            }

            // Connect the list block to the input
            const connection = input.connection
            if (connection && listBlock.outputConnection) {
                connection.connect(listBlock.outputConnection)
            }
        }
    },

    createAttributeReferenceBlock() {
        const nameIdPairs: Blockly.MenuGenerator = this.profile.properties.map(
            (p) => {
                return [p.name, p.identifier]
            },
        )

        const profileName = this.profile.name
        return {
            init: function () {
                this.appendDummyInput("CONTENT")
                    .appendField(profileName)
                    .appendField(
                        new Blockly.FieldDropdown(nameIdPairs),
                        "ATTRIBUTE",
                    )
                this.setOutput(true, ["String", "attribute_key"])
                this.setTooltip(
                    `References an attribute key which appears in ${profileName}.`,
                )
                this.setHelpUrl(
                    addBasePath(
                        "/docs/blocks/automatic-backlinks#attribute-pid",
                    ),
                )
                this.setColour(120)
            },
        } as Blockly.Block
    },

    onBlockCreate(event: Blockly.Events.BlockCreate) {
        if (event.workspaceId) {
            const workspace = Blockly.Workspace.getById(event.workspaceId)

            // If this is just a preview in a toolbox (flyout), do not create list blocks
            if (workspace && workspace.isFlyout) return
        }

        if (event.blockId === this.id) {
            for (const input of this.inputList) {
                this.addListBlockToEmptyInput(input)
            }
        }
    },

    onBlockMove(event: Blockly.Events.BlockMove) {
        if (
            event.newParentId === this.id &&
            event.reason?.includes("connect")
        ) {
            setTimeout(() => {
                if (!event.newInputName) return
                const field = this.getField("val-" + event.newInputName)
                if (field instanceof ValidationField) {
                    field.forceCheck()
                }
            }, 100)
        }

        if (
            event.oldParentId === this.id &&
            event.reason?.includes("disconnect")
        ) {
            setTimeout(() => {
                if (!event.oldInputName) return
                const field = this.getField("val-" + event.oldInputName)
                if (field instanceof ValidationField) {
                    field.forceCheck()
                }
            }, 100)
        }
    },

    onBlockChange(event: Blockly.Events.BlockChange) {
        if (
            event.blockId === this.id &&
            event.name === "DROPDOWN" &&
            typeof event.newValue === "string" &&
            event.newValue !== "ADD"
        ) {
            // reset dropdown menu
            Blockly.Events.setRecordUndo(false)
            this.setFieldValue("ADD", "DROPDOWN")
            Blockly.Events.setRecordUndo(true)
            // add property if not already present
            if (!this.activeOptionalProperties.includes(event.newValue)) {
                recordMutation(this, () => {
                    if (typeof event.newValue === "string") {
                        this.addFieldForProperty(event.newValue)
                        this.activeOptionalProperties.push(event.newValue)
                        const input = this.getInput(event.newValue)
                        if (input) {
                            this.addListBlockToEmptyInput(input)
                        }
                    }
                })
            }
        }
    },

    onchange: function onchange(abstract) {
        if (abstract instanceof Blockly.Events.BlockCreate) {
            this.onBlockCreate(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockMove) {
            this.onBlockMove(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockChange) {
            this.onBlockChange(abstract)
        }
    },

    saveExtraState() {
        return JSON.stringify({
            activeOptionalProperties: this.activeOptionalProperties,
        })
    },

    loadExtraState(data) {
        const obj = typeof data === "string" ? JSON.parse(data) : data

        const parsed = z
            .object({
                activeOptionalProperties: z.array(z.string()),
            })
            .safeParse(obj)

        if (parsed.success) {
            const newProperties = parsed.data.activeOptionalProperties.filter(
                (p) => !this.activeOptionalProperties.includes(p),
            )
            const removedProperties = this.activeOptionalProperties.filter(
                (p) => !parsed.data.activeOptionalProperties.includes(p),
            )

            for (const opt of newProperties) {
                const pos = parsed.data.activeOptionalProperties.findIndex(
                    (v) => v === opt,
                )
                const followingProperty =
                    parsed.data.activeOptionalProperties.length > pos + 1
                        ? parsed.data.activeOptionalProperties[pos + 1]
                        : undefined
                this.addFieldForProperty(opt, followingProperty)
            }

            for (const opt of removedProperties) {
                this.removeFieldForProperty(opt)
            }

            this.activeOptionalProperties = parsed.data.activeOptionalProperties
        } else {
            console.error(
                "Failed to load extra state in hmc_profile",
                data,
                parsed.error,
            )
        }
    },
}

function extractProfileAttributeKey(block: HMCBlock): string {
    const attributeKey = block.profile.properties
        .filter((p) => p.name.toLowerCase().includes("profile"))
        .map((p) => p.identifier)
        .at(0)
    if (!attributeKey) {
        throw new Error("No profile property found for HmcBlock")
    }
    return attributeKey
}
