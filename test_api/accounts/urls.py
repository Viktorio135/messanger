from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views
from .views import UserProfileViewSet, ContactsViewSet, SearchApiView


from .views import *

app_name = 'accounts'

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profiles')


urlpatterns = [
    path('', include(router.urls)),
    path("search/", SearchApiView.as_view(), name="search"),
    path("contacts/", ContactsViewSet.as_view(), name="contacts"),
    path('registration/', CreateUser.as_view(), name='create_user'),
    path('logout/', LogOutSession.as_view(), name='logout'),
    path('token/', 
          jwt_views.TokenObtainPairView.as_view(), 
          name ='token_obtain_pair'),
     path('token/refresh/', 
          jwt_views.TokenRefreshView.as_view(), 
          name ='token_refresh')
]
