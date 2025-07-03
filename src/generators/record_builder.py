import sys
from typing import Dict, Set, List, Tuple, Callable, TypeVar, Any

T = TypeVar('T')
Lazy = Callable[[], T]
LazyPrimitive = Lazy[str] | Lazy[int] | Lazy[float] | Lazy[bool]

class CliInputProvider:
    """
    Example usage: python script.py file1.json my_files*.json
    """
    def __init__(self, args: List[str]):
        self._args = args

    def nextInputFile(self) -> str:
        if not self._args:
            return None
        next_file = self._args.pop(0)
        if next_file.endswith(".json"):
            return next_file
        else:
            raise ValueError(f"Expected a JSON file, got: {next_file}")

INPUT = CliInputProvider(sys.argv[1:])

class RecordDesign:
    def __init__(self):
        self._id: Lazy[str] = lambda: ""
        self._pid: Lazy[str] = lambda: ""
        self._attributes: Set[Tuple[str, Lazy[Any]]] = set()

    def addAttribute(self, key: str, value: Lazy[Any]):
        if key not in self.attributes:
            self.attributes[key] = []
        self.attributes[key].append(value)


class BacklinkRule:
    def __init__(self, onKey: str, onValue: list, thenId: str, thenKey: str, thenValue: str):
        self.onKey = onKey
        self.onValue = onValue
        self.thenId = thenId
        self.thenKey = thenKey
        self.thenValue = thenValue

    def matches(self, key: str, value: str) -> bool:
        return self.onKey == key and self.onValue == value
    
    def apply(self, pidRecord: 'PidRecord') -> bool:
        isSelfReference = self.thenId == self.thenValue
        if isSelfReference:
            pass


class BacklinkRuleSet:
    def __init__(self):
        self._rules: Dict[Tuple[str, str], BacklinkRule] = dict()
        self._actions: List[Tuple[str, str, str]] = list()
    
    def add(self, onKey: str, onValue: list, thenKey: str, thenValue: str):
        rule = BacklinkRule(onKey, onValue, thenKey, thenValue)
        self._rules[tuple(onKey, onValue)] = rule

    def check(self, key: str, value: str) -> bool:
        rule = self._rules.get((key, value))
        if rule:
            self._actions.append((rule.onKey, rule.thenKey, rule.thenValue))
        

backlink_rules = BacklinkRuleSet()

class PidRecord:
    def __init__(self):
        self._id = ""
        self._pid = ""
        self._tuples: Set[Tuple[str, Any]] = set()

    def setPid(self, pid):
        self._pid = pid
        return self

    def setId(self, id):
        self._id = id
        return self

    def add(self, a: str, b: LazyPrimitive | Lazy[List[LazyPrimitive]]):
        if not b or b is None:
            return self
        if isinstance(b, list):
            for item in b:
                self.add((a, item))
            return
        else:
            self._tuples.add((a, b))

        if (a, b) in backlink_rules:
            backlink_rule = backlink_rules[(a, b)]
            if backlink_rule.apply(self):
                pass # TODO logging?

        return self

    def toSimpleJSON(self):
        result = {"entries": list(self._tuples)}
        if self._pid and self._pid != "":
            result["pid"] = self._pid
        return result
    
def log(value: any, name: str):
    print(f"logging value of {name}: {value}")

records_graph = []

def createSingleRecord(pidrecord):
    # TODO implement request to a typed PID Maker instance
    # pseudocode:
    # if pidrecord.hasPid: update(pidrecord)
    # else: create(pidrecord)
    # onError: to be decided
    return "pid-of-pidrecord"
