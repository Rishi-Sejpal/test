## CyberCISO | Omnikon Hackathon 2026
> **Problem Statement:** Omni_CyberTech_2 (Affordable Cybersecurity Assessment)
> **Domain:** 08 - Cybersecurity, Blockchain & Digital Trust

### Project Overview
Traditional vulnerability scanners are overly technical, and manual security audits are too expensive for micro-enterprises. CyberCISO bridges this gap by providing an on-demand, conversational risk assessment. 
*   **The Interview:** A frictionless chat interface that conducts a 5-minute operational security audit.
*   **The Engine:** A custom token-routing backend that intelligently compresses prompts to maintain zero-cost inference.
*   **The Output:** An actionable, jargon-free security roadmap mapped to NIST CSF and CIS Controls.

### Architecture & Tech Stack
*   **Frontend Interface:** Next.js and Tailwind CSS for a responsive, ephemeral session chat UI.
*   **Backend API:** Python and FastAPI handling asynchronous routing and strict Pydantic data validation.
*   **Optimization Layer:** Tiktoken (budget auditing) and LLMLingua-2 (semantic prompt compression) to prevent rate limits.
*   **Intelligence:** OpenAI `gpt-4o-mini` heavily sandboxed via system prompts to eliminate hallucinations and ensure framework compliance.

### Omnikon Declarations & Setup
*   **Team Details:** Built by Team [Insert Team Name] (Contributors: [Your Name] & [Partner's Name]).
*   **Generative AI Disclosure:** Generative AI tools were utilized during the ideation, structural planning, and architectural drafting phases of this project in compliance with hackathon rules.
*   **Local Backend Setup:** Navigate to the `/backend` directory, add your `.env` file, install requirements, and execute `python main.py`.
*   **Local Frontend Setup:** Navigate to the `/frontend` directory, execute `npm install`, and launch the server using `npm run dev`.
