from django.db import models
from django.contrib.auth.models import AbstractUser

def avatar_upload_path(instance, filename):
    return f'avatars/{filename}'

class User(AbstractUser):
    first_name = models.CharField(max_length=30, blank=True, default='Иван')
    last_name = models.CharField(max_length=50, blank=True, default='Иванов')
    description = models.TextField(blank=False)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True, default='avatars/default_avatar.png')

    # Добавляем related_name для полей groups и user_permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='profile_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='profile_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class Post(models.Model):
    text = models.TextField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default='Not found', related_name='author')
    data = models.DateTimeField(auto_now=True)

class UserPostRelation(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.BooleanField(default=False)
    bookmarked = models.BooleanField(default=False)

class Chat(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user2")

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)