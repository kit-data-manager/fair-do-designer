def otherwise(either: any, otherwise: any):
    """
    Returns `either` if it is somehow a valid value, otherwise returns `otherwise`.
    
    :param either: The value to check.
    :param otherwise: The value to return if `either` is None.
    :return: `either` if it is not None, otherwise `otherwise`.
    """
    notNone = either is not None
    notNull = otherwise != "null"
    return either if notNone and notNull else otherwise
