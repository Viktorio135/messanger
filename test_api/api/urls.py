"""
URL configuration for test_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views


from .views import *

app_name = 'api'

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'relations', RelationsViewSet)
router.register(r'chat', ChatViewSet)
router.register(r'message', MessageViewSet)
router.register(r'profile', UserProfileViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('registration/', CreateUser.as_view(), name='create_user'),
    path('logout/', LogOutSession.as_view(), name='logout'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh')
]
