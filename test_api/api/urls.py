from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views


from .views import *

app_name = 'api'

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'relations', RelationsViewSet)



urlpatterns = [
    path('', include(router.urls)),
    path('accounts/', include('accounts.urls')),
    path('messages/', include('chat_messages.urls'),)

]
