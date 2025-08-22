import executor as executor
from executor import RecordDesign, Executor
import jsonpath
from conditionals import *

EXECUTOR: Executor = Executor()


# pidrecord
EXECUTOR.addDesign( RecordDesign()
  .setId(lambda: str(jsonpath.findall("$.sampleIdentification.sampleID.sampleID", executor.current_source_json)[0]))
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

EXECUTOR.execute()
