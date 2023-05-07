# Standard Library
from typing import Any, Iterable, List, Optional, Set, Type, Tuple

# Sematic
from sematic.types.casting import safe_cast
from sematic.types.registry import (
    SummaryOutput,
    register_from_json_encodable,
    register_safe_cast,
    register_to_json_encodable,
    register_to_json_encodable_summary,
)
from sematic.types.serialization import (
    get_json_encodable_summary,
    value_from_json_encodable,
    value_to_json_encodable,
)


@register_safe_cast(set)
def _set_safe_cast(
    value: Set, type_: Type
) -> Tuple[Optional[Set], Optional[str]]:
    """
    Casting logic for sets

    All elements in set are attempted to cast to `T`.
    """
    if not isinstance(value, Iterable):
        return None, f"{value} not an iterable"

    element_type = type_.__args__[0]

    result: Set[element_type] = set()  # type: ignore

    for element in value:
        cast_element, error = safe_cast(element, element_type)
        if error:
            return None, f"Cannot cast {value} to {type_}: {error}"

        result.add(cast_element)

    return result, None


@register_to_json_encodable(set)
def _set_to_json_encodable(value: set, type_: Any) -> List:
    """
    Serialization of sets
    """
    element_type = type_.__args__[0]
    return [value_to_json_encodable(item, element_type) for item in value]


@register_from_json_encodable(set)
def _set_from_json_encodable(value: set, type_: Any) -> Set[Any]:
    """
    Deserialize a sets
    """
    element_type = type_.__args__[0]
    return set(value_from_json_encodable(item, element_type) for item in value)


@register_to_json_encodable_summary(set)
def _set_to_json_encodable_summary(value: Set, type_: Type) -> SummaryOutput:
    """
    Summary for the UI
    """
    summary, blobs = [], {}
    element_type = type_.__args__[0]

    for element in value:
        element_summary, element_blobs = get_json_encodable_summary(
            element, element_type
        )
        summary.append(element_summary)
        blobs.update(element_blobs)

    return summary, blobs
