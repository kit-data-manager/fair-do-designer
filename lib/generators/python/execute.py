from main import *

#---8<---use-designs-to-create-records-from-JSON---8<---
import json
from typing import Dict

RECORD_GRAPH: Dict[str, PidRecord] = {}

# This is the place to store information about backlink inference from the records.
#
# Condition(forward_link_type, receiver_id) => Reaction(receiver_id, backward_link_type)
INFERENCE_MATCHES_DB: InferenceRules = {}

print("Amount of designs:", len(RECORD_DESIGNS))

for design in RECORD_DESIGNS:
    while True:
        input_file = INPUT.nextInputFile()
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
            RECORD_GRAPH[sender.getId()] = sender
            # merge rules into DB
            INFERENCE_MATCHES_DB.update(inference_rules)

#---8<---infer-relations-between-records---8<---

for sender_id in RECORD_GRAPH:
    sender = RECORD_GRAPH[sender_id]
    matched_conditions = filter(lambda condition: sender.contains(condition), INFERENCE_MATCHES_DB.keys())
    reactions = map(lambda link: INFERENCE_MATCHES_DB[link], matched_conditions)
    for reaction in reactions:
        receiver: PidRecord = RECORD_GRAPH[reaction.receiver]
        receiver.addAttribute(reaction.backward_link_type, sender_id)

#---8<---send-graph-to-typed-pid-maker---8<---
from pytypid import SimpleRecord as ApiRecord, BatchRecordResponse
import pytypid_generated_client
import os

configuration = pytypid_generated_client.Configuration(
    host = "http://typed-pid-maker.datamanager.kit.edu/preview"
)

with pytypid_generated_client.ApiClient(configuration) as api_client:
    api = pytypid_generated_client.PIDManagementApi(api_client)
    graph_for_api: List[pytypid_generated_client.PIDRecord] = []
    for record in RECORD_GRAPH.values():
        maybe_api_record = ApiRecord.from_dict(record.toSimpleJSON())
        if maybe_api_record:
            graph_for_api.append(maybe_api_record.to_record())
    dryrun = False

    try:
        api_response: BatchRecordResponse = api.create_pids(pid_record=graph_for_api, dryrun=dryrun)
        print("------ Successful response from API ---")

        # Define folder where we will store the mapping from local IDs to real PIDs
        # This is important information for updating the graph later on
        save_folder = os.path.dirname(os.path.abspath(__file__))
        if not len(graph_for_api) == len(RECORD_GRAPH) \
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
