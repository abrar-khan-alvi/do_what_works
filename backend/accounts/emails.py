import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def generate_otp():
    """Generate a 6-digit numeric OTP code."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email: str, username: str, otp_code: str):
    """Send a beautiful HTML OTP verification email."""
    subject = 'Your Do What Works Verification Code'
    context = {
        'username': username,
        'otp_code': otp_code,
        'expires_minutes': 10,
    }
    html_content = render_to_string('accounts/emails/otp_verification.html', context)
    text_content = (
        f'Hi {username},\n\n'
        f'Your verification code is: {otp_code}\n\n'
        f'This code expires in 10 minutes.\n\n'
        f'If you did not request this, please ignore this email.'
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    email_msg.attach_alternative(html_content, 'text/html')
    email_msg.send(fail_silently=False)


def send_password_reset_email(email: str, username: str, reset_url: str):
    """Send a password reset link email."""
    subject = 'Reset Your Do What Works Password'
    context = {
        'username': username,
        'reset_url': reset_url,
        'expires_hours': 1,
    }
    html_content = render_to_string('accounts/emails/password_reset.html', context)
    text_content = (
        f'Hi {username},\n\n'
        f'Click the link below to reset your password:\n{reset_url}\n\n'
        f'This link expires in 1 hour.\n\n'
        f'If you did not request this, please ignore this email.'
    )
    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    email_msg.attach_alternative(html_content, 'text/html')
    email_msg.send(fail_silently=False)
