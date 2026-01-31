from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from .agent import get_agent_for_session
from .digital_twin import (
    update_farm_state_from_profile,
    summarize_farm_state_for_llm,
    get_farm_state,
)
from .optimizer import (
    ObjectivePreferences,
    ResourceConstraints,
    optimize_plan,
)
from .crop_suggestions import get_crop_suggestions


class FarmerProfile(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    primary_crops: Optional[List[str]] = None
    notes: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: str
    message: str
    farmer_profile: Optional[FarmerProfile] = None


class ChatResponse(BaseModel):
    reply: str


class ImageDiagnosisRequest(BaseModel):
    session_id: str
    image_reference: str
    crop: Optional[str] = None
    description: Optional[str] = None


class ImageDiagnosisResponse(BaseModel):
    diagnosis: str


class ObjectivePreferencesModel(BaseModel):
    weight_yield: float = 0.4
    weight_profit: float = 0.3
    weight_water_saving: float = 0.2
    weight_risk_reduction: float = 0.1


class ResourceConstraintsModel(BaseModel):
    max_water_mm: Optional[float] = None
    max_nitrogen_kg_ha: Optional[float] = None
    max_budget_usd: Optional[float] = None
    risk_tolerance: str = "medium"  # "low", "medium", "high"


class DecisionSupportRequest(BaseModel):
    session_id: str
    scenario_description: Optional[str] = None
    farmer_profile: Optional[FarmerProfile] = None
    objectives: ObjectivePreferencesModel = ObjectivePreferencesModel()
    constraints: ResourceConstraintsModel = ResourceConstraintsModel()


class PlanSummary(BaseModel):
    name: str
    description: str
    expected_yield_index: float
    expected_profit_index: float
    water_use_index: float
    risk_index: float
    notes: Optional[str] = None


class DecisionSupportResponse(BaseModel):
    best_plan: PlanSummary
    alternative_plan: PlanSummary
    reasoning_summary: str
    llm_explanation: str


app = FastAPI(title="Prometheus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend origin.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "prometheus"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Main text-based interaction endpoint for Prometheus.

    The backend keeps conversation context per session_id.
    The optional farmer_profile is injected into the prompt so the agent can
    reuse it in subsequent turns.
    """
    agent = get_agent_for_session(request.session_id)

    profile_snippet = ""
    if request.farmer_profile:
        crops = ", ".join(request.farmer_profile.primary_crops or [])
        profile_snippet = (
            f"Farmer profile: name={request.farmer_profile.name or 'unknown'}, "
            f"location={request.farmer_profile.location or 'unknown'}, "
            f"primary crops={crops or 'unspecified'}. "
            f"Notes={request.farmer_profile.notes or 'none'}. "
        )
        # Keep the farm's digital twin in sync with the profile.
        farm_state = update_farm_state_from_profile(
            session_id=request.session_id,
            name=request.farmer_profile.name,
            location=request.farmer_profile.location,
            primary_crops=request.farmer_profile.primary_crops,
            notes=request.farmer_profile.notes,
        )
    else:
        farm_state = get_farm_state(request.session_id)

    farm_summary = summarize_farm_state_for_llm(farm_state)
    context_prefix = (
        "Context about this farm (digital twin summary): "
        f"{farm_summary}\n\n"
        "Now answer the farmer's question in a concise, voice-friendly way.\n\n"
    )

    full_input = context_prefix + profile_snippet + request.message

    result = agent.invoke(
        {"input": full_input},
        config={"configurable": {"session_id": request.session_id}},
    )
    reply = str(result)
    return ChatResponse(reply=reply)


@app.post("/api/image-diagnosis", response_model=ImageDiagnosisResponse)
async def image_diagnosis(request: ImageDiagnosisRequest) -> ImageDiagnosisResponse:
    """
    Image-driven plant health query.

    The frontend should upload the image and pass an opaque reference string
    (e.g., filename, URL, or ID) in image_reference. The agent will call the
    Vision_Analysis_Tool using that reference plus the textual context.
    """
    agent = get_agent_for_session(request.session_id)

    description_parts = [
        "The farmer has shared a plant image for diagnosis.",
        f"Image reference: {request.image_reference}.",
    ]
    if request.crop:
        description_parts.append(f"Crop: {request.crop}.")
    if request.description:
        description_parts.append(f"Farmer description of symptoms: {request.description}.")

    prompt = (
        "Please analyze the plant health issue using Vision_Analysis_Tool. "
        "Use a supportive, clear tone. "
        "Provide a likely diagnosis and a 2-step treatment plan.\n\n"
        + " ".join(description_parts)
    )

    result = agent.invoke(
        {"input": prompt},
        config={"configurable": {"session_id": request.session_id}},
    )
    diagnosis = str(result)
    return ImageDiagnosisResponse(diagnosis=diagnosis)


@app.post("/api/decision-support", response_model=DecisionSupportResponse)
async def decision_support(
    request: DecisionSupportRequest,
) -> DecisionSupportResponse:
    """
    Multi-objective decision-support endpoint.

    Combines the farm's digital twin with explicit objective preferences and
    resource constraints to propose and explain candidate management plans.
    """
    # Synchronize digital twin with any updated profile information.
    if request.farmer_profile:
        farm_state = update_farm_state_from_profile(
            session_id=request.session_id,
            name=request.farmer_profile.name,
            location=request.farmer_profile.location,
            primary_crops=request.farmer_profile.primary_crops,
            notes=request.farmer_profile.notes,
        )
    else:
        farm_state = get_farm_state(request.session_id)

    prefs = ObjectivePreferences(
        weight_yield=request.objectives.weight_yield,
        weight_profit=request.objectives.weight_profit,
        weight_water_saving=request.objectives.weight_water_saving,
        weight_risk_reduction=request.objectives.weight_risk_reduction,
    )
    constraints = ResourceConstraints(
        max_water_mm=request.constraints.max_water_mm,
        max_nitrogen_kg_ha=request.constraints.max_nitrogen_kg_ha,
        max_budget_usd=request.constraints.max_budget_usd,
        risk_tolerance=request.constraints.risk_tolerance,
    )

    optimization_result = optimize_plan(
        farm=farm_state,
        prefs=prefs,
        constraints=constraints,
        scenario_description=request.scenario_description,
    )

    agent = get_agent_for_session(request.session_id)
    farm_summary = summarize_farm_state_for_llm(farm_state)

    explainer_prompt = (
        "You are Prometheus, a multi-objective farm planning assistant. "
        "A simple optimizer has selected the following best and alternative "
        "plans for the farmer, given their preferences and resource limits.\n\n"
        f"Farm state summary: {farm_summary}\n\n"
        f"Optimizer reasoning summary: {optimization_result.reasoning_summary}\n\n"
        f"Best plan: {optimization_result.best_plan.name} — "
        f"{optimization_result.best_plan.description}\n\n"
        f"Alternative plan: {optimization_result.alternative_plan.name} — "
        f"{optimization_result.alternative_plan.description}\n\n"
        "In 3–6 short sentences suitable for voice, explain:\n"
        "1) What you recommend the farmer should actually do.\n"
        "2) The main trade-offs between the best and alternative plans.\n"
        "3) Any cautions or simple checks before committing.\n"
    )

    llm_result = agent.invoke(
        {"input": explainer_prompt},
        config={"configurable": {"session_id": request.session_id}},
    )
    llm_explanation = str(llm_result)

    best_plan_summary = PlanSummary(
        name=optimization_result.best_plan.name,
        description=optimization_result.best_plan.description,
        expected_yield_index=optimization_result.best_plan.expected_yield_index,
        expected_profit_index=optimization_result.best_plan.expected_profit_index,
        water_use_index=optimization_result.best_plan.water_use_index,
        risk_index=optimization_result.best_plan.risk_index,
        notes=optimization_result.best_plan.notes,
    )
    alt_plan_summary = PlanSummary(
        name=optimization_result.alternative_plan.name,
        description=optimization_result.alternative_plan.description,
        expected_yield_index=optimization_result.alternative_plan.expected_yield_index,
        expected_profit_index=optimization_result.alternative_plan.expected_profit_index,
        water_use_index=optimization_result.alternative_plan.water_use_index,
        risk_index=optimization_result.alternative_plan.risk_index,
        notes=optimization_result.alternative_plan.notes,
    )

    return DecisionSupportResponse(
        best_plan=best_plan_summary,
        alternative_plan=alt_plan_summary,
        reasoning_summary=optimization_result.reasoning_summary,
        llm_explanation=llm_explanation,
    )


class CropSuggestionsRequest(BaseModel):
    location: Optional[str] = None
    soil_type: Optional[str] = None
    season: str = "spring"


@app.post("/api/crop-suggestions")
async def crop_suggestions(request: CropSuggestionsRequest) -> dict:
    """
    Get crop suggestions with planting dates, harvest dates, irrigation,
    and fertilizer recommendations based on location, soil type, and season.
    """
    suggestions = get_crop_suggestions(
        location=request.location,
        soil_type=request.soil_type,
        season=request.season
    )
    return {
        "suggestions": [s.model_dump() for s in suggestions]
    }


if __name__ == "__main__":
    # For local development, run:
    #   uvicorn backend.main:app --reload
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

