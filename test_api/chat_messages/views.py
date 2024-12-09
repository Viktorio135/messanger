import json
import time
import hashlib


from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Chat, Message
from accounts.models import User
from .serializers import ChatSerializer, MessageSerializer, TextEventStreamRenderer
from accounts.serializers import ProfileSerializer



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
                'last_message': Message.objects.filter(chat_id=chat['id']).last().text if Message.objects.filter(chat_id=chat['id']).exists() else None
            }
            serializer_data = ProfileSerializer(User.objects.get(username=chat_data['user']), context={'request': request})
            chat_data['user_data'] = serializer_data.data
            modified_data.append(chat_data)

        return Response(modified_data)
    
    @action(detail=False, methods=['get'], url_path=r'sse/(?P<username>[a-zA-Z0-9-]+)', renderer_classes=[TextEventStreamRenderer])
    def get_last_message(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            Response(data={'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        def event_stream():
            last_messages = None
            while True:
                chats = Chat.objects.filter(user1=user) | Chat.objects.filter(user2=user)
                if chats.exists():
                    data = {}
                    for chat in chats:
                        serializer = self.get_serializer(chat)
                        data[serializer.data['id']] = serializer.data['last_message']
                    
                    new_messages = data
                    
                    # Отправляем данные только если они изменились
                    if last_messages != new_messages:
                        last_messages = new_messages
                        yield f'data: {json.dumps(data)}\n\n'
                
                time.sleep(1)
        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')

        return response



        
        
    
    @action(detail=False, methods=['post'])
    def create_or_get_chat(self, request):
        user1 = request.data.get('user1')
        user2 = request.data.get('user2')

        if not user2:
            return Response({"error": "User2 ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user1 = User.objects.get(username=user1)
            user2 = User.objects.get(username=user2)
        except User.DoesNotExist:
            return Response({"error": "User1 or User2 does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Проверяем, существует ли уже чат между этими двумя пользователями
        chat = Chat.objects.filter(user1=user1, user2=user2).first()
        if not chat:
            chat = Chat.objects.filter(user1=user2, user2=user1).first()

        if not chat:
            # Если чат не существует, создаем новый чат
            chat = Chat.objects.create(user1=user1, user2=user2)

        serializer = ChatSerializer(chat)
        return Response(serializer.data, status=status.HTTP_200_OK)



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

