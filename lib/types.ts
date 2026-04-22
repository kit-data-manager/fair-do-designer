import { z } from "zod/mini"

export const pidRecordSchema = z.object({
    pid: z.string(),
    record: z.array(
        z.object({
            key: z.string(),
            value: z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.undefined(),
                z.null(),
            ]),
        }),
    ),
})

export type PIDRecord = z.infer<typeof pidRecordSchema>
