from typing import Any, Callable, TypeGuard

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

    def is_list_any(value: object) -> TypeGuard[list[Any]]:
        return isinstance(value, list)
    
    def is_tuple_any(value: object) -> TypeGuard[tuple[Any, Any]]:
        return isinstance(value, tuple)

    isNone = eitherResult is None
    isEmptyArray = is_list_any(eitherResult) and len(eitherResult) <= 0
    isEmptyTuple = is_tuple_any(eitherResult) and len(eitherResult) <= 0
    isEmptyishString = isinstance(eitherResult, str) and eitherResult.strip().lower() in ("null", "", "()", "[]", "{}")

    isOk = not isNone and not isEmptyArray and not isEmptyTuple and not isEmptyishString
    return eitherResult if isOk else otherwise()

def stop_with_fail(message: str | None) -> None:
    if message == None or message == "":
        message = "No error message provided"
    raise Exception("Design stopped. " + message)