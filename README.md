# Prometheus

Prometheus is a LangChain-powered AI voice assistant for farmers. It provides crop advice, irrigation analysis, yield predictions, weather-aware planning, multi-objective farm planning, and image-based pest/disease help via a FastAPI backend and a modern React frontend.

### Backend (FastAPI + LangChain)

- **Location**: `backend/`
- **Key files**:
  - `assistant_prompt.py`: System prompt and behavioral spec for the Prometheus agent.
  - `tools.py`: Simulated tools for weather, soil, crops, yield prediction, irrigation analysis, and vision analysis.
  - `digital_twin.py`: Lightweight farm "digital twin" state store (fields, crops, notes) keyed by session.
  - `optimizer.py`: Multi-objective decision-support engine that proposes candidate management plans.
  - `agent.py`: LangChain chain factory and per-session runnable with chat history.
  - `main.py`: FastAPI app with `/health`, `/api/chat`, `/api/image-diagnosis`, and `/api/decision-support` endpoints.

The backend uses LangChain and tools to orchestrate between:

- `Weather_API_Tool`
- `Soil_Database_Tool`
- `Crop_Database_Tool`
- `Yield_Prediction_Model`
- `Irrigation_Analysis_Tool`
- `Vision_Analysis_Tool`

These tools are currently simulated and can be wired into real services later.

On top of this, Prometheus adds two novel capabilities:

- **Farm digital twin**: Each session maintains a structured `FarmState` capturing farmer name, location, primary crops, fields, and evolving notes. This state is automatically updated from the profile in the sidebar and summarized into every `/api/chat` prompt, so answers are tailored to the specific farm rather than generic for the region.
- **Multi-objective decision support**: The `/api/decision-support` endpoint combines the farm's digital twin, objective preferences (yield, profit, water saving, risk reduction), and resource constraints (water, nitrogen, budget, risk tolerance) to rank a set of candidate management plans (e.g. conservative vs balanced vs aggressive). The LLM then translates the optimizer's reasoning into a voice-friendly explanation of trade-offs and a clear recommendation.

#### Running the backend

```bash
cd /Users/vedang/prometheus
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# For Groq / Llama 3.3:
export GROQ_API_KEY="YOUR_GROQ_KEY_HERE"

# IMPORTANT: Use 'python -m uvicorn' to ensure the correct Python environment is used
python -m uvicorn backend.main:app --reload
```
Then visit `http://localhost:8000/docs` for the interactive API docs.

### Frontend (React + Vite)

- **Location**: `frontend/`
- **Key files**:
  - `src/App.tsx`: Main layout, chat window, voice controls, and image upload wiring.
  - `src/components/ChatWindow.tsx`: Chat UI for farmer–assistant conversation.
  - `src/components/SidebarProfile.tsx`: Farm profile panel (location, crops, notes).
  - `src/components/VoiceControls.tsx`: Voice input using the browser SpeechRecognition API.
  - `src/components/ImageUpload.tsx`: Image upload for leaf/pest diagnosis.
  - `src/styles.css`: Modern, glassmorphism-inspired styling.

#### Running the frontend

```bash
cd /Users/vedang/prometheus/frontend
npm install
npm run dev
```

Vite will start on `http://localhost:5173`, and it proxies `/api` and `/health` to the FastAPI backend at `http://localhost:8000`.

### Typical flow

1. The farmer opens the web app, fills in the farm profile (location, primary crops, notes).
2. They ask questions by typing or speaking; the frontend calls `/api/chat`.
3. The backend Prometheus agent uses LangChain tools and the farm's digital twin to fetch or simulate weather, soil, crop data, irrigation analysis, or yield predictions and returns concise, farm-specific, voice-friendly advice.
4. For plant health issues, the farmer uploads a photo; the frontend calls `/api/image-diagnosis`, and the backend uses the `Vision_Analysis_Tool` to simulate a diagnosis and treatment plan.
5. For seasonal or scenario planning, a client (or future UI) can call `/api/decision-support` with objective weights and constraints. The backend optimizer ranks candidate plans, and the LLM explains the best and alternative plans in plain language.

Farm digital twin (backend/digital_twin.py)
Added a FarmState structure (farmer name, location, primary crops, fields, notes) plus FieldState.
For each session_id, the backend maintains a FarmState in memory and updates it from incoming FarmerProfile data via:
update_farm_state_from_profile(...)
get_farm_state(session_id)
Added summarize_farm_state_for_llm(farm_state) which produces a concise, text summary fed into the LLM on every /api/chat and /api/decision-support call so answers are farm-specific, not generic.
Multi-objective decision-support engine (backend/optimizer.py)
Defined:
ObjectivePreferences (yield, profit, water saving, risk reduction weights),
ResourceConstraints (water/nitrogen limits, budget, risk tolerance),
PlanOption (conservative / balanced / aggressive plans with indices for yield, profit, water use, risk),
OptimizationResult.
Implemented optimize_plan(farm, prefs, constraints, scenario_description) which:
Generates 3 candidate plans,
Filters them against simple constraints,
Scores them with a composite multi-objective function,
Returns the best and an alternative plus a reasoning summary.
API wiring (backend/main.py)
Chat:
Syncs the digital twin on every /api/chat call using the FarmerProfile.
Prepends a “digital twin summary” to the LLM input:

> Context about this farm (digital twin summary): … Now answer the farmer’s question…
> New endpoint /api/decision-support:
> Request includes:
> session_id,
> Optional scenario_description,
> Optional updated farmer_profile,
> objectives (weights),
> constraints (resource limits, risk tolerance).
> Uses FarmState + optimize_plan to pick best and alternative plans.
> Calls the LLM to turn the optimizer’s result into a 3–6 sentence, voice-friendly explanation of:
> Recommended plan,
> Trade-offs,
> Cautions/checks.
> Response returns:
> best_plan, alternative_plan (structured summary),
> reasoning_summary from the optimizer,
> llm_explanation.

backend= uvicorn backend.main:app --reload  
frontend - npm run dev
