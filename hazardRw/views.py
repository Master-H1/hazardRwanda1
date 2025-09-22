from django.shortcuts import render

# Create your views here.
# Hazard insights
def homePageView(request):
    return render(request, "hazard.html")

# Dashboard view
def dashboardView(request):
    return render(request, 'dashboard.html')

# Community View
def communityView(request):
    return render(request, 'community.html')

# Reports view
def reportView(request):
    return render(request, 'reports.html')

# Notifications view
def notificationsView(request):
    return render(request, 'notifications.html')

# About / Overview
def aboutView(request):
    return render(request, "overview.html")