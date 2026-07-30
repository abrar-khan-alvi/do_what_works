from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve as serve_static

from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy", "version": "1.0.0"})

urlpatterns = [
    path('health/', health_check),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/', include('experiments.urls')),
]

# django.conf.urls.static.static() silently no-ops when DEBUG=False, which meant
# uploaded profile photos 404'd in production. Serve media unconditionally instead.
# Fine for low/moderate traffic; move to S3/Cloudinary + django-storages before scaling.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
]
