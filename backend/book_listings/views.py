from rest_framework import viewsets, serializers, permissions, status
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.response import Response
from users.models import User
from users.views import UserSerializer

from book_listings.filters import BooklistingOrderingFilter
from book_listings.models import BookListing, CompletedListing, MeetupRequest
from rest_framework.views import APIView


class BookListingSerializer(serializers.ModelSerializer):
    """Serializer for the BookListing class."""

    name = serializers.CharField(required=True)
    image = serializers.ImageField(required=True)
    price = serializers.DecimalField(max_digits=6, decimal_places=2, required=True)
    owner = UserSerializer(read_only=True)

    def create(self, validated_data, *args, **kwargs):
        owner = self.context["request"].user
        validated_data["owner"] = owner
        return BookListing.objects.create(**validated_data)

    class Meta:
        model = BookListing
        fields = [
            "owner",
            "id",
            "price",
            "image",
            "author",
            "name",
            "edition",
            "condition",
            "class_number",
            "professor",
            "status",
        ]


class BookListingFilterSet(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")
    author = filters.CharFilter(lookup_expr="icontains")
    edition = filters.CharFilter(lookup_expr="iexact")
    owner = filters.ModelChoiceFilter(queryset=User.objects.all())

    ordering = BooklistingOrderingFilter()

    class Meta:
        model = BookListing
        fields = ["name", "author", "edition", "owner"]


class BookListingViewSet(viewsets.ModelViewSet):
    """API endpoint that allows book listings to be viewed or edited."""

    queryset = BookListing.objects.all()
    serializer_class = BookListingSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    filter_backends = [DjangoFilterBackend,]
    filterset_class = BookListingFilterSet

    def create(self, request, *args):
        return super().create(request, args)

    def update(self, request, *args, **kwargs):
        return super().update(request, args)

    @action(
        detail=False, methods=["get"], url_path="ratings-by-owner/(?P<owner_id>[^/.]+)"
    )
    def ratings_by_owner(self, request, owner_id=None):
        listings = BookListing.objects.filter(owner=owner_id)
        if not listings:
            return Response(
                {"message": "No listings found for this owner."},
                status=status.HTTP_404_NOT_FOUND,
            )
        completed_listings = CompletedListing.objects.filter(listing__in=listings)
        serializer = self.get_serializer(completed_listings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MeetupRequestAPI(APIView):
    """API endpoint for creating a MeetupRequest instance and returning the details of the meetup request.

    Currently, only takes in a bookId, but may be expanded to include more details in the future.

    Example POST request:
    {
        "bookId": 123,
        "location": {
            "latitude": 123.456,
            "longitude": 123.456
        },
        "meetup_time": "2022-01-01T00:00:00Z"
    }

    Example response (HTTP 201 Created):
    {
        "id": 1,
        "book_listing": 123,
        "user": 456,
        "date_created": "2022-01-01T00:00:00Z",
        "location_latitude": 123.456,
        "location_longitude": 123.456,
        "meetup_time": "2022-01-01T00:00:00Z",
        "status": "pending"
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get("bookId")
        if not book_id:
            return Response(
                {"message": "bookId is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book_listing = BookListing.objects.get(id=book_id)
        except BookListing.DoesNotExist:
            return Response(
                {"message": "BookListing does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        meetup_request = MeetupRequest.objects.create(
            book_listing=book_listing,
            user=request.user,
            status="pending",
            location_latitude=request.data.get("location", {}).get("latitude"),
            location_longitude=request.data.get("location", {}).get("longitude"),
            meetup_time=request.data.get("meetup_time"),
        )
        serializer = MeetupRequestSerializer(meetup_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AcceptMeetupRequestAPI(APIView):
    """API endpoint for accepting a MeetupRequest instance.

    Example POST request:
    {
        "meetupRequestId": 123
    }

    Example response (HTTP 200 OK):
    {
        "id": 123,
        "book_listing": 456,
        "user": 789,
        "date_created": "2022-01-01T00:00:00Z",
        "location_latitude": 123.456,
        "location_longitude": 123.456,
        "meetup_time": "2022-01-01T00:00:00Z",
        "status": "accepted"
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        meetup_request_id = request.data.get("meetupRequestId")
        if not meetup_request_id:
            return Response(
                {"message": "meetupRequestId is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            meetup_request = MeetupRequest.objects.get(id=meetup_request_id)
        except MeetupRequest.DoesNotExist:
            return Response(
                {"message": "MeetupRequest does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if meetup_request.book_listing.owner != request.user:
            return Response(
                {"message": "You do not have permission to accept this request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        meetup_request.status = "accepted"
        meetup_request.save()
        serializer = MeetupRequestSerializer(meetup_request)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MeetupRequestSerializer(serializers.ModelSerializer):
    """Serializer for the MeetupRequest class."""

    user = UserSerializer(read_only=True)
    book_listing = BookListingSerializer(read_only=True)
    location_latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False
    )
    location_longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False
    )
    meetup_time = serializers.DateTimeField(required=False)

    class Meta:
        model = MeetupRequest
        fields = [
            "id",
            "book_listing",
            "user",
            "date_created",
            "status",
            "location_latitude",
            "location_longitude",
            "meetup_time",
        ]


class MeetupRequestListAPI(APIView):
    """API endpoint for retrieving a list of meetup requests with a specified user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get the request's user's meetup requests."""
        user_meetup_requests = MeetupRequest.objects.filter(
            user=request.user, status="pending"
        )
        user_serializer = MeetupRequestSerializer(
            user_meetup_requests, many=True, context={"request": request}
        )

        # Also get the meetup requests for the user's books
        book_meetup_requests = MeetupRequest.objects.filter(
            book_listing__owner=request.user, status="pending"
        )
        book_serializer = MeetupRequestSerializer(
            book_meetup_requests, many=True, context={"request": request}
        )

        accepted_meetup_requests = MeetupRequest.objects.filter(
            Q(user=request.user) | Q(book_listing__owner=request.user),
            status="accepted",
        )

        accepted_meetups_serializer = MeetupRequestSerializer(
            accepted_meetup_requests, many=True, context={"request": request}
        )

        return Response(
            dict(
                user_created=user_serializer.data,
                for_users_books=book_serializer.data,
                scheduled_meetups=accepted_meetups_serializer.data,
            ),
            status=status.HTTP_200_OK,
        )
