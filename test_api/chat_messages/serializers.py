from rest_framework import serializers
from rest_framework.renderers import BaseRenderer
from .models import Chat, Message
from accounts.models import User


class TextEventStreamRenderer(BaseRenderer):
    media_type = 'text/event-stream'
    format = 'text'
    charset = 'utf-8'

    def render(self, data, media_type=None, renderer_context=None):
        return data



class ChatSerializer(serializers.ModelSerializer):
    user1 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    user2 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())


    class Meta:
        model = Chat
        fields = ('id', 'user1', 'user2')




class MessageSerializer(serializers.ModelSerializer):


    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'text', 'created_at')

    