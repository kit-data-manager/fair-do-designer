"use client"

import { Workspace } from "@/components/Workspace"
import { OutputPane } from "@/components/OutputPane"
import { InputPane } from "@/components/InputPane"

export default function Home() {
    return (
        <div id="pageContainer">
            <OutputPane />
            <Workspace />
            <InputPane />
        </div>
    )
}
