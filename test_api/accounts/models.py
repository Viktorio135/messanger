from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings


def avatar_upload_path(instance, filename):
    return f'avatars/{filename}'

class User(AbstractUser):
    first_name = models.CharField(max_length=30, blank=True, default='Иван')
    last_name = models.CharField(max_length=50, blank=True, default='Иванов')
    description = models.TextField(blank=False)
    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True, default='avatars/default_avatar.png')
    contacts = models.ManyToManyField('self', symmetrical=False, related_name='user_friends', )

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
  