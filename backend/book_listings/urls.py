from . import views
from rest_framework import routers
from django.urls import path, include

# Create a router for this app's viewsets.
router = routers.DefaultRouter()
# book_listings is the base url for all things in this app.
router.register(r'book_listings/booklisting', views.BookListingViewSet)

urlpatterns = [
    path("request-meetup/", views.MeetupRequestAPI.as_view(), name="request-meetup"),
    path("my-meetup-requests/", views.MeetupRequestListAPI.as_view(), name="my-meetup-requests"),
    path("accept-meetup-request/", views.AcceptMeetupRequestAPI.as_view(), name="accept-meetup-request"),
]
