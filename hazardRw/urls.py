from django.urls import path
from . import views

urlpatterns = [
    path("", views.homePageView, name="home"),
    path("dashboard/", views.dashboardView, name="dashboard"),
    path("community/", views.communityView, name="community"),
    path("reports/", views.reportView, name='reports'),   
    path("notifications/", views.notificationsView, name="notifications"),
    path("overview/", views.aboutView, name="overview"),
    path("dashboard_new/", views.dashboardNewView, name="dashboard_new"),
    
]