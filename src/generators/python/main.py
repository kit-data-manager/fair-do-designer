import sys
from typing import Dict, Set, List, Tuple, Callable, TypeVar, Any, Sequence, Mapping
import jsonpath # type: ignore

JsonType = str | Sequence[Any] | Mapping[str, Any]
T = TypeVar('T')
Eval = Callable[[], T]
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
    """
    Collects information about a single record
    and serializes it into a format for the Typed PID Maker.
    """
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

    def addAttribute(self, a: str, b: str | List[str] | None):
        if not b and not isinstance(b, list):
            return self
        if isinstance(b, list):
            for item in b:
                self.addAttribute(a, item)
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
    """
    With an API similar to PidRecord,
    this class collect information about how to build records
    given a JSON file and functions which extract information
    from the JSON file.

    Expects the JSON document to be globally available as
    "current_source_json". The given functions have to rely
    on this.
    """
    def __init__(self):
        self._id: Eval[str] = lambda: ""
        self._pid: Eval[str] = lambda: ""
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
        """
        Applies the given JSON to this design and returns a PidRecord.
        """

        global current_source_json
        current_source_json = json

        record: PidRecord = PidRecord()
        record.setId(self._id())
        record.setPid(self._pid())
        for key, lazy_values in self._attributes.items():
            for lazy_value in lazy_values:
                value = lazy_value()
                if value is not None:
                    record.addAttribute(key, value)
        return record

"""
A function that executes a design must assign the current JSON to this global variable.
This is a workaround to allow the design to access the current JSON in any case the user
intends to use it. This is not a good practice, but it is the only way to allow users to
define their own functions that can access the current JSON. This is requied because
users may define functions and may use a "read from json" block in them. These blocks
are using this variable to refer to the current JSON.
"""
current_source_json: JsonType = "{}"

INPUT = CliInputProvider(sys.argv[1:])
RECORD_DESIGNS: list[RecordDesign] = []

#---8<---user-defined-code---8<---
