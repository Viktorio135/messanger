from django.test import TestCase
from django.urls import reverse
from rest_framework import status


class TestCases(TestCase):
    

    def test_create_login_and_update_user(self):
        #create
        url = reverse('api:create_user')
        data = {
            "username": "test_user",
            "password": "0000"
        }
        response = self.client.post(
            url,
            data=data,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['csrf'])
        self.assertTrue(response.data['sessionid'])
        scrf = response.data['csrf']
        #logout
        url = reverse('api:logout')
        response = self.client.post(
            url,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        #login
        url = reverse('api:update_session')
        data = {
            "username": "test_user",
            "password": "0000"
        }
        headers = {
            "X-CSRFToken": scrf
        }
        response = self.client.post(
            url,
            data=data,
            content_type='application/json',
            headers=headers
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['csrf'])
        self.assertTrue(response.data['sessionid'])

    def test_post_view(self):
        url = reverse('api:create_user')
        data = {
            "username": "test_user2",
            "password": "0000"
        }
        response = self.client.post(
            url,
            data=data,
            content_type='application/json'
        )
        scrf = response.data['csrf']
        url = 'http://127.0.0.1:8000/api/posts/'
        response = self.client.get(url, headers={
            "X-CSRFToken": scrf
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)








