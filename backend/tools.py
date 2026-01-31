from typing import Optional, List
from datetime import datetime, timedelta

from pydantic import BaseModel, Field
from langchain_core.tools import tool


class WeatherQuery(BaseModel):
    """Query parameters for the Weather_API_Tool."""

    location: str = Field(
        ...,
        description="Location of the farm, e.g. 'Iowa, USA' or GPS coordinates.",
    )
    days_ahead: int = Field(
        7,
        ge=1,
        le=30,
        description="How many days ahead to summarize the forecast for.",
    )


@tool(name="Weather_API_Tool", args_schema=WeatherQuery)
def weather_api_tool(location: str, days_ahead: int = 7) -> str:
    """
    Simulated weather API.

    In production, this would call a real weather service.
    Returns a concise, human-readable summary suitable for the LLM.
    """
    today = datetime.utcnow().date()
    end_date = today + timedelta(days=days_ahead)
    return (
        f"Simulated weather for {location} from {today} to {end_date}. "
        "Expect moderate temperatures, light rainfall on 2–3 days, and no extreme events."
    )


class SoilQuery(BaseModel):
    """Query parameters for the Soil_Database_Tool."""

    location: str = Field(..., description="Region or GPS coordinates of the field.")
    depth_cm: int = Field(
        30,
        ge=5,
        le=100,
        description="Depth of interest for soil properties, in centimeters.",
    )


@tool(name="Soil_Database_Tool", args_schema=SoilQuery)
def soil_database_tool(location: str, depth_cm: int = 30) -> str:
    """
    Simulated soil database lookup.

    In production, this would query a regional soil database.
    """
    return (
        f"Simulated soil data for {location} to {depth_cm} cm depth: "
        "loam texture, moderate organic matter (~2.5%), good drainage, pH around 6.5."
    )


class CropQuery(BaseModel):
    """Query parameters for the Crop_Database_Tool."""

    crop: str = Field(..., description="Crop name, e.g. 'corn', 'wheat', 'tomato'.")
    region: Optional[str] = Field(
        None, description="Region or state, e.g. 'Iowa, USA'."
    )
    growth_stage: Optional[str] = Field(
        None, description="Optional growth stage, e.g. 'vegetative', 'flowering'."
    )
    info_type: Optional[str] = Field(
        None,
        description=(
            "Specific info requested, e.g. 'fertilizer recommendation', "
            "'planting date', 'spacing', or 'market price'."
        ),
    )


@tool(name="Crop_Database_Tool", args_schema=CropQuery)
def crop_database_tool(
    crop: str,
    region: Optional[str] = None,
    growth_stage: Optional[str] = None,
    info_type: Optional[str] = None,
) -> str:
    """
    Simulated crop information and market database.

    Returns brief agronomic and market guidance for the specified crop and region.
    """
    base = f"Simulated crop info for {crop}"
    if region:
        base += f" in {region}"
    details = []
    if not info_type or "fertilizer" in info_type.lower():
        details.append(
            "Typical N-P-K ratio for grain crops is around 120-60-40 kg/ha, "
            "adjusted for soil tests and yield goals."
        )
    if not info_type or "planting" in info_type.lower():
        details.append(
            "Plant during the recommended local window for frost-free conditions "
            "and adequate soil moisture."
        )
    if not info_type or "market" in info_type.lower():
        details.append(
            "Market prices vary; consider diversifying crops and checking local "
            "market bulletins weekly."
        )
    return base + ". " + " ".join(details)


class YieldPredictionInput(BaseModel):
    """Inputs for the Yield_Prediction_Model."""

    crop: str = Field(..., description="Crop name, e.g. 'wheat', 'corn'.")
    location: str = Field(..., description="Location or region of the field.")
    planting_date: Optional[str] = Field(
        None, description="Planting date in ISO format (YYYY-MM-DD) if known."
    )
    management_notes: Optional[str] = Field(
        None,
        description="Brief notes on fertilizer, irrigation, and other management practices.",
    )
    expected_weather_summary: Optional[str] = Field(
        None,
        description="Optional short summary of expected weather for the season.",
    )


