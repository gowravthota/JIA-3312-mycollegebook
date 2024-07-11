from rest_framework import serializers, viewsets, status, request

from users.verify import check_phone_verification, send_phone_verification
from .models import University, User
from book_listings.models import BookListing, CompletedListing
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg
import stripe


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    seller_rating = serializers.SerializerMethodField()
    buyer_rating = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_seller_rating(self, obj: User):
        listings = CompletedListing.objects.filter(listing__owner = obj).filter(seller_rating__isnull = False)
        if listings.exists():
            avg_rating = listings.aggregate(avg_rating=Avg('seller_rating'))['avg_rating']
            return avg_rating
        return "No Ratings"
    
    def get_buyer_rating(self, obj: User):
        listings = CompletedListing.objects.filter(listing__owner = obj).filter(buyer_rating__isnull = False)
        if listings.exists():
            avg_rating = listings.aggregate(avg_rating=Avg('buyer_rating'))['avg_rating']
            return avg_rating
        return "No Ratings"

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        user = super().create(validated_data)
        if password:
            user.set_password(password)

        user.save()
        return user

    def to_representation(self, instance):
        self.fields["university"] = UniversitySerializer(read_only=True)
        return super(UserSerializer, self).to_representation(instance)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "name",
            "first_name",
            "last_name",
            "university",
            "profile_picture",
            "phone_number",
            "date_joined",
            "is_staff",
            "is_active",
            "is_verified",
            "stripe_id",
            "seller_rating",
            "buyer_rating",
        ]

class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = []
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data)


class UniversityViewSet(viewsets.ModelViewSet):
    authentication_classes = []
    queryset = University.objects.all().order_by("name")
    serializer_class = UniversitySerializer

class PhoneSerializer(serializers.Serializer):
    code = serializers.IntegerField()

class VerifyPhoneNumber(APIView):
    def get(self, request: request.HttpRequest):
        user = request.user
        user: User
        if not user or user.is_anonymous:
            return Response(
                {"error": "Must be a signed in user."}, status.HTTP_400_BAD_REQUEST
            )

        if not user.phone_number:
            return Response(
                {"error": "User must have a phone number."}, status.HTTP_400_BAD_REQUEST
            )

        send_phone_verification(user.phone_number)

        return Response({"message":"Verification code sent."}, status.HTTP_200_OK)

    def post(self, request: request.HttpRequest):
        user = request.user
        user: User
        if not user or user.is_anonymous:
            return Response(
                {"error": "Must be a signed in user."}, status.HTTP_400_BAD_REQUEST
            )

        if not user.phone_number:
            return Response(
                {"error": "User must have a phone number."}, status.HTTP_400_BAD_REQUEST
            )

        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verified = check_phone_verification(user.phone_number, serializer.validated_data['code'])

        if not verified:
            return Response({"error":"Could not verify phone number, please try again."}, status.HTTP_400_BAD_REQUEST)

        User.objects.filter(id=user.id).update(is_verified=True)

        return Response({"message":"Successfully verified phone number!"}, status.HTTP_200_OK)