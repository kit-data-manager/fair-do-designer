def otherwise(either: any, otherwise: any):
    """
    Returns `either` if it is somehow a valid value, otherwise returns `otherwise`.
    
    :param either: The value to check.
    :param otherwise: The value to return if `either` is None.
    :return: `either` if it is not None, otherwise `otherwise`.
    """
    if type(either) == str and either.strip().lower() in ("null", "", "()", "[]", "\{\}"):
        either = None

    notNone = either is not None
    notEmptyArray = type(either) == list and len(either) > 0
    notEmptyTuple = type(either) == tuple and len(either) > 0
    notEmptyishString = type(either) == str and either.strip().lower() not in ("null", "", "()", "[]", "\{\}")

    isOk = notNone and notEmptyArray and notEmptyTuple and notEmptyishString
    return either if isOk else otherwise