@tool(name="Yield_Prediction_Model", args_schema=YieldPredictionInput)
def yield_prediction_model(
    crop: str,
    location: str,
    planting_date: Optional[str] = None,
    management_notes: Optional[str] = None,
    expected_weather_summary: Optional[str] = None,
) -> str:
    """
    Simulated yield prediction model.

    Returns an estimated yield range and brief explanation of assumptions.
    """
    base_yield = "Estimated yield range for {crop} in {location} is approximately 55–75 bushels per acre."
    explanation_parts: List[str] = [
        "This estimate assumes average soil fertility and timely weed control.",
        "Better-than-average rainfall and nutrient management could push yields to the upper end.",
        "Drought, nutrient stress, or severe pests could reduce yields to the lower end or below.",
    ]
    if planting_date:
        explanation_parts.append(
            f"Planting date {planting_date} is assumed to be within the locally recommended window."
        )
    if management_notes:
        explanation_parts.append(
            f"Management notes considered: {management_notes[:200]}..."
        )
    if expected_weather_summary:
        explanation_parts.append(
            f"Expected weather summary considered: {expected_weather_summary[:200]}..."
        )
    return base_yield.format(crop=crop, location=location) + " " + " ".join(
        explanation_parts
    )


class IrrigationAnalysisInput(BaseModel):
    """Inputs for the Irrigation_Analysis_Tool."""

    crop: str = Field(..., description="Crop name, e.g. 'corn', 'rice', 'tomato'.")
    location: str = Field(..., description="Location or region of the field.")
    soil_type: Optional[str] = Field(
        None, description="Soil texture class, e.g. 'sandy loam', 'clay'."
    )
    irrigation_method: Optional[str] = Field(
        None, description="e.g. 'drip', 'sprinkler', 'flood'."
    )
    schedule_description: str = Field(
        ...,
        description="Short description of current schedule, e.g. '30 minutes every 2 days'.",
    )
    recent_rainfall_mm: Optional[float] = Field(
        None,
        description="Approximate rainfall in the last 7 days, in millimeters, if known.",
    )


@tool(name="Irrigation_Analysis_Tool", args_schema=IrrigationAnalysisInput)
def irrigation_analysis_tool(
    crop: str,
    location: str,
    soil_type: Optional[str] = None,
    irrigation_method: Optional[str] = None,
    schedule_description: str = "",
    recent_rainfall_mm: Optional[float] = None,
) -> str:
    """
    Simulated irrigation efficiency and schedule analysis.

    Returns a short assessment and suggested adjustments.
    """
    assessment = (
        f"For {crop} in {location}, your current irrigation schedule "
        f"('{schedule_description}') appears roughly acceptable under average conditions."
    )
    if recent_rainfall_mm is not None:
        if recent_rainfall_mm > 30:
            assessment += (
                " Recent rainfall is relatively high; consider skipping the next one or two irrigations "
                "to avoid over-watering and leaching."
            )
        elif recent_rainfall_mm < 5:
            assessment += (
                " Recent rainfall is very low; monitor soil moisture closely and be prepared to increase "
                "irrigation frequency slightly if the top 5–10 cm are dry."
            )
    if soil_type:
        assessment += f" Soil type '{soil_type}' has been noted when considering water-holding capacity."
    if irrigation_method:
        assessment += f" Irrigation method '{irrigation_method}' has been noted for efficiency assumptions."
    return assessment


class VisionAnalysisInput(BaseModel):
    """Inputs for the Vision_Analysis_Tool."""

    crop: Optional[str] = Field(
        None, description="Crop name, e.g. 'tomato', 'potato', 'corn'."
    )
    description: Optional[str] = Field(
        None,
        description=(
            "Short description of visible symptoms, e.g. 'yellow spots on lower leaves'."
        ),
    )
    image_reference: str = Field(
        ...,
        description=(
            "Opaque reference to the uploaded image (e.g., ID or filename). "
            "Used only for logging or future lookup; the model does not inspect the pixels directly here."
        ),
    )


@tool(name="Vision_Analysis_Tool", args_schema=VisionAnalysisInput)
def vision_analysis_tool(
    crop: Optional[str],
    description: Optional[str],
    image_reference: str,
) -> str:
    """
    Simulated plant health and pest/disease identification from an image.

    NOTE: This is a placeholder. In production, this would call a real vision model.
    """
    crop_label = crop or "the crop"
    symptom_text = description or "visible leaf or stem symptoms"
    diagnosis = (
        f"Based on the provided image reference '{image_reference}' and the description "
        f"of {symptom_text} on {crop_label}, a common issue could be a foliar fungal disease "
        "or a nutrient deficiency. This is a simulated diagnosis."
    )
    treatment_plan = (
        "1) Remove and destroy the most heavily affected leaves to reduce spread where practical. "
        "2) Apply a locally approved fungicide or balanced fertilizer according to label directions, "
        "and monitor new growth for improvement over the next 7–10 days."
    )
    return diagnosis + " " + treatment_plan


ALL_TOOLS = [
    weather_api_tool,
    soil_database_tool,
    crop_database_tool,
    yield_prediction_model,
    irrigation_analysis_tool,
    vision_analysis_tool,
]

