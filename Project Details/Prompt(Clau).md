JamesSoh2000: I am currently trying to learn how this project is built from the whole codebase to fully understand what are the implementations and why it's used. To fully learn them, I want you to create the best prompt that can analyze entire codebase and give me a roadmap. Imagine you have to rebuild the exact project from scratch with the roadmap. The roadmap should only instruct me what I have to look for each phase. I want the roadmap to be not containing details since I am going to use other prompts to go through each part one by one in the future. 

Workspace: Collecting workspace informationBased on your requirements, here's the perfect prompt to generate a high-level learning roadmap for your Personal Finance Tracker project:

---

## Prompt for Creating a Learning Roadmap

```
You are an expert software architect and educator. Analyze the Personal Finance Tracker project in "/home/james/Personal/Money Tracking/Original Project" and create a phase-based learning roadmap.

**Project Context:**
- Full-stack containerized finance tracker
- Tech Stack: React (TypeScript), Node.js/Express (TypeScript), PostgreSQL, Docker
- Features: User authentication (JWT), transaction management, financial analytics dashboard

**Roadmap Requirements:**

Create a learning roadmap with the following structure for each phase:

### Phase Format:
**Phase N: [Phase Name]**
- **Goal**: One sentence describing what you'll understand after this phase
- **Key Files to Study**: List 3-5 critical files (with paths)
- **Concepts to Learn**: 3-5 bullet points of concepts/patterns used
- **Questions to Answer**: 3-5 questions you should be able to answer after studying this phase
- **Dependencies**: Which previous phases must be completed first

**Phases to Cover:**
1. Project Structure & Configuration
2. Database Design & Migrations
3. Backend Architecture (Routing, Controllers, Services)
4. Authentication & Security (JWT, bcrypt, middleware)
5. API Design & Data Flow
6. Frontend Architecture (React components, routing, state)
7. Authentication Flow (Frontend ↔ Backend)
8. Data Visualization & Dashboard
9. Containerization & Deployment
10. Integration & Communication Between Layers

**Output Format:**
- Concise: Each phase should fit on one screen
- Non-prescriptive: Don't explain how to build, only what to study
- Question-driven: Focus on understanding "why" decisions were made
- Path-focused: Show clear file locations for exploration
- Modular: Each phase should be independently queryable in future prompts

**Exclude:**
- Detailed code explanations
- Implementation instructions
- Technology tutorials
- Step-by-step guides

The goal is a **study guide**, not a building guide. I will use separate prompts to dive deep into each phase later.
```

---

## How to Use This Roadmap

Once you get the roadmap, you can follow up with phase-specific prompts like:

```
"Explain Phase 2: Database Design & Migrations in detail. Walk me through the files listed, explain the concepts, and answer the questions from the roadmap."
```

or

```
"I'm on Phase 4: Authentication & Security. Show me how JWT flows through the codebase by tracing a login request from frontend to backend to database."
```

---

This approach will give you:
1. **High-level structure** first (the roadmap)
2. **Deep dives** later (phase-by-phase exploration)
3. **Clear learning path** (prerequisites and dependencies)
4. **Flexible exploration** (you can skip around or go in order)

Would you like me to generate this roadmap now, or would you prefer to refine the prompt further?