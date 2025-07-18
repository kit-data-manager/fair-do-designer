from main import *
from conditionals import *

#---8<---user-defined-code---8<---

from typing import Any, List, Tuple, Callable

def otherwise(either: Any, otherwise: Callable[[], Any]) -> Any:
    """
    Returns `either` if it is somehow a valid value, otherwise executes and returns `otherwise`.

    :param either: The value to check.
    :param otherwise: The value to calculate and return if `either` is None.
    :return: `either` if it is not None, otherwise `otherwise`.
    """
    if type(either) == str and either.strip().lower() in ("null", "", "()", "[]", "{}"):
        either = None

    notNone = either is not None
    notEmptyArray = type(either) == List[Any] and len(either) > 0
    notEmptyTuple = type(either) == Tuple[Any, Any] and len(either) > 0
    notEmptyishString = type(either) == str and either.strip().lower() not in ("null", "", "()", "[]", "{}")

    isOk = notNone and notEmptyArray and notEmptyTuple and notEmptyishString
    return either if isOk else otherwise()

def stop_with_fail(message: str | None):
    if message == None or message == "":
        message = "No error message provided"
    raise Exception("Design stopped. " + message)


# pidrecord
RECORD_DESIGNS.append( RecordDesign()
  # profile_hmc
  .addAttribute("21.T11148/076759916209e5d62bd5", lambda: '21.T11148/b9b76f887845e32d29f7')
  # attribute: profile_hmc
  .addAttribute("21.T11148/b8457812905b83046284", lambda: [])
  # attribute: profile_hmc
  .addAttribute("21.T11148/aafd5fb4c7222e2d950a", BackwardLinkFor(''))
  # attribute: profile_hmc
  .addAttribute("21.T11148/2f314c8fe5fb6a0063a8", lambda: jsonpath.findall("JSON.sampleIdentification.samplePurpose", current_source_json))
  # attribute: profile_hmc
  .addAttribute("21.T11148/796a3ea6c9a38633fb7e", lambda: jsonpath.findall("JSON.sampleIdentification.samplePurpose.samplePurposeOptions", current_source_json))
  # attribute: profile_hmc
  .addAttribute("21.T11148/82e2503c49209e987740", lambda: (otherwise('not?', lambda: stop_with_fail("No error message provided"))
  ))
  # attribute: profile_hmc
  .addAttribute("21.T11148/d0773859091aeb451528", lambda: [])
  # attribute: profile_hmc
  .addAttribute("21.T11148/7fdada5846281ef5d461", lambda: [])
)

#---8<---use-designs-to-create-records-from-JSON---8<---
from execute import *