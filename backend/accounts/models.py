import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    has_completed_onboarding = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class PendingRegistration(models.Model):
    """
    Stores signup data temporarily until OTP verification.
    Prevents unverified ghost accounts in the CustomUser table.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30)
    password_hash = models.CharField(max_length=256)
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_max_attempts_reached(self):
        return self.attempts >= 5

    def __str__(self):
        return f'PendingRegistration: {self.email}'


class PasswordResetToken(models.Model):
    """Secure UUID-based token for the forgot-password flow."""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f'PasswordResetToken for {self.user.email}'


class UserOnboarding(models.Model):
    """
    Stores a user's onboarding (The Dig) questionnaire answers.
    One record per user, keyed by user_id.
    answers is a JSON dict: { "step_id-question_text": answer_index }
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='onboarding_profile',
        primary_key=True,
    )
    answers = models.JSONField(default=dict)
    completed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'OnboardingProfile for {self.user.email}'


class Subscription(models.Model):
    """
    Tracks a user's subscription status.
    One record per user, activated manually for now (no payment gateway).
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='subscription',
        primary_key=True,
    )
    is_active = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    activated_at = models.DateTimeField(null=True, blank=True)

    @property
    def days_remaining(self):
        if self.is_active and self.expires_at:
            delta = self.expires_at - timezone.now()
            return max(0, delta.days)
        return 0

    @property
    def is_valid(self):
        if not self.is_active or not self.expires_at:
            return False
        return timezone.now() < self.expires_at

    def __str__(self):
        return f'Subscription for {self.user.email} — {"Active" if self.is_valid else "Inactive"}'
