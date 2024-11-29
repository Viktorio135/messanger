from .models import User
from .models import Post, UserPostRelation, Chat, Message
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'description', 'avatar')
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False},
            'description': {'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CreatePostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    likes_count = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()


    class Meta:
        model = Post
        fields = ('text', 'username', 'author_name', 'likes_count')

    def get_likes_count(self, instance):
        return UserPostRelation.objects.all().filter(post=instance, like=True).count()
    
    def get_author_name(self, instance):
        return instance.author.username

    def create(self, validated_data):
        username = validated_data.pop('username')
        try:
            author = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this username does not exist.")

        post = Post.objects.create(author=author, **validated_data)
        post.username = username
        return post


class RelationsViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserPostRelation
        fields = ('post', 'user', 'like', 'bookmarked')


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

    


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'description', 'avatar')

