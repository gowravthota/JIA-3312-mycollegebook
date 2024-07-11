from django.contrib import admin
from book_listings.models import BookListing, CompletedListing, MeetupRequest, ConnectionFeePaid
from django.contrib.admin import ModelAdmin


@admin.register(BookListing)
class BookListingAdmin(ModelAdmin):
    """Admin for the BookListing class."""
    list_display = ("id", "name", "author", "price", "owner")


@admin.register(CompletedListing)
class UserAdminConfig(ModelAdmin):
    list_display = ("listing", "seller_rating", "buyer_rating") # removing read only unless necessary


@admin.register(MeetupRequest)
class MeetupRequestAdmin(ModelAdmin):
    list_display = ("id", "user", "book_listing", "status", "date_created")

@admin.register(ConnectionFeePaid)
class ConnectionFeePaidAdmin(ModelAdmin):
    list_display = ('user', 'book_listing', 'amount', 'payment_date')
