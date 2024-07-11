from django.urls import path
from . import views

urlpatterns = [
    path("create-payment-intent/", views.CreatePaymentIntent.as_view(), name="create-payment-intent"),
    path("stripe-webhook/", views.stripe_webhook, name="stripe-webhook"),
    # Include other paths as needed
]

