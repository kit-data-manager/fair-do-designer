import * as Blockly from "blockly"
import { FieldImage } from "blockly"
import { ValidationField } from "../fields/ValidationField"
import { camelToTitleCase } from "../utils"
import { addBasePath } from "next/dist/client/add-base-path"
import * as z from "zod/mini"
import {
    PidConsortiumLabProfile,
    PidConsortiumLabProfileProperty,
    PidConsortiumLabProfileSchema,
} from "@/lib/blocks/profiles/pidconsortium_lab_profile_schema"

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

export type ProfileBlock = Blockly.BlockSvg & ProfileBlockMixin
export interface ProfileBlockMixin {
    profile: PidConsortiumLabProfile
    activeOptionalProperties: string[]
    profileAttributeKey: string | undefined
    // block methods
    addImplicitDummyField(
        this: ProfileBlock,
        propertyName: string,
        value: string,
    ): void
    addFieldForProperty(
        this: ProfileBlock,
        propertyName: string,
        before?: string,
    ): void
    removeFieldForProperty(this: ProfileBlock, propertyName: string): void
    addListBlockToEmptyInput(this: ProfileBlock, input: Blockly.Input): void
    // data methods
    extractPidFromProperty(
        this: ProfileBlock,
        propertyName: string,
    ): string | undefined
    // blocks created from profile data
    createAttributeReferenceBlock(this: ProfileBlock): Blockly.Block
    // event handlers
    onBlockCreate(this: ProfileBlock, event: Blockly.Events.BlockCreate): void
    onBlockMove(this: ProfileBlock, event: Blockly.Events.BlockMove): void
    onBlockChange(this: ProfileBlock, event: Blockly.Events.BlockChange): void
    // helpers
    getProperties(this: ProfileBlock): PidConsortiumLabProfileProperty[]
}

export const createProfileBlock: (profileJson: unknown) => ProfileBlockMixin = (
    json,
) => ({
    profile: PidConsortiumLabProfileSchema.parse(json),
    activeOptionalProperties: [],
    profileAttributeKey: undefined,

    init: function init(this: ProfileBlock) {
        this.profileAttributeKey = extractProfileAttributeKey(this)

        this.appendDummyInput("0").appendField(
            camelToTitleCase(this.profile.name),
        )

        for (const property of this.getProperties()) {
            if (property.Properties?.Cardinality.startsWith("0")) continue // Skip optional properties by default
            const isSelfReference = property.Type === this.profileAttributeKey
            if (!isSelfReference) {
                this.addFieldForProperty(property.Name)
            } else {
                this.addImplicitDummyField(
                    property.Name,
                    this.profile.Identifier ?? this.profile.name,
                )
            }
        }

        const optionalPropertiesSelector = new Blockly.FieldDropdown([
            ["-- Add Property --", "ADD"] as [string, string],
            ...this.getProperties()
                .filter((property) =>
                    property.Properties?.Cardinality.startsWith("0"),
                )
                .map(
                    (property) =>
                        [camelToTitleCase(property.Name), property.Name] as [
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

    getProperties() {
        return this.profile.Schema?.Properties ?? []
    },

    extractPidFromProperty(propertyName: string): string | undefined {
        return this.getProperties().find((p) => p.Name === propertyName)?.Type
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
        const property = this.getProperties().find(
            (p) => p.Name === propertyName,
        )
        if (!property) return

        const isOptional = property.Properties?.Cardinality.startsWith("0")
        const isRepeatable = property.Properties?.Cardinality.endsWith("n")

        const typeCheck = [
            "JSON",
            "String",
            "Boolean",
            "Number",
            "BackwardLinkFor",
        ]
        if (isRepeatable) typeCheck.push("Array")

        const nameLabel = new Blockly.FieldLabel(
            camelToTitleCase(property.Name),
        )
        nameLabel.setTooltip(property.Name + " / " + property.Type)

        const input = this.appendValueInput(property.Name).appendField(
            nameLabel,
        )

        // Required when re-establishing the order of an input on undo
        if (before && this.getInput(before))
            this.moveInputBefore(input.name, before)

        if (isOptional) {
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
                    mandatory: !isOptional,
                    repeatable: isRepeatable,
                }),
                `val-${property.Name}`,
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
        const property = this.getProperties().find((p) => p.Name === input.name)
        if (!property) return

        const isRepeatable = property.Properties?.Cardinality.endsWith("n")
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
        const nameIdPairs: Blockly.MenuGenerator = this.getProperties().map(
            (p) => {
                return [p.Name, p.Type]
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

    onchange: function onchange(this: ProfileBlock, abstract) {
        if (abstract instanceof Blockly.Events.BlockCreate) {
            this.onBlockCreate(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockMove) {
            this.onBlockMove(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockChange) {
            this.onBlockChange(abstract)
        }
    } satisfies Blockly.Block["onchange"],

    saveExtraState() {
        return JSON.stringify({
            activeOptionalProperties: this.activeOptionalProperties,
        })
    },

    loadExtraState: function loadExtraState(this: ProfileBlock, data) {
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
    } satisfies Blockly.Block["loadExtraState"],
})

function extractProfileAttributeKey(block: ProfileBlock) {
    return block
        .getProperties()
        .filter((p) => p.Name.toLowerCase().includes("profile"))
        .map((p) => p.Type)
        .at(0)
}
