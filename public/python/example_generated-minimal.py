import executor
from executor import RecordDesign, Executor
from conditionals import *
import jsonpath

EXECUTOR: Executor = Executor()


# pidrecord
EXECUTOR.addDesign( RecordDesign()
  .setId(lambda: str(jsonpath.pointer.resolve('/experiment_id', executor.current_source_json)))
  # ## profile_hmc ##
  # attribute: Self-Reference
  .addAttribute("21.T11148/076759916209e5d62bd5", lambda: '21.T11148/b9b76f887845e32d29f7')
  # attribute: digitalObjectType
  .addAttribute("21.T11148/1c699a5d1b4ad3ba4956", lambda: jsonpath.pointer.resolve('/data_access/mime_type', executor.current_source_json))
  # attribute: digitalObjectLocation
  .addAttribute("21.T11148/b8457812905b83046284", lambda: jsonpath.pointer.resolve('/data_access/data_url', executor.current_source_json))
  # attribute: dateCreated
  .addAttribute("21.T11148/aafd5fb4c7222e2d950a", lambda: jsonpath.pointer.resolve('/date', executor.current_source_json))
  # attribute: license
  .addAttribute("21.T11148/2f314c8fe5fb6a0063a8", lambda: 'Apache 2.0')
  # attribute: topic
  .addAttribute("21.T11148/b415e16fbe4ca40f2270", lambda: ([
    jsonpath.pointer.resolve('/title', executor.current_source_json), jsonpath.pointer.resolve('/description', executor.current_source_json)]))
  # attribute: contact
  .addAttribute("21.T11148/1a73af9e7ae00182733b", lambda: (str(jsonpath.pointer.resolve('/researcher/name', executor.current_source_json)) + str(jsonpath.pointer.resolve('/researcher/institution', executor.current_source_json))))
)

EXECUTOR.execute()
