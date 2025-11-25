import { BlockData, WorkspaceData } from "@/lib/serialization"

type Migration = (data: WorkspaceData) => WorkspaceData

// Example migration (can be removed once there is an actual migration here)
// const exampleMigration: Migration = (data) => {
//     const helper = new MigrationHelper(data)
//     helper.handleBlockType("example_block_0", (block) => {
//         if (block.fields?.example_field === "old_value") {
//             block.fields.example_field = "new_value"
//             return block
//         }
//         return null
//     })
//     return data
// }

const migrations: Migration[] = [
    // exampleMigration
]

/**
 * Runs the migrations from the migrations array in order (lowest index first)
 * @param data
 */
export function runAllMigrations(data: WorkspaceData): WorkspaceData {
    for (const migration of migrations) {
        data = migration(structuredClone(data))
    }
    return data
}

class MigrationHelper {
    constructor(private data: WorkspaceData) {}

    /**
     * Searches for blocks of a specific type and calls the handler for each one. Uses breadth-first search.
     * @param type The type of the block to handle.
     * @param handler Should return null if no changes to the block were made. Should return the changed block otherwise.
     * @returns
     */
    handleBlockType(
        type: string,
        handler: (data: BlockData) => BlockData | null,
    ) {
        const queue: {
            current: BlockData
            parent: Record<string, unknown>
            key: string
        }[] = []

        for (let i = 0; i < this.data.data.blocks.blocks.length; i++) {
            const block = this.data.data.blocks.blocks[i]
            if (block.type === type) {
                queue.push({
                    current: block,
                    // Casting this array to Record<string, unknown> is okay because javascript allows string numbers for indexing arrays
                    parent: this.data.data.blocks.blocks as unknown as Record<
                        string,
                        unknown
                    >,
                    key: i + "",
                })
            }
        }

        function addInputs(input: { block?: BlockData; shadow?: BlockData }) {
            if (input.block) {
                queue.push({
                    current: input.block,
                    parent: input,
                    key: "block",
                })
            }
            if (input.shadow) {
                queue.push({
                    current: input.shadow,
                    parent: input,
                    key: "shadow",
                })
            }
        }

        for (const entry of queue) {
            const changed = handler(structuredClone(entry.current))
            if (changed) {
                entry.parent[entry.key] = changed

                for (const input of Object.values(changed.inputs ?? {})) {
                    addInputs(input)
                }
            } else {
                for (const input of Object.values(entry.current.inputs ?? {})) {
                    addInputs(input)
                }
            }
        }
    }
}
