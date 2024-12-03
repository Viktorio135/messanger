from .models import User
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


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'description', 'avatar')

  


class ContactSerializer(serializers.ModelSerializer):
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'avatar', 'contacts')

    def get_contacts(self, instance):
        contacts = instance.contacts.all()
        return ProfileSerializer(contacts, many=True, context=self.context).data
    

    
