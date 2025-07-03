"""
This file is currently a simple file for manual tests
and brainstorming purposes which can be quickly done
using linters / IDEs. It is not (yet) intended to be
run as a script or included in the transpilation
process.
"""
from record_builder import records_graph, PidRecord

records_graph.append( PidRecord()
    .setPid("12345")
    .setId("67890")
    .add("key1", lambda: "value1")
    .add("key2", ["value2a", "value2b"])
    .add("key3", None)
    .add("key4", ["value4a", None, "value4b"])
)
