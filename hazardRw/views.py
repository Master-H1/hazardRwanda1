from django.shortcuts import render

# These views will render your HTML pages.
# The dashboard view is where the map will be.

def homePageView(request):
    # This can be your landing page or redirect to the dashboard
    return render(request, 'hazard.html')

def dashboardView(request):
    return render(request, 'dashboard.html')

def communityView(request):
    return render(request, 'community.html')

def reportView(request):
    return render(request, 'reports.html')

def notificationsView(request):
    return render(request, 'notifications.html')

def aboutView(request):
    return render(request, 'overview.html')

def dashboardNewView(request):
    return render(request, 'dashboard_new.html')