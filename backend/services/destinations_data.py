import math
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from backend.models import Activity, ItineraryDay, PackingItem

# ------------------------------------------------------------------------------
# 1. Global Coordinates Registry for 100+ Top Travel Destinations
# ------------------------------------------------------------------------------
KNOWN_CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    # India
    "goa": (15.4989, 73.8278),
    "jaipur": (26.9124, 75.7873),
    "manali": (32.2432, 77.1892),
    "kerala": (9.9312, 76.2673),
    "kochi": (9.9312, 76.2673),
    "cochin": (9.9312, 76.2673),
    "alleppey": (9.4981, 76.3388),
    "alappuzha": (9.4981, 76.3388),
    "mumbai": (18.9220, 72.8347),
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "agra": (27.1767, 78.0081),
    "varanasi": (25.3176, 82.9739),
    "udaipur": (24.5854, 73.7125),
    "shimla": (31.1048, 77.1734),
    "rishikesh": (30.0869, 78.2676),
    "ladakh": (34.1526, 77.5771),
    "leh": (34.1526, 77.5771),
    "darjeeling": (27.0410, 88.2663),
    "pondicherry": (11.9416, 79.8083),
    "puducherry": (11.9416, 79.8083),
    "ooty": (11.4102, 76.6950),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "amritsar": (31.6340, 74.8723),
    "jodhpur": (26.2389, 73.0243),
    "mysore": (12.2958, 76.6394),
    "mysuru": (12.2958, 76.6394),
    "hampi": (15.3350, 76.4600),
    "srinagar": (34.0837, 74.7973),
    "kashmir": (34.0837, 74.7973),
    "andaman": (11.6234, 92.7265),
    "port blair": (11.6234, 92.7265),

    # Asia & Middle East
    "tokyo": (35.6762, 139.6503),
    "kyoto": (35.0116, 135.7681),
    "osaka": (34.6937, 135.5023),
    "dubai": (25.2048, 55.2708),
    "abu dhabi": (24.4539, 54.3773),
    "singapore": (1.3521, 103.8198),
    "bangkok": (13.7563, 100.5018),
    "phuket": (7.8804, 98.3923),
    "bali": (-8.3405, 115.0920),
    "kuala lumpur": (3.1390, 101.6869),
    "seoul": (37.5665, 126.9780),
    "hong kong": (22.3193, 114.1694),
    "taipei": (25.0330, 121.5654),
    "hanoi": (21.0285, 105.8542),
    "ho chi minh": (10.8231, 106.6297),
    "siem reap": (13.3671, 103.8448),
    "maldives": (4.1755, 73.5093),
    "male": (4.1755, 73.5093),
    "doha": (25.2854, 51.5310),
    "riyadh": (24.7136, 46.6753),
    "kathmandu": (27.7172, 85.3240),
    "colombo": (6.9271, 79.8612),

    # Europe
    "paris": (48.8566, 2.3522),
    "london": (51.5074, -0.1278),
    "rome": (41.9028, 12.4964),
    "barcelona": (41.3879, 2.1699),
    "madrid": (40.4168, -3.7038),
    "amsterdam": (52.3676, 4.9041),
    "berlin": (52.5200, 13.4050),
    "munich": (48.1351, 11.5820),
    "vienna": (48.2082, 16.3738),
    "prague": (50.0755, 14.4378),
    "budapest": (47.4979, 19.0402),
    "florence": (43.7696, 11.2558),
    "venice": (45.4408, 12.3155),
    "milan": (45.4642, 9.1900),
    "zurich": (47.3769, 8.5417),
    "geneva": (46.2044, 6.1432),
    "interlaken": (46.6863, 7.8632),
    "lucerne": (47.0502, 8.3093),
    "athens": (37.9838, 23.7275),
    "santorini": (36.3932, 25.4615),
    "lisbon": (38.7223, -9.1393),
    "porto": (41.1579, -8.6291),
    "edinburgh": (55.9533, -3.1883),
    "dublin": (53.3498, -6.2603),
    "brussels": (50.8503, 4.3517),
    "copenhagen": (55.6761, 12.5683),
    "stockholm": (59.3293, 18.0686),
    "oslo": (59.9139, 10.7522),
    "helsinki": (60.1699, 24.9384),
    "reykjavik": (64.1466, -21.9426),
    "iceland": (64.1466, -21.9426),
    "istanbul": (41.0082, 28.9784),

    # Americas & Oceania
    "new york": (40.7128, -74.0060),
    "new york city": (40.7128, -74.0060),
    "nyc": (40.7128, -74.0060),
    "san francisco": (37.7749, -122.4194),
    "los angeles": (34.0522, -118.2437),
    "las vegas": (36.1699, -115.1398),
    "chicago": (41.8781, -87.6298),
    "miami": (25.7617, -80.1918),
    "seattle": (47.6062, -122.3321),
    "boston": (42.3601, -71.0589),
    "washington": (38.9072, -77.0369),
    "toronto": (43.6532, -79.3832),
    "vancouver": (49.2827, -123.1207),
    "montreal": (45.5017, -73.5673),
    "cancun": (21.1619, -86.8515),
    "mexico city": (19.4326, -99.1332),
    "rio de janeiro": (-22.9068, -43.1729),
    "buenos aires": (-34.6037, -58.3816),
    "sydney": (-33.8688, 151.2093),
    "melbourne": (-37.8136, 144.9631),
    "auckland": (-36.8485, 174.7633),
    "cairo": (30.0444, 31.2357),
    "cape town": (-33.9249, 18.4241),
}

