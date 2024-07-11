from django_filters import rest_framework as filters
from django_filters.constants import EMPTY_VALUES

from book_listings.models import BookListing
from django.db.models import Avg


# From https://django-filter.readthedocs.io/en/latest/ref/filters.html#adding-custom-filter-choices
class BooklistingOrderingFilter(filters.OrderingFilter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extra["choices"] += [
            ("rating", "Rating"),
            ("-rating", "Rating (descending)"),
        ]

    def filter(self, qs, value):
        # OrderingFilter is CSV-based, so `value` is a list
        if value and any(v in ["rating", "-rating"] for v in value):
            qs = qs.annotate(
                rating=Avg("owner__owned_listings__completed_listing__seller_rating")
            )

        return super().filter(qs, value)
