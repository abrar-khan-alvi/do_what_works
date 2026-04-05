from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
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
]
