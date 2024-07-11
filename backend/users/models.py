from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from phonenumber_field.modelfields import PhoneNumberField
from datetime import date


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **other_fields):
        email = self.normalize_email(email)

        user = self.model(username=username, email=email, **other_fields)
        user.set_password(password)
        user.save()

        return user

    def create_superuser(
        self, username, email, first_name, last_name, password=None, **other_fields
    ):
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)

        return self.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            **other_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    # Identifiers for a user
    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=255, unique=True)

    # Important Information
    first_name = models.CharField(max_length=32, null=False)
    last_name = models.CharField(max_length=32, null=False)
    university = models.ForeignKey("University", null=True, on_delete=models.SET_NULL)

    profile_picture = models.ImageField(
        upload_to="profile_images/", default="profile_images/default.png"
    )
    phone_number = PhoneNumberField(unique=True, null=True, blank=True)

    # Meta information
    date_joined = models.DateField(default=date.today)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    stripe_id = models.CharField(max_length=32, unique=True, default=None, null=True)
    objects = UserManager()

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    class Meta:
        indexes = [
            models.Index(fields=["username"], name="username_idx"),
            models.Index(
                fields=["first_name", "last_name"], name="first_last_name_idx"
            ),
        ]


class University(models.Model):
    name = models.CharField(max_length=255, unique=True, null=False)

    # These are most likely not necessary, but for future extensibility
    country = models.CharField(max_length=255, null=False)
    alpha_two_code = models.CharField(max_length=2, null=False)

    class Meta:
        verbose_name_plural = "Universities"
        indexes = [
            models.Index(fields=["name"], name="name_idx"),
        ]

    def __str__(self):
        return self.name


class UniversityDomain(models.Model):
    """
    Stores URL domains associated with a University, e.g. `gatech.edu`.
    Related to :model:`users.University`.
    """

    name = models.CharField(max_length=255, unique=True, null=False)
    university = models.ForeignKey("University", on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=["university"], name="university_idx"),
        ]

    def __str__(self):
        return self.name
