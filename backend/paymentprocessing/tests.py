from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from users.models import User
from users.views import UserSerializer
import stripe
# Create your tests here.



class CreatePaymentIntentTest(APITestCase):

    def test_create_payment_intent(self):
        #example payment method
        # payment_method = stripe.PaymentMethod.create(
        #     type="card",
        #     card={
        #         "number": "4242 4242 4242 4242",
        #         "exp_month": 12,
        #         "exp_year": 2023,
        #         "cvc": '123',
        #     },
        # )
        payment_id = "pm_card_visa"
        user = User.objects.create_user(username='testuser', password='password', email="abc123@hotmail.com")
        self.client.force_authenticate(user=user)
        url = reverse('create-payment-intent')
        data = {"payment_id": payment_id}
        response = self.client.post(url, data, format='json')
        print(response.content) 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
# User = get_user_model()
# class CompletedListingAPITest(APITestCase):
#     def setUp(self):
#         self.owner = User.objects.create_user(username='owner', password='testpass', email="abc123@hotmail.com")
#         self.book_listing = BookListing.objects.create(owner=self.owner, name='Test Book', author='Author', price=10.00, edition=1)
#         CompletedListing.objects.create(listing=self.book_listing, rating=5)

#     def test_ratings_by_owner(self):
#         url = reverse('booklisting-detail', kwargs={'pk': self.book_listing.id})
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)