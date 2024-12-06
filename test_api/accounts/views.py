from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action





from .serializers import UserSerializer, ProfileSerializer, ContactSerializer
from .models import User



class CreateUser(APIView):

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user = authenticate(username=request.data['username'], password=request.data['password'])
            if user:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }, status=status.HTTP_201_CREATED)
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        print(serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class IsAuth(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)



class LogOutSession(APIView):

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            if 'Token is blacklisted' in str(e):
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
            

class UserProfileViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username']



class ContactsViewSet(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            username = request.query_params.get('username')
            contacts = User.objects.get(username=username)
            serializer_data = ContactSerializer(contacts, context={'request': request})
            if serializer_data.is_valid:
                return Response(data=serializer_data.data, status=status.HTTP_200_OK)
        except:
            return Response(exception=True, status=status.HTTP_400_BAD_REQUEST)

    
    def post(self, request, *args, **kwargs):
        try:
            username = request.data.get('username')
            contact = request.data.get('contact')
            user = User.objects.get(username=username)
            contact = User.objects.get(username=contact)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.contacts.add(contact)
        sereializer_data = ContactSerializer(contact, context={'request': request})
        return Response(sereializer_data.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        try:
            print(request.data)
            username = request.data.get('username')
            contact = request.data.get('contact')
            user = User.objects.get(username=username)
            contact = User.objects.get(username=contact)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user.contacts.remove(contact)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ContactCheckView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            username = request.query_params.get('username')
            contact = request.query_params.get('contact')
            if not username or not contact:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(username=username)
            is_in_contacts = user.contacts.filter(username=contact).exists()
            return Response(data={'isInContacts': is_in_contacts}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SearchApiView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('search', '')
        if not query:
            return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        users = User.objects.filter(
                username__istartswith=query
            ) | User.objects.filter(
                first_name__istartswith=query
            ) | User.objects.filter(
                last_name__istartswith=query
            )
        serializer_data = ProfileSerializer(users, many=True, context={'request': request})
        return Response(serializer_data.data, status=status.HTTP_200_OK)


        
        
    

    