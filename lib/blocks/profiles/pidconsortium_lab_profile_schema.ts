import { z } from "zod"

export const PidConsortiumLabProfilePropertySchema = z.object({
    Name: z.string(),
    Title: z
        .string()
        .describe("If desired, add a title to the schema field.")
        .optional(),
    Description: z
        .string()
        .describe(
            "A custom description to override the description of the underlying type in the schema",
        )
        .optional(),
    Type: z.string(),
    Properties: z
        .object({
            "Const Value": z
                .string()
                .describe(
                    "Optional field. Sets a constant value that must be present in this field for all instances of this type.",
                )
                .optional(),
            Cardinality: z
                .enum(["0 - 1", "1", "0 - n", "1 - n"])
                .describe(
                    "The cardinality of the property, also describes the obligation. A cardinality of 0 - n defines an optional array, cardinality 1 - n defines a mandatory array.",
                ),
            extractProperties: z
                .boolean()
                .describe(
                    "If true and the selected type is an InfoType object, extract all its properties and use them on their own. This does not create an object for the type but takes those sub-properties to the current level.",
                )
                .optional(),
        })
        .optional(),
})

export const PidConsortiumLabProfileSchema = z.object({
    Identifier: z.string().optional(),
    name: z
        .string()
        .regex(new RegExp("^([!-~])+$"))
        .max(128)
        .describe("please use printable ascii characters without blank"),
    description: z.string().regex(new RegExp("(.|\n)*")).max(8192).optional(),
    versioning: z
        .object({
            version: z.string().optional(),
            previousVersion: z.any().optional(),
            nextVersion: z.any().optional(),
        })
        .optional(),
    provenance: z
        .object({
            contributors: z
                .array(
                    z.object({
                        Name: z
                            .string()
                            .describe("Full name of the contributor")
                            .optional(),
                        ORCID: z.string().optional(),
                    }),
                )
                .optional(),
            creationDate: z.string().optional(),
            lastModificationDate: z.string().optional(),
        })
        .optional(),
    ExpectedUse: z.string().max(1024).optional(),
    References: z
        .array(z.string())
        .describe("External references relating to this profile.")
        .optional(),
    Aliases: z
        .array(z.string())
        .describe(
            "Provide a list of aliases as alternatives to the chosen name.",
        )
        .optional(),
    Taxonomies: z
        .array(z.any())
        .describe("Taxonomy nodes that this type should be assigned to.")
        .optional(),
    Schema: z
        .object({
            Type: z
                .enum(["Object"])
                .describe(
                    "Necessary Field to include the type in the JSON output.",
                ),
            addProps: z
                .boolean()
                .describe(
                    "Allow properties in an object in addition to those mentioned in the type.",
                )
                .optional(),
            subCond: z
                .enum(["oneOf", "allOf", "anyOf"])
                .describe(
                    "If necessary, select a condition to apply for the set of subschemas.",
                )
                .optional(),
            Properties: z
                .array(PidConsortiumLabProfilePropertySchema)
                .optional(),
        })
        .describe("The actual properties describing the schema of the type.")
        .optional(),
})

export type PidConsortiumLabProfile = z.infer<
    typeof PidConsortiumLabProfileSchema
>
export type PidConsortiumLabProfileProperty = z.infer<
    typeof PidConsortiumLabProfilePropertySchema
>
