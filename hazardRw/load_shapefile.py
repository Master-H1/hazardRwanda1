import os
from django.contrib.gis.utils import LayerMapping
from .models import DisasterShape

# Path to your shapefile (.shp)
shapefile = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "data/disasters.shp")
)

# Map model fields to shapefile attribute names
mapping = {
    "date": "Date",
    "province": "Province",
    "district": "District",
    "disaster_type": "Disaster_1",
    "total_deaths": "Total Deat",
    "total_affected": "Total Affe",
    "geom": "MULTIPOLYGON",  # geometry
}

def run(verbose=True):
    lm = LayerMapping(
        DisasterShape, shapefile, mapping,
        transform=True, encoding="utf-8"
    )
    lm.save(strict=True, verbose=verbose)
