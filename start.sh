#!/bin/bash
cd frontend && npm run dev &
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
wait