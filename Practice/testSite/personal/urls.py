from django.conf.urls import include, url
from . import views

urlpatterns = [
	url('^website/', include('website.urls')),
	url(r'^', views.index, name='index'),
]
