# from django.contrib.gis.db import models

# # defining data table from shape file to db of disaster case
# class DisasterShape(models.Model):
#     date = models.DateField(null=True, blank=True)
#     province = models.CharField(max_length=100)
#     district = models.CharField(max_length=100)
#     disaster_type = models.CharField(max_length=100, null=True, blank=True)
#     total_deaths = models.FloatField(null=True, blank=True)
#     total_affected = models.FloatField(null=True, blank=True)
#     geom = models.MultiPolygonField(srid=4326)

#     def __str__(self):
#         return f"{self.district} ({self.disaster_type})"
