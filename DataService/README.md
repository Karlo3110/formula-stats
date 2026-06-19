# Data Service (FastF1)

FastAPI microservice that exposes Formula 1 data from
[FastF1](https://theoehrly-fast-f1.mintlify.app/). Consumed only by the NestJS
backend (guarded by a shared `X-Internal-Key` header), never by the browser.

> Runs on **Python 3.12** (pinned in `.python-version`). FastF1's dependencies
> (pandas/numpy/matplotlib) may not yet ship wheels for newer Python versions.

## Local development

```bash
cd DataService
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy env\.env.example env\.env  # then edit
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |
| GET | `/api/v1/seasons/{season}/events` | Season event schedule |
| GET | `/api/v1/seasons/{season}/rounds/{round}/sessions/{session}/results` | Session results (e.g. `R`, `Q`, `FP1`) |

Interactive docs at `/docs` when running.
