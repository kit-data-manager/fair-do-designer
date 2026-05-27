import {
    PathSegment,
    pathSegmentsToPointer,
} from "@/lib/data-source-picker/json-path"

/**
 * From an array of paths, returns the shortest unique partial pointers.
 * @param paths Array of paths to shorten. Each path is an array of path segments.
 * @returns Array of shortest unique partial pointers.
 */
export function shortenPathsUnique(paths: PathSegment[][]) {
    const base = paths.map((p) => ({
        path: p,
        length: 1,
        fullPointer: pathSegmentsToPointer(p),
    }))
    let nextIteration = base.slice()

    while (nextIteration.length > 0) {
        const { conflicted, mapping } = findConflicted(nextIteration)
        const promoteToNextIteration = []

        for (const candidate of nextIteration) {
            const partialPointer = mapping.get(candidate.fullPointer)!
            if (conflicted.has(partialPointer)) {
                candidate.length += 1
                promoteToNextIteration.push(candidate)
            }
        }

        nextIteration = promoteToNextIteration.slice()
    }

    return base.map(getPartialPointer)
}

/**
 * Generates a partial pointer string from the provided part object. The partial pointer is constructed from the specified number of path segments, starting from the back of the path.
 *
 * @param {Object} part An object containing information to generate the partial pointer.
 * @param {PathSegment[]} part.path The array of path segments used to construct the pointer.
 * @param {number} part.length The number of segments from the start that will be included in the resulting partial pointer.
 * @return A partial pointer string constructed from the specified number of path segments, formatted for prettier output.
 */
function getPartialPointer(part: { path: PathSegment[]; length: number }) {
    return (
        part.path
            .slice()
            // Rename root segment from "$" to "" to make prettier partial pointer
            // e.g. "/title" instead of "$/title"
            .map((v, i) => (i === 0 ? { ...v, value: "" } : (v as PathSegment)))
            .reverse()
            .slice(0, part.length)
            .reverse()
            .map((p) => p.value)
            .join("/")
    )
}

/**
 * From an array of paths, find all paths that have the same partial pointer. The `length` is the current length of the paths partial pointer (from the back)
 * @param parts Array of paths to find conflicts in. Each part has the path, the current length of the partial path, as well as the full pointer (this is a performance optimization, the full pointer can always be calculated from the path)
 */
function findConflicted(
    parts: { path: PathSegment[]; length: number; fullPointer: string }[],
) {
    // Partial pointers are added here the first time they are encountered
    const firstPass = new Set<string>()
    // Partial pointers are added here if they were encountered twice (conflict)
    const secondPass = new Set<string>()
    // Mapping from full pointer to partial pointer, to recover the full pointers from the list of conflicting partial pointers
    // In case of a conflict, multiple unique full pointers map to the same partial pointer
    const mapping = new Map<string, string>()

    for (const part of parts) {
        const partialPointer = getPartialPointer(part)
        mapping.set(part.fullPointer, partialPointer)

        if (firstPass.has(partialPointer)) {
            secondPass.add(partialPointer)
        } else {
            firstPass.add(partialPointer)
        }
    }

    return { conflicted: secondPass, mapping }
}
