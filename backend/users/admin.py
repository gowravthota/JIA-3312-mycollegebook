from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, University, UniversityDomain


# Register your models here.
@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    search_fields = ("name", "country", "alpha_two_code")
    ordering = ("id",)
    list_display = ("id", "name", "country", "alpha_two_code")


@admin.register(UniversityDomain)
class UniversityDomainAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    search_fields = ("name", "university__name")
    ordering = ("id",)
    list_display = ("id", "name", "university")


@admin.register(User)
class UserAdminConfig(UserAdmin):
    readonly_fields = ("id", "date_joined")

    # Formats profile pictures in admin site HTML
    def image_tag(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width: 45px; max-height: 75px;">',
                obj.profile_picture.url,
            )
        return "-"

    image_tag.short_description = "Profile Image"

    # Dashboard List
    search_fields = ("username", "email", "id")
    ordering = ("-date_joined",)
    list_filter = ("is_staff", "is_active", "date_joined")
    list_display = ("id", "username", "email", "is_staff", "date_joined", "image_tag")

    # Item Display
    fieldsets = (
        (
            "User Info",
            {
                "fields": (
                    "username",
                    "password",
                    "email",
                    "first_name",
                    "last_name",
                    "profile_picture",
                    "phone_number",
                    'is_verified',
                )
            },
        ),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "is_active")}),
        ("Meta Info", {"fields": ("id", "date_joined")}),
    )

    # Create Item Display
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "profile_picture",
                    "email",
                    "phone_number",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )
