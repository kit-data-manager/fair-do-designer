from main import *

#Example user code to do some linter checks:
RECORD_DESIGNS.append(
    RecordDesign()
        .setId(lambda json: str(jsonpath.findall("$.id", json)[0]) if jsonpath.findall("$.id", json) else "")
        .setPid(lambda json: str(jsonpath.findall("$.id", json)[0]) if jsonpath.findall("$.id", json) else "")
        .addAttribute("name", lambda json: str(jsonpath.findall("$.name", json)[0]) if jsonpath.findall("$.name", json) else "")
        .addAttribute("description", lambda json: str(jsonpath.findall("$.description", json)[0]) if jsonpath.findall("$.description", json) else "")
)
