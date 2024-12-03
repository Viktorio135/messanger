from django.db import models

from accounts.models import User

class Post(models.Model):
    text = models.TextField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default='Not found', related_name='author')
    data = models.DateTimeField(auto_now=True)

class UserPostRelation(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.BooleanField(default=False)
    bookmarked = models.BooleanField(default=False)

