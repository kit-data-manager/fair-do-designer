import sys, json
from typing import Dict, Set, List, Tuple, Callable, TypeVar, Any, Sequence, Mapping
import jsonpath

JsonType = str | Sequence[Any] | Mapping[str, Any]
T = TypeVar('T')
Eval = Callable[[JsonType], T]
EvalPrimitive = Eval[str] | Eval[int] | Eval[float] | Eval[bool]

class CliInputProvider:
    """
    Example usage: python script.py file1.json my_files*.json
    """
    def __init__(self, args: List[str]):
        self._args = args

    def nextInputFile(self) -> str | None:
        if not self._args:
            return None
        next_file = self._args.pop(0)
        if next_file.endswith(".json"):
            return next_file
        else:
            raise ValueError(f"Expected a JSON file, got: {next_file}")

class PidRecord:
    def __init__(self):
        self._id: str = ""
        self._pid: str = ""
        self._tuples: Set[Tuple[str, Any]] = set()

    def setPid(self, pid: str):
        self._pid = pid
        return self

    def setId(self, id: str):
        self._id = id
        return self

    def add(self, a: str, b: str | List[str] | None):
        if not b and not isinstance(b, list):
            return self
        if isinstance(b, list):
            for item in b:
                self.add(a, item)
            return
        else:
            self._tuples.add((a, b))
        return self

    def toSimpleJSON(self):
        result: Dict[str, Any] = {"entries": list(self._tuples)}
        if self._pid and self._pid != "":
            result["pid"] = self._pid
        return result

class RecordDesign:
    def __init__(self):
        self._id: Eval[str] = lambda _: ""
        self._pid: Eval[str] = lambda _: ""
        self._attributes: Dict[str, List[Eval[Any]]] = dict()

    def setId(self, id: Eval[str]):
        self._id = id
        return self
    
    def setPid(self, pid: Eval[str]):
        self._pid = pid
        return self

    def addAttribute(self, key: str, value: Eval[Any]):
        if key not in self._attributes.keys():
            self._attributes[key] = [value]
            pass
        self._attributes[key].append(value)
        return self
    
    def apply(self, json: JsonType) -> PidRecord:
        record: PidRecord = PidRecord()
        record.setId(self._id(json))
        record.setPid(self._pid(json))
        for key, lazy_values in self._attributes.items():
            for lazy_value in lazy_values:
                value = lazy_value(json)
                if value is not None:
                    record.add(key, value)
        return record

INPUT = CliInputProvider(sys.argv[1:])
RECORD_DESIGNS: list[RecordDesign] = []
RECORD_DESIGNS.append(
    RecordDesign()
        .setId(lambda json: str(jsonpath.findall("$.id", json)[0]) if jsonpath.findall("$.id", json) else "")
        .setPid(lambda json: str(jsonpath.findall("$.id", json)[0]) if jsonpath.findall("$.id", json) else "")
        .addAttribute("name", lambda json: str(jsonpath.findall("$.name", json)[0]) if jsonpath.findall("$.name", json) else "")
        .addAttribute("description", lambda json: str(jsonpath.findall("$.description", json)[0]) if jsonpath.findall("$.description", json) else "")
)

RECORD_GRAPH: list[PidRecord] = []

for design in RECORD_DESIGNS:
    while True:
        input_file = INPUT.nextInputFile()
        if not input_file:
            break
        with open(input_file, 'r') as file:
            json_data: JsonType = json.load(file)
            record: PidRecord = design.apply(json_data)
            RECORD_GRAPH.append(record)
