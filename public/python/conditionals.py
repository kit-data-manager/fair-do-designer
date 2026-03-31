from typing import Any, Callable, TypeGuard

def is_emptyish(value: Any) -> bool:
    """
    Checks if a value is "empty-ish", meaning it is None, an empty string, or a string that only contains whitespace.
    
    :param value: The value to check.
    :return: True if the value is empty-ish, False otherwise.
    """
    def is_list_any(value: object) -> TypeGuard[list[Any]]:
        return isinstance(value, list)
    
    def is_tuple_any(value: object) -> TypeGuard[tuple[Any, Any]]:
        return isinstance(value, tuple)

    isNone = value is None
    isEmptyArray = is_list_any(value) and len(value) <= 0
    isEmptyTuple = is_tuple_any(value) and len(value) <= 0
    isEmptyishString = isinstance(value, str) and value.strip().lower() in ("null", "", "()", "[]", "{}")

    return isNone or isEmptyArray or isEmptyTuple or isEmptyishString

def otherwise(either: Callable[[], Any], otherwise: Callable[[], Any]) -> Any:
    """
    Returns `either` if it is somehow a valid value, otherwise executes and returns `otherwise`.
    
    :param either: The value to check.
    :param otherwise: The value to calculate and return if `either` is None.
    :return: `either` if it is not None, otherwise `otherwise`.
    """

    eitherResult: Any = ""
    try:
        eitherResult = either()
    except Exception as e:
        print("    USE OTHER: First value in otherwise block threq exception: ", e)
        return otherwise()

    if type(eitherResult) == str and eitherResult.strip().lower() in ("null", "", "()", "[]", "{}"):
        eitherResult = None

    return eitherResult if is_emptyish(eitherResult) else otherwise()

def stop_with_fail(message: str | None) -> None:
    if message == None or message == "":
        message = "No error message provided"
    raise Exception("Design stopped. " + message)