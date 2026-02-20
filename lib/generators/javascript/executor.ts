// ---Basic-types-------------------------------------------------
type Primitive = string | boolean | number
// ---Types-for-designs-------------------------------------------
type JsonType = string | Array<any> | Record<string, any>
type Eval<T> = () => T
type EvalPrimitive = Eval<Primitive>

// ---Types-for-backlink-inference--------------------------------------- //
class Reaction {
    receiver: string
    backward_link_type: string

    constructor(receiver: string, backward_link_type: string) {
        this.receiver = receiver
        this.backward_link_type = backward_link_type
    }
}

type ForwardLink = string
type Receiver = string
type Condition = [ForwardLink, Receiver]
type InferenceRules = Map<Condition, Reaction>

class BackwardLinkFor {
    private _forward_link_type: ForwardLink

    constructor(forward_link_type: ForwardLink) {
        this._forward_link_type = forward_link_type
    }

    get_forward_link_type(): ForwardLink {
        return this._forward_link_type
    }
}
// -------------------------------------------------------------------- //

function log(value: any, desc: any): void {
    console.log(desc, value)
}

type JsonDocument = any
type InputProvider = Array<JsonDocument>

class PidRecord {
    /**
     * Collects information about a single record
     * and serializes it into a format for the Typed PID Maker.
     */
    private _id: string = ""
    private _pid: string = ""
    private _tuples: Set<[string, Primitive]> = new Set()

    setPid(pid: string): this {
        this._pid = pid
        return this
    }

    setId(id: string): this {
        this._id = id
        return this
    }

    getId(): string {
        return this._id
    }

    addAttribute(a: string, b: Primitive | Primitive[] | null): this {
        if (b === null) {
            return this
        }
        if (Array.isArray(b)) {
            for (const item of b) {
                this.addAttribute(a, item)
            }
            return this
        } else {
            this._tuples.add([a, b])
        }
        return this
    }

    contains(tuple: [string, Primitive]): boolean {
        for (const t of this._tuples) {
            if (t[0] === tuple[0] && t[1] === tuple[1]) {
                return true
            }
        }
        return false
    }

    toSimpleJSON(): Record<string, any> {
        const record: Array<{ key: string; value: Primitive }> = Array.from(
            this._tuples,
        ).map(([key, value]) => ({
            key,
            value,
        }))
        const result: Record<
            string,
            Array<Record<string, Primitive>> | string
        > = { record: record }

        if (this._pid && this._pid !== "") {
            result["pid"] = this._pid
        } else {
            // if no pid is set, we use the id as pid,
            // so the Typed PID Maker can use the local identifier
            // to connect the different records
            result["pid"] = this._id
        }
        return result
    }
}

class RecordDesign {
    private _id: Eval<string> = () => ""
    private _pid: Eval<string> = () => ""
    // key -> lambda: value
    private _attributes: Map<string, Eval<unknown>[]> = new Map()
    // Set of (forward_link_type, backward_link_type)
    private _backlinks: Set<[string, string]> = new Set()
    // If true, apply() shall skip the creation of a record.
    private _skipCondition: Eval<boolean> = () => false

    setId(id: Eval<string>): this {
        this._id = id
        return this
    }

    setPid(pid: Eval<string>): this {
        this._pid = pid
        return this
    }

    addAttribute(key: string, value: EvalPrimitive | BackwardLinkFor): this {
        if (isBackwardLinkFor(value)) {
            this.addBacklink(value.get_forward_link_type(), key)
        } else {
            if (!this._attributes.has(key)) {
                this._attributes.set(key, [])
            }
            this._attributes.get(key)!.push(value)
        }
        return this
    }

    setSkipCondition(condition: Eval<boolean>): this {
        this._skipCondition = condition
        return this
    }

    addBacklink(forward_link_type: string, backward_link_type: string): this {
        this._backlinks.add([forward_link_type, backward_link_type])
        return this
    }

