from typing import Any, Callable, TypeGuard

def otherwise(either: Any, otherwise: Callable[[], Any]) -> Any:
    """
    Returns `either` if it is somehow a valid value, otherwise executes and returns `otherwise`.
    
    :param either: The value to check.
    :param otherwise: The value to calculate and return if `either` is None.
    :return: `either` if it is not None, otherwise `otherwise`.
    """
    if type(either) == str and either.strip().lower() in ("null", "", "()", "[]", "{}"):
        either = None

    def is_list_any(value: object) -> TypeGuard[list[Any]]:
        return isinstance(value, list)
    
    def is_tuple_any(value: object) -> TypeGuard[tuple[Any, Any]]:
        return isinstance(value, tuple)

    notNone = either is not None
    notEmptyArray = is_list_any(either) and len(either) > 0
    notEmptyTuple = is_tuple_any(either) and len(either) > 0
    notEmptyishString = isinstance(either, str) and either.strip().lower() not in ("null", "", "()", "[]", "{}")

    isOk = notNone and notEmptyArray and notEmptyTuple and notEmptyishString
    return either if isOk else otherwise()

def stop_with_fail(message: str | None) -> None:
    if message == None or message == "":
        message = "No error message provided"
    raise Exception("Design stopped. " + message)