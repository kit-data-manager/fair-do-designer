import sys
from typing import Dict, Set, List, Tuple, Callable, TypeVar, Any, Sequence, Mapping
# unused, but required by user generated code:
import jsonpath # pyright: ignore[reportUnusedImport]

Primitive = str | bool | int | float
# ---Types-for-designs------------------------------------------- #
JsonType = str | Sequence[Any] | Mapping[str, Any]
T = TypeVar('T')
Eval = Callable[[], T]
EvalPrimitive = Eval[str] | Eval[int] | Eval[float] | Eval[bool]

# ---Types-for-backlink-inference--------------------------------------- #
class Reaction:
    def __init__(self, receiver: str, backward_link_type: str) -> None:
        self.receiver = receiver
        self.backward_link_type = backward_link_type

# forward link-----v    v---receiver
Condition = Tuple[str, str]
InferenceRules = Dict[Condition, Reaction]
class BackwardLinkFor:
    def __init__(self, forward_link_type: str) -> None:
        self._forward_link_type = forward_link_type
    
    def get_forward_link_type(self) -> str:
        return self._forward_link_type
# ---------------------------------------------------------------------  #

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
        self._tuples: Set[Tuple[str, Primitive]] = set()

    def setPid(self, pid: str):
        self._pid = pid
        return self

    def setId(self, id: str):
        self._id = id
        return self
    
    def getId(self) -> str:
        return self._id

    def addAttribute(self, a: str, b: Primitive | List[Primitive] | None):
        if b is None:
            return self
        if isinstance(b, List):
            for item in b:
                self.addAttribute(a, item)
            return
        else:
            self._tuples.add((a, b))
        return self
    
    def contains(self, tuple: Tuple[str, Primitive]) -> bool:
        return tuple in self._tuples
        
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
        # key -> lambda: value
        self._attributes: Dict[str, List[Eval[Any]]] = dict()
        # Set of (forward_link_type, backward_link_type)
        self._backlinks: Set[Tuple[str, str]] = set()

    def setId(self, id: Eval[str]):
        self._id = id
        return self
    
    def setPid(self, pid: Eval[str]):
        self._pid = pid
        return self

    def addAttribute(self, key: str, value: Eval[Any] | BackwardLinkFor):
        if isinstance(value, BackwardLinkFor):
            self.addBacklink(value.get_forward_link_type(), key)
        else:
            if key not in self._attributes.keys():
                self._attributes[key] = [value]
                pass
            self._attributes[key].append(value)
        return self
    
    def addBacklink(self, forward_link_type: str, backward_link_type: str):
        self._backlinks.add((forward_link_type, backward_link_type))
    
    def apply(self, json: JsonType) -> Tuple[PidRecord, InferenceRules]:
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
                record.addAttribute(key, value)
        
        rules: InferenceRules = {}
        for relation in self._backlinks:
            forward_link_type = relation[0]
            backward_link_type = relation[1]
            rules[forward_link_type, record.getId()] = Reaction(record.getId(), backward_link_type)
        return record, rules

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
