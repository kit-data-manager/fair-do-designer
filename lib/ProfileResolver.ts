import { PID, PIDDataType } from "@kit-data-manager/pid-component"
import { z } from "zod/mini"

const locationType = new PID("10320", "loc")
const typeMap = new Map<PID, unknown>()
const unresolvables = new Set<PID>()

export class ProfileResolver extends PIDDataType {
    /**
     * Tries to resolve a PID to a PIDDataType object.
     * @return Promise<PIDDataType|undefined> The PIDDataType object if the PID could be resolved, undefined otherwise.
     * @param pid
     */
    public static async resolveDataTypeJSON(pid: PID) {
        // Check if PID is already resolved
        if (typeMap.has(pid)) return typeMap.get(pid)

        // Check if PID is resolvable
        if (!pid.isResolvable()) {
            console.debug(
                `PID ${pid.toString()} has been marked as unresolvable`,
            )
            return undefined
        }

        // Resolve PID and make sure it isn't undefined
        const pidRecord = await pid.resolve()
        if (pidRecord === undefined) {
            console.debug(
                `PID ${pid.toString()} could not be resolved via the API`,
            )
            unresolvables.add(pid)
            return undefined
        }

        // Create a temporary object to store the information
        const tempDataType: {
            name: string
            description: string
            regex?: RegExp
            redirectURL: string | null
            ePICJSON: unknown
        } = { name: "", description: "", redirectURL: "", ePICJSON: {} }

        // Check if there is a reference to a ePIC instance via a 10320/Loc type and resolve it
        for (let i = 0; i < pidRecord.values.length; i++) {
            const currentValue = pidRecord.values[i]
            if (
                currentValue.type === locationType ||
                currentValue.type.toString() === locationType.toString()
            ) {
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(
                    currentValue.data.value as string,
                    "text/xml",
                )
                // Get all locations from the XML specified in 10320/loc
                const xmlLocations = xmlDoc.getElementsByTagName("location")
                for (let j = 0; j < xmlLocations.length; j++) {
                    // Extract link
                    const newLocation: {
                        href: string | null
                        weight?: number
                        view: string | null
                        resolvedData: unknown
                    } = {
                        href: xmlLocations[j].getAttribute("href"),
                        weight: undefined,
                        view: null,
                        resolvedData: undefined,
                    }

                    // Extract weight
                    try {
                        newLocation.weight = parseInt(
                            xmlLocations[j].getAttribute("weight") ?? "0",
                        )
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (_ignored) {
                        /* empty */
                    }

                    // Extract view e.g. json or html
                    try {
                        newLocation.view = xmlLocations[j].getAttribute("view")
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (ignored) {
                        /* empty */
                    }

                    // Try to resolve the data from the link
                    try {
                        if (newLocation.view === "json") {
                            if (!newLocation.href) return

                            // if view is json then cachedFetch the data from the link (ePIC data type registry) and save them into the temp object
                            try {
                                const res = await fetch(newLocation.href)
                                newLocation.resolvedData = await res.json()

                                tempDataType.ePICJSON = newLocation.resolvedData

                                const name = z
                                    .object({
                                        name: z.string(),
                                    })
                                    .safeParse(newLocation.resolvedData)
                                const description = z
                                    .object({
                                        description: z.string(),
                                    })
                                    .safeParse(newLocation.resolvedData)

                                if (name.success)
                                    tempDataType.name = name.data.name
                                if (description.success)
                                    tempDataType.description =
                                        description.data.description
                            } catch (e) {
                                console.error(
                                    "Tried to fetch data from " +
                                        newLocation.href +
                                        " but failed: " +
                                        e,
                                )
                            }
                        } else {
                            // if view is html set the redirect URL (activated on user click) to the link
                            tempDataType.redirectURL = newLocation.href
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (ignored) {
                        /* empty */
                    }
                }
            }
        }

        // Create a new PIDDataType object from the temp object
        try {
            typeMap.set(pid, tempDataType.ePICJSON)
            return tempDataType.ePICJSON
        } catch (e) {
            console.error(e)
            return undefined
        }
    }
}
