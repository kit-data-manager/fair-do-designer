from main import *

#---8<---use-designs-to-create-records-from-JSON---8<---
import json
from typing import Dict

RECORD_GRAPH: Dict[str, PidRecord] = {}

# This is the place to store information about backlink inference from the records.
#
# Condition(forward_link_type, receiver_id) => Reaction(receiver_id, backward_link_type)
INFERENCE_MATCHES_DB: InferenceRules = {}

for design in RECORD_DESIGNS:
    while True:
        input_file = INPUT.nextInputFile()
        if not input_file:
            print("No more input files.")
            break
        with open(input_file, 'r') as file:
            print("Processing input file", input_file)
            json_data: JsonType = json.load(file)
            sender: PidRecord
            inference_rules: InferenceRules
            sender, inference_rules = design.apply(json_data)
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

# TODO send record graph to typed pid maker instance
