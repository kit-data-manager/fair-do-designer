/**
 * Returns `either` if it is somehow a valid value, otherwise executes and returns `otherwise`.
 *
 * @param either - A function that returns the value to check
 * @param otherwiseFn - A function that returns the fallback value
 * @returns `either` if it is not falsy/empty, otherwise the result of `otherwiseFn`
 */
function otherwise<T = any>(either: () => any, otherwiseFn: () => any): T {
    let eitherResult: any

    try {
        eitherResult = either()
    } catch (e) {
        console.log(
            "    USE OTHER: First value in otherwise block threw exception: ",
            e,
        )
        return otherwiseFn()
    }

    // Convert string representations of "nothing" to actual null
    if (typeof eitherResult === "string") {
        const normalized = eitherResult.trim().toLowerCase()
        if (["null", "", "()", "[]", "{}"].includes(normalized)) {
            eitherResult = null
        }
    }

    // Check various "empty" conditions
    const isNone = eitherResult === null || eitherResult === undefined
    const isEmptyArray =
        Array.isArray(eitherResult) && eitherResult.length === 0
    const isEmptyishString =
        typeof eitherResult === "string" &&
        ["null", "", "()", "[]", "{}"].includes(
            eitherResult.trim().toLowerCase(),
        )

    const isOk = !isNone && !isEmptyArray && !isEmptyishString

    return isOk ? eitherResult : otherwiseFn()
}

function stopWithFail(message: string | null | undefined) {
    const finalMessage =
        !message || message === "" ? "No error message provided" : message
    trace("error_block", () => {throw new Error("Design stopped with error: " + finalMessage)})
}

function trace(block_id: string, callback: () => any): any {
    // Intention: Easy to parse format in case we want to know which block
    // caused certain logs, even if not an error.
    console.log("fdodesigner::trace-block-start=", block_id)
    try {
        const result = callback()
        console.log("fdodesigner::trace-block-end=", block_id, result)
        return result
    } catch (e) {
        // Build stacktrace so we can easily get back to the causing block.
        throw new BlocklyError(block_id, e)
    }
}

class BlocklyError extends Error {
    block_id: string
    original_error: any
    constructor(block_id: string, original_error: any) {
        super(`Error in block ${block_id}: ${original_error}`)
        this.block_id = block_id
        this.original_error = original_error
    }
}
