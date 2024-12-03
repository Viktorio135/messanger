from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import UpdateModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated



from .serializers import *
from .models import Post, UserPostRelation



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
    












    

