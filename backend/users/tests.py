from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from unittest.mock import patch
from django.conf import settings
from models import User
import stripe
# Create your tests here.
