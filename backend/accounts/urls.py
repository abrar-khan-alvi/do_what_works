from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', views.SignUpView.as_view(), name='auth-signup'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='auth-reset-password'),
    path('profile/', views.ProfileView.as_view(), name='auth-profile'),
    path('onboarding/', views.OnboardingView.as_view(), name='auth-onboarding'),
    path('subscription/', views.SubscriptionView.as_view(), name='auth-subscription'),
    path('subscription/activate/', views.ActivateSubscriptionView.as_view(), name='auth-subscription-activate'),
    # Stripe integration
    path('stripe/create-checkout/', views.CreateStripeCheckoutView.as_view(), name='stripe-create-checkout'),
    path('stripe/webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
