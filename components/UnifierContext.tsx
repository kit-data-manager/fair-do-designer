"use client"

import { DocumentEntry, Unifier } from "@/lib/data-source-picker/json-unifier"
import { createContext, ReactNode, useCallback, useRef, useState } from "react"

export const UnifierContext = createContext<{
    unifier: Unifier | null
    flat: DocumentEntry[]
    updateFlat: () => void
    totalDocumentCount: number
}>({
    unifier: null,
    flat: [],
    updateFlat: () => {},
    totalDocumentCount: 0,
})

export function UnifierProvider({ children }: { children: ReactNode }) {
    const unifier = useRef(new Unifier())
    const [flat, setFlat] = useState<DocumentEntry[]>([])
    const [totalDocumentCount, setTotalDocumentCount] = useState(0)

    const updateFlat = useCallback(() => {
        setFlat(unifier.current.getFlattenedDocument())
        setTotalDocumentCount(
            unifier.current.getUnifiedDocument().timesObserved,
        )
    }, [])

    return (
        <UnifierContext.Provider
            value={{
                unifier: unifier.current,
                flat,
                updateFlat,
                totalDocumentCount,
            }}
        >
            {children}
        </UnifierContext.Provider>
    )
}
