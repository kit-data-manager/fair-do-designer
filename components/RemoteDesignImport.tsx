"use client"

import { Suspense, useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { isValidUrl } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function RemoteDesignImport() {
    return (
        <Suspense>
            <InnerRemoteDesignImport />
        </Suspense>
    )
}

function InnerRemoteDesignImport() {
    const params = useSearchParams()
    const [remoteDesignImportURL, setRemoteDesignImportURL] = useState<string>()
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const setShowModalInterceptor = useCallback(
        (value: boolean) => {
            // Remove the remoteDesignImport parameter from the URL if the user closes the import modal
            if (!value) {
                const newParams = new URLSearchParams(params)
                newParams.delete("remoteDesignImport")
                router.push(`${pathname}?${newParams.toString()}`)
            }

            setShowModal(value)
        },
        [params, pathname, router],
    )

    if (params.has("remoteDesignImport") && !remoteDesignImportURL) {
        const url = params.get("remoteDesignImport")
        if (url && isValidUrl(url)) {
            setRemoteDesignImportURL(url)
            setShowModal(true)
        }
    }

    return (
        <>
            <Dialog open={showModal} onOpenChange={setShowModalInterceptor}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Design</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to import a FAIR DO Design
                            from the following destination? Only import designs
                            from trusted sources.
                        </DialogDescription>
                    </DialogHeader>
                    You are about to import a Design from the following URL:
                    <span className="font-mono">{remoteDesignImportURL}</span>
                    Only import Designs from sources that you trust. Are you
                    sure you want to continue?
                    <DialogFooter>
                        <Button
                            variant={"secondary"}
                            onClick={() => setShowModalInterceptor(false)}
                        >
                            Cancel
                        </Button>
                        <Button>Yes, I am sure</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
