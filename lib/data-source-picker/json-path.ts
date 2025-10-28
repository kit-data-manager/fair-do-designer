/**
 * Represents a path to a specific element in a JSON document. Can be serialized to a JSON Path and a JSON Pointer.
 */
export type PathSegment = {
    type: "key" | "index"
    value: string
}

/**
 * Parses a JSON Path to a {@link PathSegment} array.
 * @param path a correctly formatted JSON Path
 */
export function pathToPathSegments(path: string): PathSegment[] {
    let val = path.replaceAll("]", "")
    val = val.replaceAll("[", ".[")

    return val
        .split(".")
        .map((item) =>
            item.startsWith("[")
                ? { type: "index", value: item.slice(1) }
                : { type: "key", value: item },
        )
}

function isNumber(test: string) {
    return /[0-9]+/.test(test) && !isNaN(parseInt(test))
}

/**
 * Parses a JSON Pointer to a {@link PathSegment} array.
 * @param pointer a correctly formatted JSON Pointer
 */
export function pointerToPathSegments(pointer: string): PathSegment[] {
    const path: PathSegment[] = pointer
        .slice(1)
        .split("/")
        .map((item) =>
            isNumber(item)
                ? { type: "index", value: item }
                : { type: "key", value: item },
        )

    return [{ type: "key", value: "$" }, ...path]
}

/**
 * Serializes a {@link PathSegment} array to a JSON Path.
 * @param segments
 */
export function pathSegmentsToPath(segments: PathSegment[]): string {
    return segments
        .map((item) =>
            item.type === "key" ? "." + item.value : "[" + item.value + "]",
        )
        .join("")
        .slice(1) // remove leading dot
}

/**
 * Serializes a {@link PathSegment} array to a JSON Pointer.
 * @param segments
 */
export function pathSegmentsToPointer(segments: PathSegment[]): string {
    return segments
        .slice(1) // Remove the $ root segment
        .map((item) => "/" + item.value)
        .join("")
}

/**
 * Returns true iff the two paths are equal.
 * @param a
 * @param b
 */
export function pathMatches(a: PathSegment[], b: PathSegment[]) {
    if (a.length !== b.length) return false
    return a.every((v, i) => b[i].value === v.value && b[i].type === v.type)
}

/**
 * Returns true iff sub and path are equal for the length of sub, and the last index of path is an index.
 * @param path The path targeting an index in an array
 * @param sub the subpath that targets some element in the on the way to the array
 */
export function subPathMatchesArray(path: PathSegment[], sub: PathSegment[]) {
    if (path.length <= sub.length) return false
    return (
        sub.every(
            (v, i) => path[i].type === v.type && path[i].value === v.value,
        ) && path[sub.length].type === "index"
    )
}
