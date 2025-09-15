from executor import RecordDesign

class TestRecordDesign:
    def test_maps_to_correct_id(self) -> None:
        id = "whatever"
        design = RecordDesign().setId(lambda: id)
        maybe_record = design.apply({})
        assert maybe_record
        record, _rules = maybe_record
        assert record.getId() == id

    def test_maps_attributes_correctly(self) -> None:
        key = "my_key"
        value = "my_value"
        design = RecordDesign().addAttribute(key, lambda: value)
        maybe_record = design.apply({})
        assert maybe_record
        record, _rules = maybe_record
        assert record.contains((key, value))
