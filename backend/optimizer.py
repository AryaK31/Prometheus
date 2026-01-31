from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from .digital_twin import FarmState


@dataclass
class ObjectivePreferences:
    """
    Farmer's high-level preferences over multiple objectives.

    All weights are in [0, 1]. They are normalized internally.
    """

    weight_yield: float = 0.4
    weight_profit: float = 0.3
    weight_water_saving: float = 0.2
    weight_risk_reduction: float = 0.1


@dataclass
class ResourceConstraints:
    """Simple resource and risk constraints for seasonal planning."""

    max_water_mm: Optional[float] = None
    max_nitrogen_kg_ha: Optional[float] = None
    max_budget_usd: Optional[float] = None
    risk_tolerance: str = "medium"  # "low", "medium", "high"


@dataclass
class PlanOption:
    """One candidate management plan with simple scores for each objective."""

    name: str
    description: str
    expected_yield_index: float
    expected_profit_index: float
    water_use_index: float  # 1.0 = high use, 0.0 = very low
    risk_index: float  # 1.0 = high risk, 0.0 = very safe
    notes: Optional[str] = None


@dataclass
class OptimizationResult:
    """Result of multi-objective ranking."""

    best_plan: PlanOption
    alternative_plan: PlanOption
    reasoning_summary: str


def _normalize_weights(prefs: ObjectivePreferences) -> ObjectivePreferences:
    total = (
        prefs.weight_yield
        + prefs.weight_profit
        + prefs.weight_water_saving
        + prefs.weight_risk_reduction
    )
    if total <= 0:
        return ObjectivePreferences()
    return ObjectivePreferences(
        weight_yield=prefs.weight_yield / total,
        weight_profit=prefs.weight_profit / total,
        weight_water_saving=prefs.weight_water_saving / total,
        weight_risk_reduction=prefs.weight_risk_reduction / total,
    )


def _score_plan(plan: PlanOption, prefs: ObjectivePreferences) -> float:
    """
    Compute a simple composite score for a plan.

    We treat yield and profit as 'higher is better' and water_use/risk as
    'lower is better'.
    """
    return (
        prefs.weight_yield * plan.expected_yield_index
        + prefs.weight_profit * plan.expected_profit_index
        + prefs.weight_water_saving * (1.0 - plan.water_use_index)
        + prefs.weight_risk_reduction * (1.0 - plan.risk_index)
    )


def optimize_plan(
    farm: FarmState,
    prefs: ObjectivePreferences,
    constraints: ResourceConstraints,
    scenario_description: Optional[str] = None,
) -> OptimizationResult:
    """
    A lightweight, explainable multi-objective optimization routine.

    This is intentionally simple but structured so that it can be swapped out
    for a more sophisticated solver later. It generates a few generic plans
    (conservative, balanced, aggressive) and ranks them according to the
    farmer's preferences and constraints.
    """
    prefs_n = _normalize_weights(prefs)

    # Very rough heuristic templates. In practice these could be conditioned
    # on crop, soil, and weather information from the digital twin.
    crop_label = farm.primary_crops[0] if farm.primary_crops else "the main crop"

    conservative = PlanOption(
        name="Conservative water- and risk-aware plan",
        description=(
            f"Maintain moderate fertilizer rates, prioritize soil moisture monitoring, "
            f"and irrigate only when {crop_label} shows clear stress or soil moisture "
            "drops below a conservative threshold."
        ),
        expected_yield_index=0.7,
        expected_profit_index=0.7,
        water_use_index=0.3,
        risk_index=0.2,
        notes="Designed for low risk and water saving.",
    )

    balanced = PlanOption(
        name="Balanced yield–water–profit plan",
        description=(
            f"Use regionally recommended fertilizer rates and scheduled irrigation events "
            f"for {crop_label}, skipping or reducing events after significant rainfall."
        ),
        expected_yield_index=0.85,
        expected_profit_index=0.85,
        water_use_index=0.5,
        risk_index=0.4,
        notes="Aims for good yield with reasonable input use.",
    )

    aggressive = PlanOption(
        name="Aggressive high-yield plan",
        description=(
            f"Push {crop_label} towards maximum yield with higher-end fertilizer rates and "
            "more frequent irrigation, focusing on avoiding any water or nutrient stress."
        ),
        expected_yield_index=0.95,
        expected_profit_index=0.9,
        water_use_index=0.8,
        risk_index=0.7,
        notes="Higher upside but also higher input use and risk.",
    )

    candidates: List[PlanOption] = [conservative, balanced, aggressive]

    # Very simple constraint filtering.
    filtered: List[PlanOption] = []
    for plan in candidates:
        if constraints.max_water_mm is not None and plan.water_use_index > 0.7:
            # Drop very water-hungry plans when water is clearly limited.
            continue
        if constraints.risk_tolerance == "low" and plan.risk_index > 0.5:
            continue
        filtered.append(plan)

    if not filtered:
        filtered = candidates

    scored = sorted(filtered, key=lambda p: _score_plan(p, prefs_n), reverse=True)

    best = scored[0]
    alternative = scored[1] if len(scored) > 1 else scored[0]

    scenario_text = (
        scenario_description.strip() if scenario_description else "this upcoming season"
    )

    reasoning = (
        f"For {scenario_text}, given the stated preferences and constraints, the "
        f"'{best.name}' scores highest on the combined objectives. It balances "
        f"expected yield (index {best.expected_yield_index:.2f}), profit "
        f"({best.expected_profit_index:.2f}), water use (index {best.water_use_index:.2f}, "
        "lower is better), and risk (index "
        f"{best.risk_index:.2f}, lower is better). The alternative plan "
        f"'{alternative.name}' is also reasonable and may be preferred if you "
        "value the trade-offs it offers in terms of inputs and risk."
    )

    return OptimizationResult(
        best_plan=best,
        alternative_plan=alternative,
        reasoning_summary=reasoning,
    )

