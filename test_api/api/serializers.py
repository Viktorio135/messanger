from accounts.models import User
from .models import Post, UserPostRelation
from rest_framework import serializers





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




