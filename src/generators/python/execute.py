from main import *

#---8<---use-designs-to-create-records-from-JSON---8<---
import json

RECORD_GRAPH: list[PidRecord] = []

for design in RECORD_DESIGNS:
    while True:
        input_file = INPUT.nextInputFile()
        if not input_file:
            print("No more input files.")
            break
        with open(input_file, 'r') as file:
            json_data: JsonType = json.load(file)
            record: PidRecord = design.apply(json_data)
            RECORD_GRAPH.append(record)

# TODO send record graph to typed pid maker instance
