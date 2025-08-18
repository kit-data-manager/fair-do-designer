import sys
from typing import Dict, Set, List, Tuple, Callable, TypeVar, Any, Sequence, Mapping, Self
import json

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
    def __init__(self) -> None:
        self._id: str = ""
        self._pid: str = ""
        self._tuples: Set[Tuple[str, Primitive]] = set()

    def setPid(self, pid: str) -> Self:
        self._pid = pid
        return self

    def setId(self, id: str) -> Self:
        self._id = id
        return self
    
    def getId(self) -> str:
        return self._id

    def addAttribute(self, a: str, b: Primitive | List[Primitive] | None) -> Self:
        if b is None:
            return self
        if isinstance(b, List):
            for item in b:
                self.addAttribute(a, item)
            return self
        else:
            self._tuples.add((a, b))
        return self
    
    def contains(self, tuple: Tuple[str, Primitive]) -> bool:
        return tuple in self._tuples
        
    def toSimpleJSON(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {"record": [{"key": key, "value": value} for (key, value) in self._tuples]}
        if self._pid and self._pid != "":
            result["pid"] = self._pid
        else:
            # if no pid is set, we use the id as pid,
            # so the Typed PID Maker can use the local identifier
            # to connect the different records
            result["pid"] = self._id
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
    def __init__(self) -> None:
        self._id: Eval[str] = lambda: ""
        self._pid: Eval[str] = lambda: ""
        # key -> lambda: value
        self._attributes: Dict[str, List[Eval[Any]]] = dict()
        # Set of (forward_link_type, backward_link_type)
        self._backlinks: Set[Tuple[str, str]] = set()

    def setId(self, id: Eval[str]) -> Self:
        self._id = id
        return self
    
    def setPid(self, pid: Eval[str]) -> Self:
        self._pid = pid
        return self

    def addAttribute(self, key: str, value: Eval[Any] | BackwardLinkFor) -> Self:
        if isinstance(value, BackwardLinkFor):
            self.addBacklink(value.get_forward_link_type(), key)
        else:
            if key not in self._attributes.keys():
                self._attributes[key] = [value]
                pass
            self._attributes[key].append(value)
        return self
    
    def addBacklink(self, forward_link_type: str, backward_link_type: str) -> Self:
        self._backlinks.add((forward_link_type, backward_link_type))
        return self
    
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

class Executor:
    """
    This class is responsible for executing the record designs and creating records from JSON input.
    It processes the input files, applies the designs, and sends the resulting records to the Typed PID Maker API.
    """

    def __init__(self) -> None:
        self.INPUT = CliInputProvider(sys.argv[1:])
        self.RECORD_DESIGNS: List[RecordDesign] = []
        self.RECORD_GRAPH: Dict[str, PidRecord] = {}
        # This is the place to store information about backlink inference from the records.
        #
        # Condition(forward_link_type, receiver_id) => Reaction(receiver_id, backward_link_type)
        self.INFERENCE_MATCHES_DB: InferenceRules = {}

    def addDesign(self, design: RecordDesign) -> Self:
        """
        Adds a design to the executor.
        """
        self.RECORD_DESIGNS.append(design)
        return self

    def execute(self) -> Self:
        """
        Executes the designs and creates records from the input JSON files.
        """
        print("Amount of designs:", len(self.RECORD_DESIGNS))

        self._apply_inputs_to_designs()
        self._apply_inference_rules_to_records()
        self._send_graph_to_typed_pid_maker()
        return self

    def _send_graph_to_typed_pid_maker(self) -> None:
        """
        Sends the graph of records to the Typed PID Maker API.
        This will create PIDs for the records and store the mapping from local IDs to real PIDs.
        """
        from pytypid import SimpleRecord as ApiRecord
        import pytypid_generated_client
        import os

        configuration = pytypid_generated_client.Configuration(
            host = "http://typed-pid-maker.datamanager.kit.edu/preview"
        )

        with pytypid_generated_client.ApiClient(configuration) as api_client:
            api = pytypid_generated_client.PIDManagementApi(api_client)
            graph_for_api: List[pytypid_generated_client.PIDRecord] = []
            for record in self.RECORD_GRAPH.values():
                maybe_api_record = ApiRecord.from_dict(record.toSimpleJSON())
                if maybe_api_record:
                    graph_for_api.append(maybe_api_record.to_record())
            dryrun = False

            try:
                api_response: pytypid_generated_client.BatchRecordResponse = api.create_pids(pid_record=graph_for_api, dryrun=dryrun)
                print("------ Successful response from API ---")

                # Define folder where we will store the mapping from local IDs to real PIDs
                # This is important information for updating the graph later on
                save_folder = os.path.dirname(os.path.abspath(__file__))
                if not len(graph_for_api) == len(self.RECORD_GRAPH) \
                    or (not api_response.mapping is None and not len(graph_for_api) == len(api_response.mapping)):
                    print("Error: The number of records does not match the number of mappings.")
                if api_response.mapping:
                    # save mapping to folder as "mappings.json"
                    with open(os.path.join(save_folder, "mappings.json"), "w") as f:
                        json.dump(api_response.mapping, f)
                else:
                    print("Error: No mapping received from API.")

                with open(os.path.join(save_folder, "api_response.json"), "w") as f:
                    json.dump(api_response.model_dump(by_alias=True), f, indent=2)
                    print("Saved mappings to", os.path.join(save_folder, "mappings.json"))
                    print("Saved API response to", os.path.join(save_folder, "api_response.json"))
                    print("Done.")
            except Exception as e:
                print("Exception when calling PIDManagementApi->create_pid: %s\n" % e)

    def _apply_inference_rules_to_records(self) -> None:
        for sender_id in self.RECORD_GRAPH:
            sender = self.RECORD_GRAPH[sender_id]
            matched_conditions = filter(lambda condition: sender.contains(condition), self.INFERENCE_MATCHES_DB.keys())
            reactions = map(lambda link: self.INFERENCE_MATCHES_DB[link], matched_conditions)
            for reaction in reactions:
                receiver: PidRecord = self.RECORD_GRAPH[reaction.receiver]
                receiver.addAttribute(reaction.backward_link_type, sender_id)

    def _apply_inputs_to_designs(self) -> None:
        """
        Applies the input files to the designs and creates records.
        This will generate records and inference rules which will be stored in this classes state.
        """
        for design in self.RECORD_DESIGNS:
            while True:
                input_file = self.INPUT.nextInputFile()
                if not input_file:
                    print("No more input files.")
                    break
                with open(input_file, 'r') as file:
                    print("Processing input file", input_file)
                    json_data: JsonType = json.load(file)
                    assert len(json_data) > 0, "JSON file is empty or not valid."
                    sender: PidRecord
                    inference_rules: InferenceRules
                    sender, inference_rules = design.apply(json_data)
                    print("Created record:", sender.getId())
                    # Store the record in the graph
                    self.RECORD_GRAPH[sender.getId()] = sender
                    # merge rules into DB
                    self.INFERENCE_MATCHES_DB.update(inference_rules)