    /**
     * Applies the given JSON to this design and returns a PidRecord.
     * @param json The JSON to apply to this design.
     * @returns a record instance
     */
    apply(json: JsonType): [PidRecord, InferenceRules] | null {
        current_source_json = json

        if (this._skipCondition()) {
            return null
        }

        const record: PidRecord = new PidRecord()
        // errors may occur here, but as IDs are critical, we do not catch them.
        record.setId(this._id())
        record.setPid(this._pid())

        for (const [key, lazyValues] of this._attributes.entries()) {
            console.log(
                "get",
                lazyValues.length,
                "potential values for attribute",
                key,
            )
            for (const lazyValue of lazyValues) {
                try {
                    const value: any = lazyValue()
                    record.addAttribute(key, value)
                    console.log("    set value", value)
                } catch (e) {
                    // Errors known to be fatal
                    const fatalErrors: any[] = [
                        /*JSONPathSyntaxError, RelativeJSONPointerSyntaxError*/
                    ]
                    // Errors known to be tolerable generally
                    const tolerableErrors: any[] = [
                        /*JSONPathError, JSONPointerError*/
                    ]

                    const isFatal = fatalErrors.some(
                        (errorType) => e instanceof errorType,
                    )
                    const isTolerable = tolerableErrors.some(
                        (errorType) => e instanceof errorType,
                    )

                    if (!isFatal && isTolerable) {
                        console.log(
                            "    SKIP ATTRIBUTE: Can not retrieve value for",
                            key,
                            ", because of JSONPath error:",
                            e,
                        )
                    } else {
                        // all other exceptions will be propagated and stop the processing of all records.
                        console.log(
                            "    ERROR: Can not retrieve value for",
                            key,
                            ", because:",
                            e,
                        )
                        throw e
                    }
                }
            }
        }

        const rules: InferenceRules = new Map()
        for (const [forward_link_type, backward_link_type] of this._backlinks) {
            rules.set(
                [forward_link_type, record.getId()],
                new Reaction(record.getId(), backward_link_type),
            )
        }
        return [record, rules]
    }
}

function isBackwardLinkFor(value: unknown): value is BackwardLinkFor {
    return (
        value !== null &&
        typeof value === "object" &&
        "get_forward_link_type" in value
    )
}

/*
A function that executes a design must assign the current JSON to this global variable.
This is a workaround to allow the design to access the current JSON in any case the user
intends to use it. This is not a good practice, but it is the only way to allow users to
define their own functions that can access the current JSON. This is requied because
users may define functions and may use a "read from json" block in them. These blocks
are using this variable to refer to the current JSON.
*/
let current_source_json: JsonType = ""

/**
 * This class is responsible for executing the record designs
 * and creating records from JSON input.
 * It processes the input files, applies the designs, and sends
 * the resulting records to the Typed PID Maker API.
 */
export class Executor {
    private INPUT: InputProvider
    private RECORD_DESIGNS: RecordDesign[] = []
    private RECORD_GRAPH: Map<string, PidRecord> = new Map()
    // This is the place to store information about backlink inference from the records.
    // Condition(forward_link_type, receiver_id) => Reaction(receiver_id, backward_link_type)
    private INFERENCE_MATCHES_DB: InferenceRules = new Map()

    constructor(args: InputProvider) {
        this.INPUT = args
    }

    /**
     * Adds a design to the executor.
     */
    addDesign(design: RecordDesign): this {
        this.RECORD_DESIGNS.push(design)
        return this
    }

    /**
     * Executes the designs and creates records from the input JSON files.
     */
    execute(): Array<Record<string, any>> {
        console.log("Amount of designs:", this.RECORD_DESIGNS.length)

        this._apply_inputs_to_designs()
        this._apply_inference_rules_to_records()
        return Object.values(this.RECORD_GRAPH).map((record) => record.toSimpleJSON());
    }

    private _apply_inference_rules_to_records(): void {
        for (const sender_id of this.RECORD_GRAPH.keys()) {
            const sender = this.RECORD_GRAPH.get(sender_id)!
            const matched_conditions = Array.from(
                this.INFERENCE_MATCHES_DB.keys(),
            ).filter((condition) => sender.contains(condition))
            for (const condition of matched_conditions) {
                const reaction = this.INFERENCE_MATCHES_DB.get(condition)!
                const receiver = this.RECORD_GRAPH.get(reaction.receiver)!
                receiver.addAttribute(reaction.backward_link_type, sender_id)
            }
        }
    }

    private _apply_inputs_to_designs(): void {
        /**
         * Applies the input files to the designs and creates records.
         * This will generate records and inference rules which will be stored in this class's state.
         */
        for (const design of this.RECORD_DESIGNS) {
            for (const input_file of this.INPUT) {
                try {
                    console.log("Processing input file", input_file)
                    const json_data: JsonType = JSON.parse(input_file) // Assuming input_file is JSON string

                    const maybe_record = design.apply(json_data)
                    if (maybe_record !== null) {
                        const [sender, inference_rules] = maybe_record
                        console.log(
                            `Created record with ID: "${sender.getId()}"`,
                        )
                        // Store the record in the graph
                        this.RECORD_GRAPH.set(sender.getId(), sender)
                        // merge rules into DB
                        for (const [key, value] of inference_rules) {
                            this.INFERENCE_MATCHES_DB.set(key, value)
                        }
                    }
                } catch (error) {
                    console.error("Error processing file:", error)
                    throw error
                }
            }
            console.log("No more input files.")
        }
    }
}
