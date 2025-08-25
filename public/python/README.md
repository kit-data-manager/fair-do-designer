# Python code for JSON to PID Record conversion

This project contains required utilities to map JSON files to PID records and register them using a [Typed PID Maker](https://github.com/kit-data-manager/pit-service) instance.

- `generated.py` represents the python file to execute your exported mapping. Only present in exports directly from the FAIR DO Designer.
- `pyproject.toml` documents mainly the dependencies of the python code. It was created with the build tool `uv` in mind, read more on how to use it in the next section.
- `executor.py` contains the business logic to handle the ideas of designs, records, and communication with the [Typed PID Maker](https://github.com/kit-data-manager/pit-service). If you plan to integrate this code to your code base, this contains the parts you probably want to replace or modify.

## Usage

To avoid modification of the pyproject.toml, the easiest (and intended) way to use the code is like described in the following:

- [Install the uv build tool](https://docs.astral.sh/uv/getting-started/installation/)
- run `uv sync` to install the dependencies
- run `uv run generated.py my-json01.json ../my/data/*.json` to call the generated code like a command line tool or adjust the code to your needs.

Similar to other tools like poetry, uv creates a virtual environment for the project which can also be detected by most IDEs. If you need to use other build tools, you'll probably need to modify your pyproject.toml file a little.
