import { create } from "zustand"
import { ReactNode } from "react"

/**
 * Represents an alert configuration with customizable properties for display and callbacks.
 */
export interface Alert {
    title: string
    message: string | ReactNode
    type: "error" | "success" | "info"
    id: string
    acceptButtonCallback?: (prompt?: string) => void
    acceptButtonText?: string
    closeButtonCallback?: () => void
    closeButtonText?: string
    hasPrompt?: boolean
    promptPrefill?: string
}

/**
 * AlertStore interface provides an abstraction for managing and interacting with a collection of alert messages.
 * It includes functionality to add, remove, and interact with alerts such as showing prompts and notifications.
 */
export interface AlertStore {
    alerts: Alert[]
    pop: () => void
    addAlert: (alert: Omit<Alert, "id">) => void
    alert: (
        title: string,
        message: string | ReactNode,
        type?: Alert["type"],
    ) => void
    prompt: (
        title: string,
        message: string | ReactNode,
        prefill?: string,
        type?: Alert["type"],
    ) => Promise<string | undefined>
}

/**
 * The `alertStore` is a Zustand store that manages a collection of alerts
 * and provides utility methods for manipulating those alerts.
 *
 * It supports creating and resolving alerts with optional prompts.
 */
export const alertStore = create<AlertStore>()((set, get) => ({
    alerts: [],
    pop() {
        const copy = get().alerts.slice()
        copy.shift()
        set({ alerts: copy })
    },
    addAlert(alert: Omit<Alert, "id">) {
        const copy = get().alerts.slice()
        copy.push({ id: Math.random().toString(), ...alert })
        set({ alerts: copy })
    },
    alert(title: string, message: string | ReactNode, type?: Alert["type"]) {
        get().addAlert({
            title,
            message,
            type: type ?? "info",
            acceptButtonText: "OK",
        })
    },
    prompt(
        title: string,
        message: string | ReactNode,
        prefill?: string,
        type?: Alert["type"],
    ) {
        return new Promise<string | undefined>((resolve) => {
            get().addAlert({
                title,
                message,
                type: type ?? "info",
                acceptButtonText: "OK",
                acceptButtonCallback: resolve,
                hasPrompt: true,
                closeButtonText: "Cancel",
                closeButtonCallback: () => resolve(undefined),
                promptPrefill: prefill,
            })
        })
    },
}))
