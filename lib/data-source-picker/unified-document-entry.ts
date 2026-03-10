import {
    IUnifiedDocumentEntry,
    JSONValuesPrimitive,
} from "@/lib/data-source-picker/types"
import { PathSegment } from "@/lib/data-source-picker/json-path"

type ExcludeSubType<Base, Condition> = Pick<
    Base,
    {
        [Key in keyof Base]: Base[Key] extends Condition ? never : Key
    }[keyof Base]
>

export class UnifiedDocumentEntry implements IUnifiedDocumentEntry {
    arrayElement: boolean
    children: IUnifiedDocumentEntry[]
    key: string
    observedValues: Map<JSONValuesPrimitive, number>
    path: PathSegment[]
    timesObserved: number

    constructor({
        arrayElement,
        children,
        key,
        observedValues,
        path,
        timesObserved,
    }: ExcludeSubType<IUnifiedDocumentEntry, Function>) {
        this.arrayElement = arrayElement
        this.children = children
        this.key = key
        this.observedValues = observedValues
        this.path = path
        this.timesObserved = timesObserved
    }

    isLeaf(): boolean {
        return this.children.length === 0
    }

    isArray(): boolean {
        return (
            this.children.length > 0 &&
            this.children.every((child) => child.arrayElement)
        )
    }
}
