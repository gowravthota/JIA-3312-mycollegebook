from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings


class BookListing(models.Model):
    """Model that represents a book listing."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        # TODO: only allowing this to be null because we are going to wait to build the login flow
        null=True,
        on_delete=models.SET_NULL,
        related_name="owned_listings",
    )

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="purchased_listings",
    )

    STATUS_CHOICES = [
        ("active", "Active"),
        ("sold", "Sold"),
        ("archived", "Archived"),
    ]

    name = models.CharField(max_length=50)
    author = models.CharField(max_length=50)
    image = models.ImageField(null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    edition = models.IntegerField()
    condition = models.CharField(max_length=255, blank=True)
    class_number = models.CharField(max_length=255, blank=True)
    professor = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    def __str__(self):
        return f"{self.name} (${self.price})"


class CompletedListing(models.Model):
    listing = models.OneToOneField("BookListing", related_name="completed_listing", on_delete=models.CASCADE)
    seller_rating = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10),  # Assuming half-star ratings from 0 stars to 5 stars
        ],
        null=True,
    )
    buyer_rating = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10),  # Assuming half-star ratings from 0 stars to 5 stars
        ],
        null=True,
    )


class MeetupRequest(models.Model):
    STATUS_CHOICES = [
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("pending", "Pending"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book_listing = models.ForeignKey(BookListing, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    location_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    location_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    meetup_time = models.DateTimeField(null=True)

    def __str__(self):
        return f"Meetup Request for '{self.book_listing.name}' by {self.user.username}"


class ConnectionFeePaid(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    book_listing = models.ForeignKey(BookListing, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_date = models.DateTimeField(auto_now_add=True)

    # Add any other fields as needed

    def __str__(self):
        return f"{self.user.username} paid ${self.amount} for {self.book_listing.name}"
