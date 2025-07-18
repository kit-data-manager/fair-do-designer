"use client"

import { Workspace } from "@/components/Workspace"
import { OutputPane } from "@/components/OutputPane"
import { Button } from "@/components/ui/button"
import { defineCustomElements } from "json-picker-stencil/loader"
import { useEffect } from "react"

export default function Home() {
    useEffect(() => {
        defineCustomElements()
    }, [])

    return (
        <div id="pageContainer">
            <OutputPane />
            <Workspace />
            <div className="grow w-[800px]">
                <div className="bg-muted p-2">
                    <h4 className="font-bold">Data Access</h4>
                </div>
                <div className="p-2">
                    <div className="">
                        <div className="flex gap-2 mb-2">
                            <Button variant="outline">Upload files</Button>
                            <Button variant="outline">Add example files</Button>
                            <Button variant="outline">Reset</Button>
                        </div>

                        <input
                            type="file"
                            className="hidden"
                            accept="application/json"
                            multiple
                        />
                        <div className="text-sm text-muted-foreground">
                            Hint: Use drag-and-drop to place Data Access blocks
                            in the workspace
                        </div>
                        <unified-document></unified-document>
                    </div>
                </div>
            </div>

            {/*<script>*/}
            {/*    const outputPane = document.getElementById('outputPane');*/}
            {/*    const btn = document.getElementById('collapseOutputPaneBtn');*/}
            {/*    btn.onclick = function() {*/}
            {/*    outputPane.classList.toggle('collapsed');*/}
            {/*    const collapsed = outputPane.classList.contains('collapsed');*/}
            {/*    btn.innerHTML = collapsed ? 'Show output pane' : 'Hide output pane';*/}
            {/*    btn.title = collapsed ? 'Show output pane' : 'Hide output pane';*/}
            {/*};*/}
            {/*</script>*/}
        </div>
    )
}
