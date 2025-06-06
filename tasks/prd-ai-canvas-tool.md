# Product Requirements Document: AI Canvas-Based Note-Taking Tool

## 1. Introduction/Overview

This document outlines the requirements for a novel canvas-based note-taking tool designed for researchers and knowledge workers. The tool aims to create a symbiotic environment where humans and AI can collaborate to solve complex problems, conduct research, and facilitate learning.

The core of the product is a spatial, infinite canvas where users can create and connect notes. However, its unique value proposition lies in its integrated AI chat functionality. Users can ask the AI questions, receive answers with cited web sources, view those sources in-app, and, most importantly, add any webpage to the canvas as a "web-card." These web-cards then become part of the context for subsequent AI interactions, allowing the AI to "read" the user's curated research space.

The initial user experience will be streamlined: starting with a simple chat interface and transitioning to the full canvas UI after the first query, encouraging an AI-first workflow.

## 2. Goals

*   **G1:** To create a seamless workflow for users to research topics with an AI assistant, from initial query to visual organization of information.
*   **G2:** To empower users to build a visual knowledge base on a canvas that serves as an extended context for an AI assistant.
*   **G3:** To provide a fluid and intuitive user interface that blends a conversational AI experience with a spatial canvas for visual thinking.
*   **G4:** To build a Minimum Viable Product (MVP) focused on the core loop: **Query -> Web Search -> Cite -> Read -> Add to Canvas -> Reference in new Query**.

## 3. User Stories

*   **As a researcher,** I want to ask the AI a complex question so that I can get a summary and a list of relevant web sources to kickstart my investigation.
*   **As a knowledge worker,** I want to paste a link onto the canvas so that it creates a bookmark-like card with a summary, allowing me to visually organize my sources.
*   **As a student,** I want to select several web-cards on my canvas and ask the AI to "summarize these sources" so that I can quickly grasp the key concepts.
*   **As a researcher,** I want to visually map out different articles and ideas by creating note-cards and connecting them with lines, helping me synthesize information and see new connections.
*   **As a user,** when I open the application, I want to be greeted by a simple chat input so that I can immediately start a conversation with the AI without being overwhelmed by a complex UI.
*   **As a knowledge worker,** I want to edit notes using Markdown so that I can format my thoughts with lists, headers, and code snippets for better organization.
*   **As a user,** I want to preview a web source from the AI's response in a side panel without leaving the application, so I can quickly decide if it's relevant enough to add to my canvas.

## 4. Functional Requirements

### FR1: Initial User Experience
*   **FR1.1:** On first launch, the UI will present only a chat input field, similar to ChatGPT.
*   **FR1.2:** After the user submits their first query, the UI will transition to the main whiteboard view.
*   **FR1.3:** The main view will consist of an infinite canvas and a persistent AI chat panel.

### FR2: AI Chat Panel
*   **FR2.1:** The system must provide a text input field for users to ask questions to an AI.
*   **FR2.2:** The AI's responses must be displayed in the chat panel.
*   **FR2.3:** The AI must have the ability to perform web searches to answer questions.
*   **FR2.4:** When the AI's response is based on web sources, these sources must be cited clearly (e.g., with numbered footnotes).
*   **FR2.5:** Users must be able to click on a cited source to open it in a dedicated "preview panel" within the app.
*   **FR2.6:** Users must be able to reference specific cards on the canvas in their questions. The mechanism for this will be to allow the user to select cards on the canvas, which will be automatically included as context in the next AI query.

### FR3: Web-Card Functionality
*   **FR3.1:** When a user pastes a URL onto the canvas, the system must automatically create a "web-card".
*   **FR3.2:** The web-card must display the webpage's title, a brief description (meta description), and its favicon.
*   **FR3.3:** From the preview panel (FR2.5), the user must have a button to "Add to Canvas," which creates a web-card for that source.
*   **FR3.4:** Clicking a web-card on the canvas should open the link in the in-app preview panel.

### FR4: Canvas and Card Functionality
*   **FR4.1:** The canvas must be an infinite, pannable, and zoomable space.
*   **FR4.2: Card Creation:** Users must be able to create new, empty note-cards on the canvas (e.g., by double-clicking).
*   **FR4.3: Card Editing:** Users must be able to edit the content of note-cards. The editor must support the full Markdown specification.
*   **FR4.4: Card Manipulation:** Users must be able to move, resize, and delete cards on the canvas.
*   **FR4.5: Card Duplication:** Users must be able to duplicate any card (note-card or web-card).
*   **FR4.6: Connection Lines:** Users must be able to draw simple, straight lines from one card to another to indicate a connection.

### FR5: In-App Web Preview Panel
*   **FR5.1:** A dedicated panel should be used to render web pages from URLs (from citations or web-cards).
*   **FR5.2:** This panel should be a simple browser view, capable of displaying the content of the linked page.

## 5. Non-Goals (Out of Scope for MVP)

*   **Multi-user collaboration:** The initial version will be a single-user experience.
*   **Offline functionality:** The application will require an internet connection to function.
*   **Advanced card organization:** Features like grouping, layering (z-index), or structured layouts (e.g., grids) are not part of the MVP.
*   **Customizable connection lines:** Labeled, colored, or curved connection lines will not be implemented.
*   **Templates:** The application will not provide pre-built templates for specific use cases.
*   **User accounts and data persistence:** For the very first iteration, we will focus on the core loop. Data persistence will be addressed next.

## 6. Design Considerations

*   **UI Flow:** The initial screen is a chat input. Upon first interaction, it transitions to a two-panel layout: the canvas on the left (main area) and the AI chat on the right (sidebar). A third panel for web preview will appear when needed.
*   **Aesthetic:** Clean, minimalist, and modern. The focus should be on the content and the user's workflow, not on a feature-heavy interface.

## 7. Technical Considerations

*   **Platform:** Web application.
*   **Frontend:** A modern JavaScript framework that handles canvas rendering efficiently (e.g., React with a library like Konva, or a more specialized framework).
*   **AI Backend:** Requires integration with a large language model (LLM) API that has web search capabilities (e.g., GPT-4 with browsing, Perplexity AI, etc.).

## 8. Success Metrics

*   **Core Loop Adoption:** Percentage of users who successfully complete the core loop (Ask -> Get Source -> Add to Canvas -> Reference Card) within their first session.
*   **User Engagement:** Daily/Weekly Active Users (DAU/WAU).
*   **Feature Adoption:** Frequency of use for key features (card creation, web-card creation, connection lines).
*   **User Retention:** Percentage of users returning to the app after 1 week and 1 month.

## 9. Open Questions

*   What is the most intuitive UX for referencing canvas cards in an AI prompt? (e.g., @-mentioning, clicking cards to add them to a "context" area, a toggle for "use all cards as context"). We will start with selecting cards.
*   How should the system handle very large web pages in the preview panel or as context for the AI? Is there a content size limit? 