import { PathSegment } from "@/lib/data-source-picker/json-path"

export type JSONValuesPrimitive = string | boolean | number | null | undefined

/**
 * A JSON value that can be encountered at the root of a JSON document or as a child of any entry in the JSON document
 */
export type JSONValues =
    | JSONValuesPrimitive
    | { [index: string]: JSONValues }
    | JSONValues[]

export interface IUnifiedDocumentEntry {
    /**
     * Unique key for this entry between all other siblings. In case this is an array entry, this is a number (represented as a string)
     */
    key: string

    /**
     * Unique path to this entry in the source documents.
     */
    path: PathSegment[]

    /**
     * Primitive values ({@link JSONValuesPrimitive}) observed for this entry in the source documents.
     * Entries are provided in a map, where the key is the observed value and the value is the number of times it was observed.
     * @example
     * ```js
     * const documents = [
     *      { someKey: "foo" },
     *      { someKey: "foo" },
     *      { someKey: "bar" },
     * ]
     * const doc = unify(documents).get("someKey") // pseudocode
     * console.log(doc.observedValues) // Map { "foo": 2, "bar": 1 }
     * ```
     */
    observedValues: Map<JSONValuesPrimitive, number>

    /**
     * Child entries of this entry.
     */
    children: IUnifiedDocumentEntry[]

    /**
     * The number of times this entry (identified by its {@link path}) was encountered across all source documents.
     */
    timesObserved: number

    /**
     * Whether this entry is an array element. In this case, the {@link key} is a number (type string)
     * @example
     * ```js
     * console.log(doc.arrayElement) // true
     * console.log(doc.key) // "3"
     * ```
     */
    arrayElement: boolean

    /**
     * Indicates if this entry is a leaf in the tree-view of the source document.
     * This further indicated that this entry has no {@link children} and only contains {@link observedValues}
     */
    isLeaf(): boolean
}
