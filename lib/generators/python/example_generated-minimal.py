from main import *
from main import current_source_json
from conditionals import *
import jsonpath

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
  .setId(lambda: str(jsonpath.findall("$.sampleIdentification.sampleID.sampleID", current_source_json)[0]))
  # profile_hmc
  .addAttribute("21.T11148/076759916209e5d62bd5", lambda: '21.T11148/b9b76f887845e32d29f7')
  # attribute: profile_hmc
  .addAttribute("21.T11148/076759916209e5d62bd5", lambda: '21.T11148/b9b76f887845e32d29f7')
  # attribute: profile_hmc
  .addAttribute("21.T11148/1c699a5d1b4ad3ba4956", lambda: '21\\.T11148\\/f6b12e65934c9b0fb11a')
  # attribute: profile_hmc
  .addAttribute("21.T11148/b8457812905b83046284", lambda: 'https://example.com/does-not-have-a-url')
  # attribute: profile_hmc
  .addAttribute("21.T11148/aafd5fb4c7222e2d950a", lambda: '1985-04-12T23:20:50.52Z')
  # attribute: profile_hmc
  .addAttribute("21.T11148/2f314c8fe5fb6a0063a8", lambda: 'https://spdx.org/licenses/CC-BY-4.0.html')
)

#---8<---use-designs-to-create-records-from-JSON---8<---
from execute import *
