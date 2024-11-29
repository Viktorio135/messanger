import json
import time

from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import UpdateModelMixin, CreateModelMixin
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.tokens import RefreshToken





from .serializers import *
from .models import Post, UserPostRelation, Chat, Message, User


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
        except Exception as e:
               return Response(status=status.HTTP_400_BAD_REQUEST)
            
class UserProfileViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username']


class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = CreatePostSerializer
    permission_classes = [IsAuthenticated]
    


class RelationsViewSet(UpdateModelMixin, GenericViewSet, CreateModelMixin):
    queryset = UserPostRelation.objects.all()
    serializer_class = RelationsViewSerializer
    lookup_field = 'post'
    
    def post(self, request):
        serializer = self.serializer_class(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get('user')
        if username:
            try:
                user = User.objects.get(username=username)
                user_id = user.id
                queryset = queryset.filter(user1=user_id) | queryset.filter(user2=user_id)
            except User.DoesNotExist:
                queryset = queryset.none()
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        username = self.request.query_params.get('user')
        modified_data = []
        for chat in serializer.data:
            user1 = User.objects.get(id=chat['user1']).username
            user2 = User.objects.get(id=chat['user2']).username
            chat_data = {
                'id': chat['id'],
                'user': user1 if username == user2 else user2,
            }
            modified_data.append(chat_data)

        return Response(modified_data)


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    # permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['chat']

    def create(self, request, *args, **kwargs):
        username = request.data.get('sender')
        user = User.objects.get(username=username)
        request.data['sender'] = user.id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        chat_data = {
            'id': serializer.data['id'],
            'chat': serializer.data['chat'],
            'sender': User.objects.get(id=serializer.data['sender']).username,
            'text': serializer.data['text'],
            'created_at': serializer.data['created_at']
        }
        return Response(chat_data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        modified_data = []

        for message in serializer.data:
            chat_data = {
                'id': message['id'],
                'chat': message['chat'],
                'sender': User.objects.get(id=message['sender']).username,
                'text': message['text'],
                'created_at': message['created_at']
            }
            modified_data.append(chat_data)
        return Response(modified_data)
    
    @action(detail=False, methods=['get'], url_path=r'sse_messages/(?P<chat_id>\d+)', renderer_classes=[TextEventStreamRenderer])
    def sse_messages(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        last_message_id = request.GET.get('last_message_id', None)
        try:
            last_message_id = int(last_message_id) if last_message_id else 0
        except ValueError:
            last_message_id = 0

        def event_stream():
            nonlocal last_message_id
            while True:
                messages = Message.objects.filter(chat=chat, id__gt=last_message_id).order_by('id')
                if messages.exists():
                    for msg in messages:
                        serializer = MessageSerializer(msg)
                        data = serializer.data
                        data['sender'] = msg.sender.username
                        yield f"data: {json.dumps(data)}\n\n"
                        last_message_id = msg.id
                time.sleep(1)

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        return response













    

