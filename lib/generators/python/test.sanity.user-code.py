from main import *

#Example user code to do some linter checks:
RECORD_DESIGNS.append(
    RecordDesign()
        .setId(lambda: str(jsonpath.findall("$.id", current_source_json)[0]) if jsonpath.findall("$.id", current_source_json) else "")
        .setPid(lambda: str(jsonpath.findall("$.id", current_source_json)[0]) if jsonpath.findall("$.id", current_source_json) else "")
        .addAttribute("name", lambda: str(jsonpath.findall("$.name", current_source_json)[0]) if jsonpath.findall("$.name", current_source_json) else "")
        .addAttribute("description", lambda: str(jsonpath.findall("$.description", current_source_json)[0]) if jsonpath.findall("$.description", current_source_json) else "")
)
