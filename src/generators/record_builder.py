class PidRecord:
    def __init__(self):
        self._id = ""
        self._pid = ""
        self._tuples = set()

    def setPid(self, pid):
        self._pid = pid
        return self

    def setId(self, id):
        self._id = id
        return self

    def add(self, a: str, b: str | list):
        if not b or b is None:
            return self
        if isinstance(b, list):
            for item in b:
                if item is None:
                    continue
                self._tuples.add((a, item))
        else:
            self._tuples.add((a, b))
        return self

    def toSimpleJSON(self):
        result = {"entries": list(self._tuples)}
        if self._pid and self._pid != "":
            result["pid"] = self._pid
        return result

records_graph = []

def createSingleRecord(pidrecord):
    # TODO implement request to a typed PID Maker instance
    # pseudocode:
    # if pidrecord.hasPid: update(pidrecord)
    # else: create(pidrecord)
    # onError: to be decided
    return "pid-of-pidrecord"