def resolve_destination_coordinates(dest_name: str) -> Tuple[float, float]:
    """Resolves latitude and longitude for any destination string."""
    cleaned = dest_name.lower().strip()
    
    # Direct match
    if cleaned in KNOWN_CITY_COORDINATES:
        return KNOWN_CITY_COORDINATES[cleaned]
        
    # Substring / partial match
    for city, coords in KNOWN_CITY_COORDINATES.items():
        if city in cleaned or cleaned in city:
            return coords
            
    # Deterministic procedural coordinates based on city name hash (consistent per city)
    h = hash(cleaned)
    lat = 10.0 + (abs(h) % 450) / 10.0  # between 10.0 and 55.0 N
    lng = -20.0 + (abs(h // 100) % 1500) / 10.0  # between -20.0 and 130.0
    return (round(lat, 4), round(lng, 4))


# ------------------------------------------------------------------------------
# 2. Rich Curated Destinations Library
# ------------------------------------------------------------------------------
CURATED_DESTINATIONS: Dict[str, Dict[str, Any]] = {
    "goa": {
        "center": {"lat": 15.4989, "lng": 73.8278},
        "theme": "beach",
        "days": [
            {
                "title": "Day 1: Arrival, Coastal Vibe & Sunset Beach Welcome",
                "planned_budget": 5000.0,
                "activities": [
                    {
                        "name": "Check-in & Coastal Cafe Refreshment",
                        "start_time": "11:30 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1200.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Food & Relaxation",
                        "explanation": "Relaxing arrival stop overlooking North Goa coastline with fresh tender coconut and Goan poi sandwiches.",
                        "location_name": "Calangute Seaside Cafe",
                        "latitude": 15.5434,
                        "longitude": 73.7554
                    },
                    {
                        "name": "Baga Beach Watersports & Sunbathing",
                        "start_time": "03:00 PM",
                        "end_time": "05:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 2200.0,
                        "category": "Beach",
                        "priority": "HIGH",
                        "preference_match": "Direct Match: Beach & Adventure",
                        "explanation": "Iconic energetic shoreline featuring parasailing, beach lounging, and Arabian Sea views.",
                        "location_name": "Baga Beach",
                        "latitude": 15.5553,
                        "longitude": 73.7517
                    },
                    {
                        "name": "Sunset Dining at Shore Shack",
                        "start_time": "06:30 PM",
                        "end_time": "09:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1600.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Direct Match: Food & Beach",
                        "explanation": "Authentic candlelit beach dinner with Goan fish curry, prawn balchao, and sunset acoustics.",
                        "location_name": "Britto's Baga Beach",
                        "latitude": 15.5562,
                        "longitude": 73.7512
                    }
                ]
            },
            {
                "title": "Day 2: Portuguese Heritage & Historic Forts",
                "planned_budget": 8000.0,
                "activities": [
                    {
                        "name": "Fort Aguada & Historic Lighthouse Exploration",
                        "start_time": "09:30 AM",
                        "end_time": "12:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1000.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Direct Match: Culture & History",
                        "explanation": "17th-century Portuguese fortress commanding panoramic vantage points over the Mandovi estuary.",
                        "location_name": "Fort Aguada, Candolim",
                        "latitude": 15.4920,
                        "longitude": 73.7737
                    },
                    {
                        "name": "Sinquerim Bay Kayaking / Water Activity",
                        "start_time": "01:30 PM",
                        "end_time": "03:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 2500.0,
                        "category": "Adventure",
                        "priority": "MEDIUM",
                        "preference_match": "Direct Match: Adventure",
                        "explanation": "Gentle ocean kayaking and dolphin spotting excursion along the Sinquerim cliff line.",
                        "location_name": "Sinquerim Beach",
                        "latitude": 15.4984,
                        "longitude": 73.7671
                    },
                    {
                        "name": "Premium Heritage Resort Fine Dining",
                        "start_time": "07:00 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 4500.0,
                        "category": "Food",
                        "priority": "LOW",
                        "preference_match": "Luxury Dining",
                        "explanation": "Fine dining Indo-Portuguese degustation dinner at a boutique colonial estate.",
                        "location_name": "Taj Fort Aguada Dining Room",
                        "latitude": 15.4938,
                        "longitude": 73.7719
                    }
                ]
            },
            {
                "title": "Day 3: Old Goa Cathedrals & Fontainhas Latin Quarter",
                "planned_budget": 9000.0,
                "activities": [
                    {
                        "name": "Basilica of Bom Jesus & Se Cathedral (UNESCO)",
                        "start_time": "09:30 AM",
                        "end_time": "12:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 800.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Direct Match: Culture & Heritage",
                        "explanation": "World Heritage site holding the sacred relics of St. Francis Xavier, exemplary baroque architecture.",
                        "location_name": "Old Goa, Velha Goa",
                        "latitude": 15.5009,
                        "longitude": 73.9116
                    },
                    {
                        "name": "Fontainhas Latin Quarter Heritage Walk & Cafe",
                        "start_time": "02:00 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Culture & Photography",
                        "explanation": "Wander pastel Portuguese villas, terracotta roofs, and historic art cafes in Panaji.",
                        "location_name": "Fontainhas, Panaji",
                        "latitude": 15.4989,
                        "longitude": 73.8315
                    },
                    {
                        "name": "Mandovi River Luxury Sunset Cruise & Casino Entry",
                        "start_time": "06:00 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 3.5,
                        "estimated_cost": 7000.0,
                        "category": "Luxury",
                        "priority": "LOW",
                        "preference_match": "Entertainment / Luxury",
                        "explanation": "Evening dinner cruise along Mandovi River with live DJ and offshore gaming pavilion access.",
                        "location_name": "Mandovi River Promenade",
                        "latitude": 15.5020,
                        "longitude": 73.8300
                    }
                ]
            },
            {
                "title": "Day 4: Spice Plantation, Artisan Shopping & Farewell",
                "planned_budget": 8000.0,
                "activities": [
                    {
                        "name": "Sahakari Spice Farm Tour & Traditional Lunch",
                        "start_time": "10:00 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 3.5,
                        "estimated_cost": 2200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Culture & Local Gastronomy",
                        "explanation": "Guided aromatic walk through vanilla, cardamom, and cinnamon groves with an earthen pot buffet feast.",
                        "location_name": "Ponda Spice Plantations",
                        "latitude": 15.4024,
                        "longitude": 74.0150
                    },
                    {
                        "name": "Panjim Flea & Handicraft Boutique Shopping",
                        "start_time": "03:00 PM",
                        "end_time": "05:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 4500.0,
                        "category": "Shopping",
                        "priority": "LOW",
                        "preference_match": "Souvenirs & Boutique Crafts",
                        "explanation": "Boutique Goan feni, Mario Miranda prints, handmade azulejos tiles, and spiced cashews.",
                        "location_name": "Panjim Municipal Market",
                        "latitude": 15.4960,
                        "longitude": 73.8242
                    },
                    {
                        "name": "Miramar Beach Sunset Walk & Farewell Drink",
                        "start_time": "06:00 PM",
                        "end_time": "07:30 PM",
                        "duration_hours": 1.5,
                        "estimated_cost": 1300.0,
                        "category": "Beach",
                        "priority": "HIGH",
                        "preference_match": "Beach & Relaxation",
                        "explanation": "Peaceful sunset stroll where the Mandovi River meets the Arabian Sea.",
                        "location_name": "Miramar Beach, Panaji",
                        "latitude": 15.4831,
                        "longitude": 73.8055
                    }
                ]
            }
        ]
    },

    "paris": {
        "center": {"lat": 48.8566, "lng": 2.3522},
        "theme": "urban",
        "days": [
            {
                "title": "Day 1: Arrival, Eiffel Tower & Seine River Lights",
                "planned_budget": 7500.0,
                "activities": [
                    {
                        "name": "Champ de Mars & Classic Parisian Bistro Welcome",
                        "start_time": "11:30 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 2200.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Authentic French Cuisine",
                        "explanation": "Relaxing lunch terrace with fresh baguettes, quiche lorraine, and café au lait near Champ de Mars.",
                        "location_name": "Cafe de Mars, 7th Arrondissement",
                        "latitude": 48.8560,
                        "longitude": 2.3020
                    },
                    {
                        "name": "Eiffel Tower Summit & Trocadero Gardens Walk",
                        "start_time": "03:00 PM",
                        "end_time": "05:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 3200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Iconic Sightseeing",
                        "explanation": "Ascend the iconic Iron Lady for 360-degree panoramas of Paris and stroll Trocadero fountains.",
                        "location_name": "Eiffel Tower, Champ de Mars",
                        "latitude": 48.8584,
                        "longitude": 2.2945
                    },
                    {
                        "name": "Seine River Evening Illumination Cruise",
                        "start_time": "07:00 PM",
                        "end_time": "09:00 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 2100.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Atmospheric Sightseeing & River Vibe",
                        "explanation": "Glass-canopy boat glide past illuminated Pont Alexandre III, Musee d'Orsay, and Notre-Dame.",
                        "location_name": "Port de la Bourdonnais Dock",
                        "latitude": 48.8615,
                        "longitude": 2.2980
                    }
                ]
            },
            {
                "title": "Day 2: Louvre World Treasures & Palais Garnier",
                "planned_budget": 8500.0,
                "activities": [
                    {
                        "name": "Louvre Museum Masterpieces & Glass Pyramid Tour",
                        "start_time": "09:30 AM",
                        "end_time": "01:00 PM",
                        "duration_hours": 3.5,
                        "estimated_cost": 2800.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "World Heritage Art & History",
                        "explanation": "Guided walk to Mona Lisa, Venus de Milo, Winged Victory, and royal French crown jewels.",
                        "location_name": "Louvre Museum, 1st Arrondissement",
                        "latitude": 48.8606,
                        "longitude": 2.3376
                    },
                    {
                        "name": "Tuileries Garden Stroll & Angelina Hot Chocolate",
                        "start_time": "02:00 PM",
                        "end_time": "04:00 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1600.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Leisure & Sweet Delicacies",
                        "explanation": "Royal landscaped gardens leading to famous French artisanal hot chocolate and Mont-Blanc pastry.",
                        "location_name": "Jardin des Tuileries, Rue de Rivoli",
                        "latitude": 48.8635,
                        "longitude": 2.3275
                    },
                    {
                        "name": "Opera Garnier & Grand Boulevard Luxury Dining",
                        "start_time": "06:30 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 4100.0,
                        "category": "Luxury",
                        "priority": "LOW",
                        "preference_match": "Opulent Architectural Heritage",
                        "explanation": "Beaux-Arts opera house visit followed by three-course classic duck confit and Bordeaux pairing.",
                        "location_name": "Palais Garnier, Place de l'Opera",
                        "latitude": 48.8719,
                        "longitude": 2.3316
                    }
                ]
            },
            {
                "title": "Day 3: Montmartre Bohemian Artists & Latin Quarter",
                "planned_budget": 7000.0,
                "activities": [
                    {
                        "name": "Sacre-Coeur Basilica & Montmartre Artists Square",
                        "start_time": "09:30 AM",
                        "end_time": "12:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Bohemian Art & Panoramic Views",
                        "explanation": "Hilltop Roman-Byzantine basilica overlooking Paris skyline, cobblestone alleys, and easel portraitists.",
                        "location_name": "Place du Tertre & Sacre-Coeur",
                        "latitude": 48.8867,
                        "longitude": 2.3431
                    },
                    {
                        "name": "Latin Quarter, Pantheon & Sorbonne Bookstores",
                        "start_time": "02:00 PM",
                        "end_time": "05:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1800.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Intellectual Heritage & Architecture",
                        "explanation": "Historic student quarter, monumental neoclassical Pantheon, and Shakespeare and Company bookstore.",
                        "location_name": "Pantheon, Latin Quarter",
                        "latitude": 48.8462,
                        "longitude": 2.3464
                    },
                    {
                        "name": "Saint-Germain-des-Pres Jazz Club & French Fondue",
                        "start_time": "07:00 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 4000.0,
                        "category": "Food",
                        "priority": "LOW",
                        "preference_match": "Evening Jazz & Wine Culture",
                        "explanation": "Atmospheric cellar jazz club with Savoyard cheese fondue, charcuterie, and live acoustic quartet.",
                        "location_name": "Saint-Germain-des-Pres",
                        "latitude": 48.8539,
                        "longitude": 2.3338
                    }
                ]
            },
            {
                "title": "Day 4: Notre-Dame, Le Marais & Farewell Macarons",
                "planned_budget": 7000.0,
                "activities": [
                    {
                        "name": "Notre-Dame Cathedral & Ile de la Cite Heritage Walk",
                        "start_time": "10:00 AM",
                        "end_time": "01:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1400.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Gothic Architecture & Heart of Paris",
                        "explanation": "Restored 12th-century Gothic masterpiece on the Seine island and colorful flower market.",
                        "location_name": "Parvis Notre-Dame, Ile de la Cite",
                        "latitude": 48.8530,
                        "longitude": 2.3499
                    },
                    {
                        "name": "Le Marais Fashion Boutiques & Place des Vosges",
                        "start_time": "02:30 PM",
                        "end_time": "05:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 4200.0,
                        "category": "Shopping",
                        "priority": "LOW",
                        "preference_match": "Chic Fashion & Historic Arcades",
                        "explanation": "Aristocratic 17th-century mansions, artisan perfumeries, vintage fashion, and falafel in the Jewish quarter.",
                        "location_name": "Place des Vosges, Le Marais",
                        "latitude": 48.8555,
                        "longitude": 2.3656
                    },
                    {
                        "name": "Sunset Macarons at Pont des Arts & Farewell Toast",
                        "start_time": "06:30 PM",
                        "end_time": "08:00 PM",
                        "duration_hours": 1.5,
                        "estimated_cost": 1400.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Romantic Sunset & Pastries",
                        "explanation": "Ladurée macarons and sparkling French cider over the Seine as dusk falls on the city of lights.",
                        "location_name": "Pont des Arts, Passerelle",
                        "latitude": 48.8583,
                        "longitude": 2.3375
                    }
                ]
            }
        ]
    },

    "tokyo": {
        "center": {"lat": 35.6762, "lng": 139.6503},
        "theme": "urban",
        "days": [
            {
                "title": "Day 1: Arrival, Shibuya Crossing & Meiji Shrine",
                "planned_budget": 8000.0,
                "activities": [
                    {
                        "name": "Hachiko Square & Iconic Shibuya Scramble Crossing",
                        "start_time": "11:00 AM",
                        "end_time": "01:00 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1800.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Iconic Tokyo Urban Energy",
                        "explanation": "Witness the world's busiest pedestrian crossing, visit the loyal Hachiko statue, and taste fresh matcha soft serve.",
                        "location_name": "Shibuya Crossing & Hachiko Memorial",
                        "latitude": 35.6595,
                        "longitude": 139.7005
                    },
                    {
                        "name": "Meiji Jingu Shrine & Yoyogi Forest Sanctuary",
                        "start_time": "02:30 PM",
                        "end_time": "05:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Shinto Heritage & Forest Calm",
                        "explanation": "Grand cypress Torii gates leading through 170 acres of tranquil sacred woodland honoring Emperor Meiji.",
                        "location_name": "Meiji Jingu, Shibuya",
                        "latitude": 35.6764,
                        "longitude": 139.6993
                    },
                    {
                        "name": "Harajuku Takeshita Street Crepes & Izakaya Dinner",
                        "start_time": "06:30 PM",
                        "end_time": "09:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 5000.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Japanese Culinary & Kawaii Culture",
                        "explanation": "Vibrant fashion avenue followed by sizzling yakitori skewers, gyoza, and cold draft beer in a lantern-lit alley.",
                        "location_name": "Takeshita Street & Omoide Yokocho",
                        "latitude": 35.6702,
                        "longitude": 139.7027
                    }
                ]
            },
            {
                "title": "Day 2: Historic Asakusa, Senso-ji & Akihabara Tech",
                "planned_budget": 7500.0,
                "activities": [
                    {
                        "name": "Senso-ji Temple & Kaminarimon Thunder Gate",
                        "start_time": "09:00 AM",
                        "end_time": "12:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1000.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Ancient Buddhist Heritage",
                        "explanation": "Tokyo's oldest 7th-century temple, incense purification cauldron, and Nakamise shopping street snacks.",
                        "location_name": "Senso-ji, Asakusa",
                        "latitude": 35.7148,
                        "longitude": 139.7967
                    },
                    {
                        "name": "Tokyo Skytree Observation Deck & Solamachi",
                        "start_time": "01:30 PM",
                        "end_time": "04:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 3000.0,
                        "category": "Sightseeing",
                        "priority": "MEDIUM",
                        "preference_match": "Futuristic Panoramas & Mt Fuji Views",
                        "explanation": "Ascend 634-meter tower for breathtaking vistas across the Tokyo metropolis all the way to Mt. Fuji.",
                        "location_name": "Tokyo Skytree, Sumida",
                        "latitude": 35.7101,
                        "longitude": 139.8107
                    },
                    {
                        "name": "Akihabara Electric Town & Manga Culture Exploration",
                        "start_time": "05:30 PM",
                        "end_time": "08:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 3500.0,
                        "category": "Shopping",
                        "priority": "LOW",
                        "preference_match": "Anime, Gaming & Tech Novelties",
                        "explanation": "Neon-drenched multi-story arcade centers, retro Nintendo stores, and maid cafes in the world capital of geek culture.",
                        "location_name": "Akihabara Electric Town",
                        "latitude": 35.6984,
                        "longitude": 139.7731
                    }
                ]
            },
            {
                "title": "Day 3: Tsukiji Seafood Feast & TeamLab Digital Art",
                "planned_budget": 9000.0,
                "activities": [
                    {
                        "name": "Tsukiji Outer Market Fresh Sushi & Wagyu Breakfast",
                        "start_time": "09:00 AM",
                        "end_time": "12:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 3200.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "World-Class Fresh Seafood",
                        "explanation": "Bustling foodie alleyways offering melt-in-the-mouth fatty tuna nigiri, tamagoyaki omelettes, and grilled scallops.",
                        "location_name": "Tsukiji Outer Market, Chuo",
                        "latitude": 35.6655,
                        "longitude": 139.7707
                    },
                    {
                        "name": "Ginza High-End Promenade & Traditional Kabuki-za",
                        "start_time": "01:30 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1800.0,
                        "category": "Culture",
                        "priority": "MEDIUM",
                        "preference_match": "Sophisticated Architecture & Performing Arts",
                        "explanation": "Stroll Tokyo's most glamorous avenue, visit stationery marvel Itoya, and admire grand Kabuki theater.",
                        "location_name": "Ginza Shopping District & Kabuki-za",
                        "latitude": 35.6719,
                        "longitude": 139.7640
                    },
                    {
                        "name": "TeamLab Planets Immersive Digital Art Museum",
                        "start_time": "06:00 PM",
                        "end_time": "08:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 4000.0,
                        "category": "Culture",
                        "priority": "LOW",
                        "preference_match": "Mind-Blowing Light Installations",
                        "explanation": "Barefoot sensory journey wading through mirrored water pools of digital koi fish and crystal light universe.",
                        "location_name": "teamLab Planets TOKYO, Toyosu",
                        "latitude": 35.6518,
                        "longitude": 139.7898
                    }
                ]
            },
            {
                "title": "Day 4: Shinjuku Gardens, Sunset Skyline & Ramen Finale",
                "planned_budget": 6500.0,
                "activities": [
                    {
                        "name": "Shinjuku Gyoen National Imperial Garden",
                        "start_time": "10:00 AM",
                        "end_time": "12:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 800.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Traditional Japanese Landscaping",
                        "explanation": "Peaceful former imperial park combining traditional Japanese ponds, English landscape lawns, and greenhouse bonsai.",
                        "location_name": "Shinjuku Gyoen, Shinjuku",
                        "latitude": 35.6852,
                        "longitude": 139.7101
                    },
                    {
                        "name": "Tokyo Metropolitan Govt Building Panoramic Viewpoint",
                        "start_time": "02:00 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1500.0,
                        "category": "Sightseeing",
                        "priority": "MEDIUM",
                        "preference_match": "Skyscraper Architecture & Cityscape",
                        "explanation": "Panoramic observation deck 202 meters high offering sweeping views across Tokyo's sea of skyscrapers.",
                        "location_name": "Tokyo Metropolitan Govt Building",
                        "latitude": 35.6896,
                        "longitude": 139.6921
                    },
                    {
                        "name": "Authentic Tonkotsu Ramen at Fuunji & Farewell Drinks",
                        "start_time": "06:30 PM",
                        "end_time": "08:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 4200.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Handcrafted Ramen Gastronomy",
                        "explanation": "Legendary rich dipping ramen (tsukemen) simmered for 18 hours, served with chashu pork and seasoned bamboo.",
                        "location_name": "Fuunji Ramen, Shinjuku",
                        "latitude": 35.6865,
                        "longitude": 139.6970
                    }
                ]
            }
        ]
    },

    "jaipur": {
        "center": {"lat": 26.9124, "lng": 75.7873},
        "theme": "cultural",
        "days": [
            {
                "title": "Day 1: Royal Arrival, Amber Fort & Maota Lake",
                "planned_budget": 6000.0,
                "activities": [
                    {
                        "name": "Heritage Haveli Check-in & Rajasthani Thali Lunch",
                        "start_time": "11:30 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1500.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Authentic Rajasthani Flavors",
                        "explanation": "Warm Rajput hospitality welcome with traditional Dal Baati Churma, Gatte ki Sabzi, and refreshing Chaas.",
                        "location_name": "LMB Restaurant, Johari Bazaar",
                        "latitude": 26.9200,
                        "longitude": 75.8260
                    },
                    {
                        "name": "Amer (Amber) Fort & Sheesh Mahal (Mirror Palace)",
                        "start_time": "03:00 PM",
                        "end_time": "06:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 2500.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Magnificent Rajput Architecture",
                        "explanation": "Hilltop 16th-century fortress featuring glittering mirror palace halls, marble courtyards, and Maota Lake views.",
                        "location_name": "Amber Palace, Devisinghpura",
                        "latitude": 26.9855,
                        "longitude": 75.8513
                    },
                    {
                        "name": "Jal Mahal (Water Palace) Sunset Photo Stop & Chai",
                        "start_time": "06:30 PM",
                        "end_time": "08:00 PM",
                        "duration_hours": 1.5,
                        "estimated_cost": 2000.0,
                        "category": "Sightseeing",
                        "priority": "HIGH",
                        "preference_match": "Sunset & Scenic Lakescape",
                        "explanation": "Gilded red sandstone palace floating serenely in Man Sagar Lake framed by the Aravalli hills.",
                        "location_name": "Jal Mahal Promenade, Amer Road",
                        "latitude": 26.9535,
                        "longitude": 75.8462
                    }
                ]
            },
            {
                "title": "Day 2: City Palace, Hawa Mahal & Jantar Mantar (UNESCO)",
                "planned_budget": 7500.0,
                "activities": [
                    {
                        "name": "Hawa Mahal (Palace of Winds) Early Morning Facade",
                        "start_time": "09:00 AM",
                        "end_time": "10:30 AM",
                        "duration_hours": 1.5,
                        "estimated_cost": 600.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Iconic Pink City Architecture",
                        "explanation": "953 intricately carved honeycomb jharokha windows designed for royal women to observe street processions.",
                        "location_name": "Hawa Mahal, Badi Choupad",
                        "latitude": 26.9239,
                        "longitude": 75.8267
                    },
                    {
                        "name": "City Palace of Jaipur & Chandra Mahal Courtyards",
                        "start_time": "11:00 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 2200.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Royal Heritage & Museum Relics",
                        "explanation": "Splendid blend of Mughal and Rajput architecture housing royal armor, miniature paintings, and Peacock Gate.",
                        "location_name": "City Palace, Tulsi Marg",
                        "latitude": 26.9258,
                        "longitude": 75.8237
                    },
                    {
                        "name": "Jantar Mantar Astronomical Observatory (UNESCO)",
                        "start_time": "02:30 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1000.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Scientific & Astronomical Marvels",
                        "explanation": "World's largest stone sundial built in 1734 by Maharaja Sawai Jai Singh II with accurate celestial instruments.",
                        "location_name": "Jantar Mantar, Gangori Bazaar",
                        "latitude": 26.9248,
                        "longitude": 75.8246
                    },
                    {
                        "name": "Rooftop Haveli Royal Rajput Dinner with Folk Music",
                        "start_time": "07:00 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 3700.0,
                        "category": "Luxury",
                        "priority": "LOW",
                        "preference_match": "Royal Hospitality & Live Folk Dance",
                        "explanation": "Candlelit courtyard dinner with traditional Kalbeliya dancer performances and slow-cooked Laal Maas.",
                        "location_name": "1135 AD Amber / Baradari City Palace",
                        "latitude": 26.9840,
                        "longitude": 75.8500
                    }
                ]
            },
            {
                "title": "Day 3: Nahargarh Sunset Fort & Vibrant Bazaars",
                "planned_budget": 7000.0,
                "activities": [
                    {
                        "name": "Nahargarh Fort Clifftop Panoramas & Stepwell",
                        "start_time": "09:30 AM",
                        "end_time": "12:30 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1000.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Clifftop Vistas & Royal Defense",
                        "explanation": "Perched on the Aravalli ridge, featuring Madhavendra Bhawan with interconnected royal suites and Baori stepwell.",
                        "location_name": "Nahargarh Fort, Krishna Nagar",
                        "latitude": 26.9373,
                        "longitude": 75.8156
                    },
                    {
                        "name": "Johari & Bapu Bazaar Gemstone & Block Print Shopping",
                        "start_time": "02:30 PM",
                        "end_time": "06:00 PM",
                        "duration_hours": 3.5,
                        "estimated_cost": 4500.0,
                        "category": "Shopping",
                        "priority": "LOW",
                        "preference_match": "Artisan Textiles, Jewelry & Mojari Shoes",
                        "explanation": "Famed Pink City market rows for blue pottery, handmade Sanganeri cotton quilts, and camel leather footwear.",
                        "location_name": "Johari Bazaar & Bapu Bazaar",
                        "latitude": 26.9180,
                        "longitude": 75.8230
                    },
                    {
                        "name": "Padao Open-Air Sunset Cafe at Nahargarh Clifftop",
                        "start_time": "06:30 PM",
                        "end_time": "08:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1500.0,
                        "category": "Sightseeing",
                        "priority": "HIGH",
                        "preference_match": "Unforgettable City Sunset",
                        "explanation": "Watch the Pink City transition into a sparkling blanket of evening lights from the fortress ramparts.",
                        "location_name": "Padao Restaurant, Nahargarh",
                        "latitude": 26.9380,
                        "longitude": 75.8160
                    }
                ]
            },
            {
                "title": "Day 4: Albert Hall Museum, Galta Ji & Royal Farewell",
                "planned_budget": 6500.0,
                "activities": [
                    {
                        "name": "Albert Hall Museum (Central Museum) Indo-Saracenic Tour",
                        "start_time": "10:00 AM",
                        "end_time": "12:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 900.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Colonial Indo-Saracenic Splendor",
                        "explanation": "Oldest museum of Rajasthan housing Persian carpets, Egyptian mummy, miniature frescoes, and pigeon-filled gardens.",
                        "location_name": "Albert Hall Museum, Ram Niwas Garden",
                        "latitude": 26.9116,
                        "longitude": 75.8195
                    },
                    {
                        "name": "Galta Ji (Sacred Monkey Temple) Springs & Gorge Hike",
                        "start_time": "02:00 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1200.0,
                        "category": "Adventure",
                        "priority": "MEDIUM",
                        "preference_match": "Spiritual Nature & Mountain Springs",
                        "explanation": "Historic Hindu pilgrimage site nestled between granite cliffs with natural spring water kunds (basins).",
                        "location_name": "Galta Ji Temple Complex, Galtaji",
                        "latitude": 26.9168,
                        "longitude": 75.8569
                    },
                    {
                        "name": "Lassi at Lassiwala MI Road & Sweet Petha Farewell",
                        "start_time": "05:30 PM",
                        "end_time": "07:00 PM",
                        "duration_hours": 1.5,
                        "estimated_cost": 4400.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Legendary Street Sweets",
                        "explanation": "Thick creamy malai lassi served in traditional terracotta kulhads followed by Jaipur ghewar sweet boxes.",
                        "location_name": "Lassiwala (Since 1944), MI Road",
                        "latitude": 26.9189,
                        "longitude": 75.8115
                    }
                ]
            }
        ]
    },

    "manali": {
        "center": {"lat": 32.2432, "lng": 77.1892},
        "theme": "mountain",
        "days": [
            {
                "title": "Day 1: Mountain Welcome, Old Manali Cafes & Hadimba Temple",
                "planned_budget": 5000.0,
                "activities": [
                    {
                        "name": "Pine Grove Check-in & Riverside Trout Lunch",
                        "start_time": "11:30 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 1400.0,
                        "category": "Food",
                        "priority": "MEDIUM",
                        "preference_match": "Himalayan Fresh Trout & Siddu",
                        "explanation": "Wood cabin riverside lunch savoring pan-fried Beas river trout, steamed Himachali Siddu with ghee, and herbal tea.",
                        "location_name": "Cafe 1947, Old Manali",
                        "latitude": 32.2570,
                        "longitude": 77.1820
                    },
                    {
                        "name": "Hadimba Devi Temple Cedar Forest Sanctuary",
                        "start_time": "03:00 PM",
                        "end_time": "05:00 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 600.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Ancient Himalayan Pagoda Architecture",
                        "explanation": "16th-century four-tiered wooden pagoda temple surrounded by towering centuries-old deodar cedar groves.",
                        "location_name": "Hadimba Temple, Dhungri Forest",
                        "latitude": 32.2483,
                        "longitude": 77.1802
                    },
                    {
                        "name": "Old Manali Cobblestone Cafe Stroll & Acoustic Evening",
                        "start_time": "06:30 PM",
                        "end_time": "09:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 3000.0,
                        "category": "Food",
                        "priority": "HIGH",
                        "preference_match": "Cozy Mountain Vibe & Live Music",
                        "explanation": "Bohemian mountain cafes with wood-fired pizzas, apple cider, bonfire, and live acoustic guitar sets.",
                        "location_name": "Old Manali Village Promenade",
                        "latitude": 32.2562,
                        "longitude": 77.1835
                    }
                ]
            },
            {
                "title": "Day 2: Solang Valley Adventure, Snow & Paragliding",
                "planned_budget": 8500.0,
                "activities": [
                    {
                        "name": "Solang Valley Paragliding & Mountain Ropeway",
                        "start_time": "09:00 AM",
                        "end_time": "01:30 PM",
                        "duration_hours": 4.5,
                        "estimated_cost": 4500.0,
                        "category": "Adventure",
                        "priority": "HIGH",
                        "preference_match": "Thrill Sports & Glacial Vistas",
                        "explanation": "Tandem paragliding flight over snow-capped valleys and ropeway cable car ride to Mount Phatru viewpoint.",
                        "location_name": "Solang Valley Adventure Arena",
                        "latitude": 32.3166,
                        "longitude": 77.1578
                    },
                    {
                        "name": "Anjani Mahadev Waterfall Trek & Snow Cafe",
                        "start_time": "02:30 PM",
                        "end_time": "05:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 1500.0,
                        "category": "Adventure",
                        "priority": "MEDIUM",
                        "preference_match": "Alpine Nature & Sacred Waterfalls",
                        "explanation": "Scenic 2km pine forest hike to natural cliff waterfall where water cascades onto a sacred stone shivling.",
                        "location_name": "Anjani Mahadev, Solang",
                        "latitude": 32.3240,
                        "longitude": 77.1520
                    },
                    {
                        "name": "Luxury Mountain Chalet Candlelit Dinner",
                        "start_time": "07:30 PM",
                        "end_time": "09:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 2500.0,
                        "category": "Luxury",
                        "priority": "LOW",
                        "preference_match": "Fireplace Dining & Mulled Wine",
                        "explanation": "Warm stone hearth dinner with Himachali spiced mutton curry (Khatta Meat) and warm apple crumble.",
                        "location_name": "Solang Valley Resort Dining Room",
                        "latitude": 32.3150,
                        "longitude": 77.1590
                    }
                ]
            },
            {
                "title": "Day 3: Jogini Waterfalls Trek & Vashisht Hot Springs",
                "planned_budget": 5500.0,
                "activities": [
                    {
                        "name": "Jogini Waterfall Pine Forest Hike & Cliff Panorama",
                        "start_time": "09:30 AM",
                        "end_time": "01:00 PM",
                        "duration_hours": 3.5,
                        "estimated_cost": 800.0,
                        "category": "Adventure",
                        "priority": "HIGH",
                        "preference_match": "Spectacular Alpine Trekking",
                        "explanation": "Enchanting trail through apple orchards and pine needles ending at a roaring two-tiered cascade.",
                        "location_name": "Jogini Falls Trail, Vashisht",
                        "latitude": 32.2680,
                        "longitude": 77.1970
                    },
                    {
                        "name": "Vashisht Natural Thermal Sulfur Springs & Ancient Temple",
                        "start_time": "02:30 PM",
                        "end_time": "04:30 PM",
                        "duration_hours": 2.0,
                        "estimated_cost": 700.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "Rejuvenating Thermal Baths",
                        "explanation": "4000-year-old wooden carved temple with medicinal natural hot springs renowned for muscle relaxation.",
                        "location_name": "Vashisht Village, Manali",
                        "latitude": 32.2605,
                        "longitude": 77.1904
                    },
                    {
                        "name": "Manali Mall Road Woolen Shawls & Tibetan Steamed Momos",
                        "start_time": "06:00 PM",
                        "end_time": "08:30 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 4000.0,
                        "category": "Shopping",
                        "priority": "LOW",
                        "preference_match": "Pashmina & Tibetan Handicrafts",
                        "explanation": "Bustling central pedestrian boulevard for Kullu patterned shawls, prayer wheels, and piping hot thukpa soup.",
                        "location_name": "The Mall Road, Manali",
                        "latitude": 26.9180,
                        "longitude": 75.8230
                    }
                ]
            },
            {
                "title": "Day 4: Naggar Castle Heritage & Beas Riverfront Farewell",
                "planned_budget": 6000.0,
                "activities": [
                    {
                        "name": "Naggar Castle Medieval Wood-and-Stone Heritage Tour",
                        "start_time": "10:00 AM",
                        "end_time": "01:00 PM",
                        "duration_hours": 3.0,
                        "estimated_cost": 1500.0,
                        "category": "Culture",
                        "priority": "HIGH",
                        "preference_match": "15th-century Himalayan Architecture",
                        "explanation": "Earthquake-resistant 'Kathkuni' castle overlooking the Kullu valley with Nicholas Roerich art gallery.",
                        "location_name": "Naggar Castle, Naggar Village",
                        "latitude": 32.1466,
                        "longitude": 77.1706
                    },
                    {
                        "name": "Kullu Handloom Weaving Cooperative & Honey Tasting",
                        "start_time": "02:30 PM",
                        "end_time": "05:00 PM",
                        "duration_hours": 2.5,
                        "estimated_cost": 3000.0,
                        "category": "Culture",
                        "priority": "MEDIUM",
                        "preference_match": "Artisanal Craft & Wild Forest Honey",
                        "explanation": "Meet local master weavers creating geometric Kullu borders and taste unpasteurized Himalayan flora honey.",
                        "location_name": "Bhutico Handloom Center, Kullu Valley",
                        "latitude": 32.1200,
                        "longitude": 77.1800
                    },
                    {
                        "name": "Beas Riverfront Pebble Walk & Sunset Bonfire Toast",
                        "start_time": "06:00 PM",
                        "end_time": "07:30 PM",
                        "duration_hours": 1.5,
                        "estimated_cost": 1500.0,
                        "category": "Adventure",
                        "priority": "HIGH",
                        "preference_match": "Mountain Serenity & Reflection",
                        "explanation": "Listen to the rushing glacier waters of Beas River with a warm thermos of spiced kahwa tea.",
                        "location_name": "Beas River Bank, Aleo",
                        "latitude": 32.2350,
                        "longitude": 77.1880
                    }
                ]
            }
        ]
    }
}

# ------------------------------------------------------------------------------
# 3. Dynamic Destination Synthesizer (For Any Uncurated Global Destination)
# ------------------------------------------------------------------------------
def generate_dynamic_destination_itinerary(
    dest_name: str,
    duration_days: int,
    total_budget: float,
    currency: str = "₹",
    interests: List[str] = None,
    priority_weights: Dict[str, str] = None,
    start_dt: datetime = None
) -> Dict[str, Any]:
    """
    Generates a realistic, culturally authentic multi-day travel itinerary
    for ANY destination on Earth with real coordinates, appropriate activities,
    realistic timings and sensible budget splits.
    """
    if start_dt is None:
        start_dt = datetime.now()
        
    interests = interests or ["Culture", "Food", "Sightseeing", "Adventure"]
    priority_weights = priority_weights or {
        "Culture": "HIGH", "Food": "HIGH", "Sightseeing": "HIGH",
        "Adventure": "MEDIUM", "Shopping": "LOW", "Luxury": "LOW"
    }
    
    center_lat, center_lng = resolve_destination_coordinates(dest_name)
    title_name = dest_name.strip().title()
    
    # Theme determination
    dest_lower = dest_name.lower()
    if any(k in dest_lower for k in ["beach", "island", "sea", "ocean", "coast", "bali", "phuket", "hawaii", "maldives"]):
        theme = "beach"
    elif any(k in dest_lower for k in ["mountain", "hill", "alps", "peak", "himalaya", "valley", "snow", "ski"]):
        theme = "mountain"
    else:
        theme = "urban"

    days: List[Dict[str, Any]] = []
    daily_budget_target = round(total_budget / max(1, duration_days), -1)

    DAY_THEMES = [
        ("Arrival, Historic City Center & Welcome Atmosphere", [
            ("City Heritage Check-in & Signature Culinary Welcome", "Food", "11:30 AM", "01:30 PM", 2.0, 0.22, "HIGH", f"Immerse into {title_name}'s vibrant food culture with authentic regional dishes at a top-rated central cafe.", f"{title_name} Old Town Quarter", 0.005, 0.003),
            (f"Panoramic {title_name} Landmark & Historic Plaza", "Culture", "03:00 PM", "05:30 PM", 2.5, 0.38, "HIGH", f"Visit the defining architectural monument and central public square of {title_name}.", f"{title_name} Central Monument & Plaza", -0.004, 0.006),
            (f"Sunset Scenic Promenade & Evening Bistro Gathering", "Food", "06:30 PM", "09:00 PM", 2.5, 0.40, "MEDIUM", f"Stroll {title_name}'s bustling evening boulevard enjoying sunset vistas and local artisan beverages.", f"{title_name} Riverside / Promenade", 0.008, -0.005)
        ]),
        ("Iconic Masterpieces, Museums & Architecture", [
            (f"World Heritage Cultural Monument & Guided History Tour", "Culture", "09:30 AM", "01:00 PM", 3.5, 0.35, "HIGH", f"In-depth discovery of {title_name}'s premier historical fortress, palace or museum treasure.", f"{title_name} National Heritage Site", 0.012, 0.010),
            (f"Artisan Gourmet Lunch & Botanical Park Stroll", "Food", "01:30 PM", "03:30 PM", 2.0, 0.25, "MEDIUM", f"Relax in a manicured royal garden or park terrace sampling seasonal pastries and farm-to-table flavors.", f"{title_name} Memorial Gardens", -0.008, 0.012),
            (f"Grand Boulevard Performing Arts & Fine Dining", "Luxury", "06:30 PM", "09:30 PM", 3.0, 0.40, "LOW", f"Evening indulgence in {title_name}'s premier theater district with multi-course dinner.", f"{title_name} Grand Opera / Royal District", 0.002, -0.011)
        ]),
        ("Neighborhood Exploration, Local Markets & Hidden Alleys", [
            (f"Old Town Artisan Market & Specialty Tasting Tour", "Culture", "09:30 AM", "12:30 PM", 3.0, 0.28, "HIGH", f"Explore labyrinthine historic alleyways, spice stalls, handmade ceramics, and street food gems of {title_name}.", f"{title_name} Historic Central Market", -0.010, -0.008),
            (f"Scenic Clifftop / Rooftop Observation Deck", "Sightseeing", "02:00 PM", "04:30 PM", 2.5, 0.32, "HIGH", f"Breathtaking 360-degree viewpoint over the rooftops and natural landscapes surrounding {title_name}.", f"{title_name} Sky Point / Fortress Hill", 0.015, 0.018),
            (f"Boutique Craft Shopping & Night Market Delicacies", "Shopping", "06:00 PM", "09:00 PM", 3.0, 0.40, "LOW", f"Browse handmade leather goods, textiles, and authentic souvenirs while tasting fresh evening snacks.", f"{title_name} Artisan Bazaars", -0.006, 0.015)
        ]),
        ("Nature Excursions, Waterfront Panoramas & Farewell Celebration", [
            (f"Scenic Nature Escarpment & Lake / Coastal Excursion", "Adventure", "09:30 AM", "01:00 PM", 3.5, 0.35, "HIGH", f"Rejuvenating morning hike, water excursion, or scenic valley trek in {title_name}'s picturesque countryside.", f"{title_name} Valley / Coastal Sanctuary", 0.022, -0.018),
            (f"Traditional Cultural Workshop & Farewell Tea Ceremony", "Culture", "02:30 PM", "04:30 PM", 2.0, 0.25, "MEDIUM", f"Hands-on local craft demonstration, pottery studio visit, and regional tea/coffee tasting.", f"{title_name} Heritage Guild", 0.004, 0.009),
            (f"Farewell Sunset Celebration with Live Traditional Music", "Food", "06:30 PM", "08:30 PM", 2.0, 0.40, "HIGH", f"Memorable closing dinner toast celebrating the journey through {title_name} with candlelit views and local melodies.", f"{title_name} Panoramic Dining Terrace", -0.002, -0.004)
        ])
    ]

    for day_idx in range(duration_days):
        theme_idx = day_idx % len(DAY_THEMES)
        theme_title, activities_templates = DAY_THEMES[theme_idx]
        day_num = day_idx + 1
        cur_date = (start_dt + timedelta(days=day_idx)).strftime("%Y-%m-%d")

        day_acts = []
        day_cost_sum = 0.0

        for act_tpl in activities_templates:
            name, cat, start, end, dur, cost_ratio, pri_default, expl, loc_suffix, lat_off, lng_off = act_tpl
            
            # Slightly offset coordinates so each activity is pinned realistically near city center
            act_lat = round(center_lat + lat_off, 4)
            act_lng = round(center_lng + lng_off, 4)
            
            user_pri = priority_weights.get(cat, pri_default)
            act_cost = round(daily_budget_target * cost_ratio, -1)
            day_cost_sum += act_cost

            day_acts.append({
                "name": name,
                "start_time": start,
                "end_time": end,
                "duration_hours": dur,
                "estimated_cost": act_cost,
                "category": cat,
                "priority": user_pri,
                "preference_match": f"Match: {cat} & {title_name} Discovery",
                "explanation": expl,
                "location_name": loc_suffix,
                "latitude": act_lat,
                "longitude": act_lng
            })

        days.append({
            "title": f"Day {day_num}: {theme_title}",
            "planned_budget": day_cost_sum,
            "activities": day_acts
        })

    return {
        "center": {"lat": center_lat, "lng": center_lng},
        "theme": theme,
        "days": days
    }


# ------------------------------------------------------------------------------
# 4. Tailored Packing List Generator by Destination Profile
# ------------------------------------------------------------------------------
def generate_destination_packing_list(destination: str) -> List[PackingItem]:
    """Generates an intelligent, climate-and-activity aware packing checklist."""
    dest_lower = destination.lower()
    
    # 1. Beach / Tropical profile
    if any(k in dest_lower for k in ["goa", "bali", "phuket", "kerala", "maldives", "beach", "island", "cancun", "hawaii", "sea"]):
        return [
            PackingItem(category="Clothing", item_name="Lightweight breathable cotton shirts & linen shorts", is_essential=True),
            PackingItem(category="Clothing", item_name="Swimwear & UV sun-protection beach cover-up", is_essential=True),
            PackingItem(category="Clothing", item_name="Comfortable walking sandals & water shoes", is_essential=True),
            PackingItem(category="Clothing", item_name="Light evening casual wear for beachfront dining", is_essential=False),
            PackingItem(category="Toiletries & Health", item_name="Reef-safe broad spectrum sunscreen (SPF 50+)", is_essential=True),
            PackingItem(category="Toiletries & Health", item_name="Aloe vera soothing sunburn relief gel", is_essential=False),
            PackingItem(category="Toiletries & Health", item_name="Mosquito / insect repellent spray", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Waterproof phone pouch for beach / watersports", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Polarized UV-protecting sunglasses", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="High-capacity 10,000mAh+ power bank", is_essential=True),
            PackingItem(category="Documents", item_name="Government ID / Driver's license for vehicle rental", is_essential=True),
            PackingItem(category="Documents", item_name="Emergency cash & digital travel insurance proof", is_essential=True)
        ]

    # 2. Mountain / Cold / Alpine profile
    elif any(k in dest_lower for k in ["manali", "ladakh", "leh", "shimla", "kashmir", "alps", "switzerland", "iceland", "mountain", "snow"]):
        return [
            PackingItem(category="Clothing", item_name="Thermal inner wear (base layers top & bottom)", is_essential=True),
            PackingItem(category="Clothing", item_name="Windproof & waterproof insulated winter jacket / fleece", is_essential=True),
            PackingItem(category="Clothing", item_name="Sturdy high-traction waterproof trekking boots", is_essential=True),
            PackingItem(category="Clothing", item_name="Woolen beanie, warm gloves, and neck gaiter", is_essential=True),
            PackingItem(category="Toiletries & Health", item_name="Cold weather lip balm & heavy-duty moisturizing cream", is_essential=True),
            PackingItem(category="Toiletries & Health", item_name="Altitude sickness relief tablets & ORS electrolytes", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Cold-resistant power bank (batteries drain fast in cold)", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="UV-blocking glacier sunglasses / polarized shades", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Trekking poles & thermos flask for hot water", is_essential=False),
            PackingItem(category="Documents", item_name="Inner line / protected area permit & Govt ID", is_essential=True),
            PackingItem(category="Documents", item_name="Offline topographic maps & physical medical contact card", is_essential=True)
        ]

    # 3. Cosmopolitan / Cultural / Historic Urban profile
    else:
        return [
            PackingItem(category="Clothing", item_name="Comfortable cushioned urban walking sneakers (15k+ steps/day)", is_essential=True),
            PackingItem(category="Clothing", item_name="Smart casual attire for fine dining & historic monuments", is_essential=True),
            PackingItem(category="Clothing", item_name="Light compact windcheater / foldaway travel umbrella", is_essential=False),
            PackingItem(category="Clothing", item_name="Modest clothing covering shoulders/knees for sacred sites", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Universal travel power adapter with multiple USB ports", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Slim anti-theft cross-body daypack", is_essential=True),
            PackingItem(category="Tech & Gear", item_name="Compact fast-charging 20,000mAh power bank", is_essential=True),
            PackingItem(category="Toiletries & Health", item_name="Personal blister prevention tape & travel first aid kit", is_essential=True),
            PackingItem(category="Toiletries & Health", item_name="Hand sanitizer & hydrating facial mist", is_essential=False),
            PackingItem(category="Documents", item_name="Passport / National ID & international credit cards", is_essential=True),
            PackingItem(category="Documents", item_name="Museum reservations & city transit pass confirmations", is_essential=True)
        ]
