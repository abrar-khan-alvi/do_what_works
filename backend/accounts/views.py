from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate
from django.conf import settings
import stripe
from rest_framework import status

stripe.api_key = settings.STRIPE_SECRET_KEY
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, PendingRegistration, PasswordResetToken, UserOnboarding, Subscription
from .serializers import (
    SignUpSerializer, VerifyOTPSerializer, LoginSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, UserProfileSerializer,
    OnboardingSerializer, SubscriptionSerializer
)
from .emails import generate_otp, send_otp_email, send_password_reset_email


def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        otp_code = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=10)

        # Hash the password before storing in pending table
        from django.contrib.auth.hashers import make_password
        password_hash = make_password(password)

        # Create or update the pending registration
        PendingRegistration.objects.update_or_create(
            email=email,
            defaults={
                'username': username,
                'password_hash': password_hash,
                'otp_code': otp_code,
                'expires_at': expires_at,
                'attempts': 0,
            }
        )

        send_otp_email(email, username, otp_code)

        return Response(
            {'message': 'Verification code sent to your email.', 'email': email},
            status=status.HTTP_200_OK
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            pending = PendingRegistration.objects.get(email=email)
        except PendingRegistration.DoesNotExist:
            return Response(
                {'error': 'No pending registration found for this email.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if pending.is_expired():
            pending.delete()
            return Response(
                {'error': 'Verification code has expired. Please sign up again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pending.is_max_attempts_reached():
            pending.delete()
            return Response(
                {'error': 'Too many invalid attempts. Please sign up again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pending.otp_code != otp_code:
            pending.attempts += 1
            pending.save()
            remaining = 5 - pending.attempts
            return Response(
                {'error': f'Invalid code. {remaining} attempt(s) remaining.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # OTP is correct — create the real user
        from django.contrib.auth.hashers import check_password
        user = CustomUser.objects.create(
            email=pending.email,
            username=pending.username,
            is_email_verified=True,
        )
        user.password = pending.password_hash
        user.save()

        # Clean up the pending record
        pending.delete()

        tokens = get_tokens_for_user(user)
        return Response(
            {
                'message': 'Account verified successfully.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                **tokens,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_email_verified:
            return Response(
                {'error': 'Please verify your email before logging in.'},
                status=status.HTTP_403_FORBIDDEN
            )

        tokens = get_tokens_for_user(user)
        return Response(
            {
                'message': 'Login successful.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                **tokens,
            },
            status=status.HTTP_200_OK
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        # Always return success to prevent email enumeration
        try:
            user = CustomUser.objects.get(email=email)
            # Delete any existing unused tokens
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()

            reset_token = PasswordResetToken.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(hours=1),
            )
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
            send_password_reset_email(email, user.username, reset_url)
        except CustomUser.DoesNotExist:
            pass  # Silently ignore — don't reveal if email exists

        return Response(
            {'message': 'If an account with that email exists, you will receive a password reset link.'},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token_uuid = serializer.validated_data['token']
        new_password = serializer.validated_data['password']

        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(
                token=token_uuid, is_used=False
            )
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'error': 'Invalid or already used reset link.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reset_token.is_expired():
            reset_token.delete()
            return Response(
                {'error': 'This password reset link has expired.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.is_used = True
        reset_token.save()

        return Response(
            {'message': 'Password updated successfully. You can now log in.'},
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={'request': request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return onboarding answers for the logged-in user, or empty if not yet completed."""
        try:
            profile = UserOnboarding.objects.get(user=request.user)
            return Response({
                'has_completed_onboarding': request.user.has_completed_onboarding,
                'answers': profile.answers,
                'completed_at': profile.completed_at,
            }, status=status.HTTP_200_OK)
        except UserOnboarding.DoesNotExist:
            return Response({
                'has_completed_onboarding': False,
                'answers': {},
            }, status=status.HTTP_200_OK)

    def post(self, request):
        """Save onboarding answers and mark user onboarding as complete."""
        serializer = OnboardingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']

        # Upsert the onboarding profile
        UserOnboarding.objects.update_or_create(
            user=request.user,
            defaults={'answers': answers}
        )

        # Mark the user as having completed onboarding
        request.user.has_completed_onboarding = True
        request.user.save(update_fields=['has_completed_onboarding'])

        return Response({
            'message': 'Onboarding profile saved successfully.',
            'has_completed_onboarding': True,
        }, status=status.HTTP_200_OK)


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the user's current subscription status."""
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        # Auto-deactivate if expired
        if sub.is_active and sub.expires_at and timezone.now() >= sub.expires_at:
            sub.is_active = False
            sub.save(update_fields=['is_active'])
        return Response(SubscriptionSerializer(sub).data)


class ActivateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Manually activate a 10-day subscription sprint (no payment gateway)."""
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        sub.is_active = True
        sub.activated_at = timezone.now()
        sub.expires_at = timezone.now() + timedelta(days=10)
        sub.save()
        return Response(
            SubscriptionSerializer(sub).data,
            status=status.HTTP_200_OK
        )


class CreateStripeCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            # Get or create subscription to check for existing Stripe Customer ID
            sub, _ = Subscription.objects.get_or_create(user=user)
            
            customer_id = sub.stripe_customer_id
            
            # If no customer ID, create one in Stripe
            if not customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.username,
                    metadata={'user_id': user.id}
                )
                customer_id = customer.id
                sub.stripe_customer_id = customer_id
                sub.save(update_fields=['stripe_customer_id'])

            # Create a checkout session using the customer ID
            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': 'Elite Access - 10-Day Sprint',
                                'description': 'Full access to the protocol for 10 days.',
                            },
                            'unit_amount': 2900,  # $29.00
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=f"{settings.FRONTEND_URL}/success",
                cancel_url=f"{settings.FRONTEND_URL}/subscription",
                metadata={
                    'user_id': user.id,
                }
            )

            # Save the session ID to the user's subscription
            sub, _ = Subscription.objects.get_or_create(user=user)
            sub.stripe_checkout_session_id = checkout_session.id
            sub.payment_status = 'pending'
            
            sub.save()

            return Response({'url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]  # Stripe needs to reach this without auth

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        if not endpoint_secret:
            return Response({"error": "Webhook secret not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            metadata = getattr(session, 'metadata', {})
            if isinstance(metadata, dict):
                user_id = metadata.get('user_id')
            else:
                user_id = getattr(metadata, 'user_id', None)
            
            print(f"DEBUG: Webhook received for session {session.id}, user_id: {user_id}")

            if user_id:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    sub, _ = Subscription.objects.get_or_create(user=user)
                    sub.is_active = True
                    sub.payment_status = 'paid'
                    sub.stripe_customer_id = getattr(session, 'customer', None)
                    sub.activated_at = timezone.now()
                    sub.expires_at = timezone.now() + timedelta(days=10)
                    sub.save()
                    print(f"DEBUG: Subscription activated for user {user.email}")
                except CustomUser.DoesNotExist:
                    print(f"DEBUG: User {user_id} not found")
                except Exception as e:
                    print(f"DEBUG: Error updating subscription: {str(e)}")

        return Response(status=status.HTTP_200_OK)


from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
