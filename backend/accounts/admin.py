from django.contrib import admin
from .models import CustomUser, PendingRegistration, PasswordResetToken, UserOnboarding, Subscription


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'is_email_verified', 'is_active', 'created_at']
    search_fields = ['email', 'username']
    list_filter = ['is_email_verified', 'is_active', 'is_staff']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PendingRegistration)
class PendingRegistrationAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'expires_at', 'attempts', 'created_at']
    search_fields = ['email', 'username']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'expires_at', 'is_used', 'created_at']
    list_filter = ['is_used']


@admin.register(UserOnboarding)
class UserOnboardingAdmin(admin.ModelAdmin):
    list_display = ['user', 'completed_at']
    search_fields = ['user__email', 'user__username']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_active', 'expires_at', 'days_remaining', 'activated_at']
    list_filter = ['is_active']
    search_fields = ['user__email']
