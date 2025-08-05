export const pidrecord = {
    type: "pidrecord",
    tooltip:
        "Defines a PID record, which holds a set of attributes and profiles.",
    helpUrl: "",
    message0: "PID Record %1 %2 Local ID (pseudo-pid) %3 %4",
    args0: [
        {
            type: "field_label_serializable",
            text: "(no PID yet)",
            name: "pid",
        },
        {
            type: "input_dummy",
            name: "label",
        },
        {
            type: "input_value",
            name: "local-id",
        },
        {
            type: "input_statement",
            name: "record",
            check: ["profile", "attribute_key"],
        },
    ],
    colour: 300,
    inputsInline: false,
}

export const pidrecord_skipable = {
    type: "pidrecord_skipable",
    tooltip:
        "Defines a PID record, which holds a set of attributes and profiles. It can be skipped based on a condition.",
    helpUrl: "",
    message0: "PID Record %1 %2 Local ID (pseudo-pid) %3 %4 Skip if %5",
    args0: [
        {
            type: "field_label_serializable",
            text: "(no PID yet)",
            name: "pid",
        },
        {
            type: "input_dummy",
            name: "label",
        },
        {
            type: "input_value",
            name: "local-id",
        },
        {
            type: "input_statement",
            name: "record",
            check: ["profile", "attribute_key"],
        },
        {
            type: "input_value",
            name: "skip-condition",
        },
    ],
    colour: 300,
    inputsInline: false,
}
