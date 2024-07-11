from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import BookListing, CompletedListing

User = get_user_model()
class CompletedListingAPITest(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner', password='testpass', email="abc123@hotmail.com")
        self.book_listing = BookListing.objects.create(owner=self.owner, name='Test Book', author='Author', price=10.00, edition=1)
        CompletedListing.objects.create(listing=self.book_listing, rating=5)

    def test_ratings_by_owner(self):
        url = reverse('booklisting-detail', kwargs={'pk': self.book_listing.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
