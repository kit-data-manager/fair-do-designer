import { PathSegment, pathSegmentsToPath } from "./json-path"
import { JSONPath } from "jsonpath-plus"
import {
    IUnifiedDocumentEntry,
    JSONValues,
} from "@/lib/data-source-picker/types"
import { UnifiedDocumentEntry } from "@/lib/data-source-picker/unified-document-entry"

const starterDoc: IUnifiedDocumentEntry = new UnifiedDocumentEntry({
    key: "$",
    path: [{ type: "key", value: "$" }],
    observedValues: new Map(),
    children: [],
    timesObserved: 0,
    arrayElement: false,
})

export class Unifier {
    private root: IUnifiedDocumentEntry = starterDoc
    private documents: Record<string, JSONValues> = {}

    process(name: string, doc: JSONValues) {
        this.root.timesObserved++
        this.documents[this.generateUniqueDocumentName(name)] = doc
        this.processChild(this.root, doc)
    }

    /**
     * Generates a unique name for a document based on the provided name.
     * If the name is already used, a number suffix is appended to make it unique.
     * @param name
     * @private
     */
    private generateUniqueDocumentName(name: string) {
        if (!(name in this.documents)) {
            return name
        }

        let i = 1
        while (name + ` (${i})` in this.documents) {
            i++
        }

        return name + ` (${i})`
    }

    reset() {
        this.root = starterDoc
        this.documents = {}
    }

    getUnifiedDocument() {
        return this.root
    }

    getFlattenedDocument() {
        const flattened: IUnifiedDocumentEntry[] = []
        const stack: IUnifiedDocumentEntry[] = [this.getUnifiedDocument()]

        do {
            const current = stack.shift()!

            flattened.push(current)

            if (current.children.length > 0) {
                stack.push(...current.children)
            }
        } while (stack.length > 0)

        return flattened
    }

    getDocuments() {
        return Object.entries(structuredClone(this.documents)).map(
            ([name, doc]) => ({ name, doc }),
        )
    }

    private processChild(unified: IUnifiedDocumentEntry, content: JSONValues) {
        const asArray = Array.isArray(content) ? content : undefined
        const asObject =
            typeof content === "object" &&
            !Array.isArray(content) &&
            content !== null
                ? content
                : undefined
        const asSingleValue =
            typeof content !== "object" || content === null
                ? content
                : undefined

        if (asObject !== undefined) {
            for (const subkey of Object.keys(asObject)) {
                const existing = unified.children.find((c) => c.key === subkey)

                if (existing) {
                    existing.timesObserved++
                    this.processChild(existing, asObject[subkey])
                } else {
                    const newPath = unified.path.slice()
                    newPath.push({ type: "key", value: subkey })

                    const newEntry = new UnifiedDocumentEntry({
                        key: subkey,
                        children: [],
                        timesObserved: 1,
                        observedValues: new Map(),
                        path: newPath,
                        arrayElement: false,
                    })

                    unified.children.push(newEntry)
                    this.processChild(newEntry, asObject[subkey])
                }
            }
        }

        if (asArray !== undefined) {
            for (const i in asArray) {
                const entry = asArray[i]
                const existing = unified.children.find(
                    (c) =>
                        c.key === i &&
                        c.path[c.path.length - 1].type === "index",
                )

                if (existing) {
                    existing.timesObserved++
                    this.processChild(existing, entry)
                } else {
                    const newPath = unified.path.slice()
                    newPath.push({ type: "index", value: i })

                    const newEntry = new UnifiedDocumentEntry({
                        key: i,
                        children: [],
                        timesObserved: 1,
                        observedValues: new Map(),
                        path: newPath,
                        arrayElement: true,
                    })

                    unified.children.push(newEntry)
                    this.processChild(newEntry, entry)
                }
            }
        }

        if (asSingleValue !== undefined) {
            unified.observedValues.set(
                asSingleValue,
                (unified.observedValues.get(asSingleValue) || 0) + 1,
            )
        }
    }

    executeQuery(path: PathSegment[]) {
        const results = Object.entries(this.documents).map(([name, doc]) => {
            return [
                name,
                JSONPath({
                    path: pathSegmentsToPath(path),
                    json: doc as {},
                    resultType: "value",
                }),
            ] satisfies [string, JSONValues]
        })
        return results.filter(
            ([_, result]) => !Array.isArray(result) || result.length > 0,
        )
    }
}
