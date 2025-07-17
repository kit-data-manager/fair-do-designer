import { Workspace } from "@/components/Workspace"
import { OutputPane } from "@/components/OutputPane"

export default function Home() {
    return (
        <div id="pageContainer">
            <OutputPane />
            <Workspace />
            <div className="jsonPickerWrapper">
                <div className="jsonPickerHeader">
                    <h4 className="jsonPickerHeading">Data Access</h4>
                </div>
                <div className="jsonPicker">
                    <div className="jsonPickerToolbar">
                        <button className="jsonUploadButton">
                            Upload files
                        </button>
                        <button className="jsonUseExamplesButton">
                            Add example files
                        </button>
                        <button className="jsonResetButton hidden">
                            Reset
                        </button>
                        <input
                            type="file"
                            className="jsonFileInput hidden"
                            accept="application/json"
                            multiple
                        />
                        <div className="jsonPickerHint">
                            Hint: Use drag-and-drop to place Data Access blocks
                            in the workspace
                        </div>
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
