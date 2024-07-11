from . import views
from rest_framework import routers
from django.urls import path, include

# Create a router for this app's viewsets.
router = routers.DefaultRouter()

# The base path for this app's urls is 'users/'. The viewset for the User model is registered here.
router.register(r'users/user', views.UserViewSet)

urlpatterns = [
    # Fill in with other API endpoints as needed.
]
