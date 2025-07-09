# we can have it globally, but do not need to.
# advantage: only this way we can us typing.
# It will not work to apply typing in apply()
current_json: str | None = None

from typing import Any, Callable


def foo() -> str:
    """
    Function with side effect (depends on current_json).
    Users may define functions and may use a "read from json" block in them.
    We can't (?, easily at least) force them to not use any read block in there.
    """
    print(f"Processing JSON: {current_json}")
    return "result" #normally: jsonpath(current_json, "$.some.path")

# short working version of a design
# this is the place where users can define what is being executed
# We store this in a lambda and execute it later.
do_something = lambda: foo()
# do_something = lambda: can(be(more(complicated(foo(current_json) if something else None))))

def apply(json_string: str, foo: Callable[[], Any]):
    global current_json
    current_json = s
    foo()


# execute my code over different json strings
for s in ["a", "b", "c"]:
    apply(s, foo)
