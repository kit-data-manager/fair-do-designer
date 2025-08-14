from main import RecordDesign

class TestRecordDesign:
    def test_maps_to_correct_id(self) -> None:
        id = "whatever"
        design = RecordDesign().setId(lambda: id)
        record, _rules = design.apply({})
        assert record.getId() == id

    def test_maps_attributes_correctly(self) -> None:
        key = "my_key"
        value = "my_value"
        design = RecordDesign().addAttribute(key, lambda: value)
        record, _rules = design.apply({})
        assert record.contains((key, value))
