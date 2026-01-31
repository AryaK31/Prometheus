from typing import List, Dict, Optional
from pydantic import BaseModel


class CropSuggestion(BaseModel):
    crop_name: str
    planting_date: str
    harvest_date: str
    irrigation_schedule: str
    fertilizer_recommendation: str
    water_requirements_mm: float
    nitrogen_kg_per_ha: float
    phosphorus_kg_per_ha: float
    potassium_kg_per_ha: float
    expected_yield_per_ha: str
    notes: str


def get_crop_suggestions(
    location: Optional[str] = None,
    soil_type: Optional[str] = None,
    season: str = "spring"
) -> List[CropSuggestion]:
    """
    Generate crop suggestions based on location, soil type, and season.
    This is a simplified version - in production, this would query real databases.
    """
    suggestions = []

    # Spring crops
    if season.lower() in ["spring", "all"]:
        suggestions.extend([
            CropSuggestion(
                crop_name="Corn",
                planting_date="Late April to Early May",
                harvest_date="Late September to Early October",
                irrigation_schedule="25-30mm per week during growing season, increase to 40mm during tasseling",
                fertilizer_recommendation="N-P-K: 120-60-40 kg/ha. Apply 60% at planting, 40% as side-dress at V6 stage",
                water_requirements_mm=500.0,
                nitrogen_kg_per_ha=120.0,
                phosphorus_kg_per_ha=60.0,
                potassium_kg_per_ha=40.0,
                expected_yield_per_ha="8-12 tons/ha",
                notes="Requires well-drained soil. Monitor for corn borer and rootworm."
            ),
            CropSuggestion(
                crop_name="Soybeans",
                planting_date="Early May to Mid-May",
                harvest_date="Late September to Mid-October",
                irrigation_schedule="20-25mm per week, critical during flowering and pod fill",
                fertilizer_recommendation="N-P-K: 0-60-80 kg/ha. Soybeans fix nitrogen, focus on P and K",
                water_requirements_mm=450.0,
                nitrogen_kg_per_ha=0.0,
                phosphorus_kg_per_ha=60.0,
                potassium_kg_per_ha=80.0,
                expected_yield_per_ha="2.5-3.5 tons/ha",
                notes="Good for crop rotation. Fixes nitrogen in soil."
            ),
            CropSuggestion(
                crop_name="Wheat",
                planting_date="Early to Mid-April",
                harvest_date="Late July to Early August",
                irrigation_schedule="30-35mm per week during tillering and heading stages",
                fertilizer_recommendation="N-P-K: 100-50-50 kg/ha. Split application: 50% at planting, 50% at tillering",
                water_requirements_mm=400.0,
                nitrogen_kg_per_ha=100.0,
                phosphorus_kg_per_ha=50.0,
                potassium_kg_per_ha=50.0,
                expected_yield_per_ha="4-6 tons/ha",
                notes="Winter wheat planted in fall. Spring wheat planted in spring."
            ),
        ])

    # Summer crops
    if season.lower() in ["summer", "all"]:
        suggestions.extend([
            CropSuggestion(
                crop_name="Tomatoes",
                planting_date="Mid-May after last frost",
                harvest_date="Mid-July to Early September",
                irrigation_schedule="Drip irrigation: 20-25mm per week, increase during fruit set",
                fertilizer_recommendation="N-P-K: 80-100-120 kg/ha. High potassium for fruit quality",
                water_requirements_mm=600.0,
                nitrogen_kg_per_ha=80.0,
                phosphorus_kg_per_ha=100.0,
                potassium_kg_per_ha=120.0,
                expected_yield_per_ha="60-80 tons/ha",
                notes="Requires consistent moisture. Prone to blight - use resistant varieties."
            ),
            CropSuggestion(
                crop_name="Potatoes",
                planting_date="Early to Mid-May",
                harvest_date="Late August to Early October",
                irrigation_schedule="30-40mm per week, critical during tuber formation",
                fertilizer_recommendation="N-P-K: 100-80-150 kg/ha. High potassium for tuber quality",
                water_requirements_mm=550.0,
                nitrogen_kg_per_ha=100.0,
                phosphorus_kg_per_ha=80.0,
                potassium_kg_per_ha=150.0,
                expected_yield_per_ha="25-35 tons/ha",
                notes="Requires loose, well-drained soil. Monitor for late blight."
            ),
        ])

    # Filter by soil type if provided
    if soil_type:
        soil_preferences = {
            "loam": ["Corn", "Soybeans", "Wheat", "Tomatoes", "Potatoes"],
            "sandy": ["Corn", "Soybeans", "Potatoes"],
            "clay": ["Wheat", "Corn"],
            "silt": ["Corn", "Soybeans", "Wheat", "Tomatoes"]
        }
        preferred = soil_preferences.get(soil_type.lower(), [])
        suggestions = [s for s in suggestions if s.crop_name in preferred]

    return suggestions
