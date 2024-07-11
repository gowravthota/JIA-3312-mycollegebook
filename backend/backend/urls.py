from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from users.views import UniversityViewSet, UserMeView, VerifyPhoneNumber
from book_listings.urls import router as book_listings_router
from users.urls import router as users_router
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# This is the Django Rest Framework router that will handle API paths.
# Extend it with routers from the other apps.
router = routers.DefaultRouter()
router.registry.extend(book_listings_router.registry)
router.registry.extend(users_router.registry)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/get-me/", UserMeView.as_view(), name="user_me"),
    path("api/book_listings/", include("book_listings.urls")),
    path("api/universities/", UniversityViewSet.as_view({'get': 'list'}), name="univerities"),
    path("api/verification-code/", VerifyPhoneNumber.as_view(), name="verify_me"),
    path("api/payment/", include("paymentprocessing.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
