from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views


from .views import *

app_name = 'messages'

router = DefaultRouter()
router.register(r'chat', ChatViewSet)
router.register(r'message', MessageViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
