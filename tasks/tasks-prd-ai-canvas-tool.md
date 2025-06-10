## Relevant Files

- `components/canvas/Canvas.tsx` - The main component for rendering the infinite canvas, managing panning, zooming, and card positions.
- `components/canvas/Canvas.test.tsx` - Unit tests for the `Canvas.tsx` component.
- `components/cards/NoteCard.tsx` - Component for rendering and editing a standard note-card with Markdown support.
- `components/cards/NoteCard.test.tsx` - Unit tests for the `NoteCard.tsx` component.
- `components/cards/WebCard.tsx` - Component for rendering a web-card with title, description, favicon, and click functionality.
- `components/ui/ChatPanel.tsx` - The AI chat interface, handling message display and user input.
- `components/ui/ChatPanel.test.tsx` - Unit tests for the `ChatPanel.tsx` component.
- `components/ui/WebPreviewPanel.tsx` - The panel for displaying external web pages from citations or web-cards.
- `app/page.tsx` - The initial entry point of the application, displaying the simple chat interface.
- `app/canvas/page.tsx` - The main page that hosts the canvas and chat panel UI.
- `app/api/chat/route.ts` - The backend API route for handling requests to the LLM, including web search.
- `app/api/metadata/route.ts` - The backend API route to fetch URL metadata (title, description, favicon, image) for web-cards.
- `lib/hooks/useCanvasState.ts` - A custom hook to manage the state of the canvas (e.g., cards, connections, zoom level).
- `lib/hooks/useChat.ts` - A custom hook for managing the chat state and communication with the `/api/chat` endpoint.

### Notes

- We will use Next.js with TypeScript for this project.
- Unit tests should be created alongside the components they test.
- To run tests, use `npm test` or `npx jest [optional/path/to/test/file]`.

## Tasks

- [x] 1.0 **Project Setup & Initial UI**
  - [x] 1.1 Set up a new Next.js project with TypeScript and Tailwind CSS.
  - [x] 1.2 Create the initial chat-centric UI as the main entry point (`app/page.tsx`) (FR1.1).
  - [x] 1.3 Create the main canvas view (`app/canvas/page.tsx`) containing placeholders for the canvas and AI chat panel (FR1.3).
  - [x] 1.4 Implement the client-side routing logic to transition from the initial chat UI to the canvas view after the first message is sent (FR1.2).

- [x] 2.0 **Core Canvas Functionality**
  - [x] 2.1 Integrate a canvas library (e.g., `react-flow` or `konva`) into the `Canvas.tsx` component.
  - [x] 2.2 Implement background panning and zooming functionality for the canvas (FR4.1).
  - [x] 2.3 Implement the ability to add a new `NoteCard.tsx` to the canvas (e.g., on double-click) (FR4.2).
  - [x] 2.4 Integrate a Markdown editor (e.g., `react-markdown`) into `NoteCard.tsx` to support rich-text editing (FR4.3).
  - [x] 2.5 Implement dragging, resizing, and deleting for all card components on the canvas (FR4.4).
  - [x] 2.6 Implement a "duplicate" action for cards (FR4.5).
  - [x] 2.7 Implement the drawing of simple, straight connection lines between cards (FR4.6).

- [x] 3.0 **AI Chat Panel & Backend Integration**
  - [x] 3.1 Build the UI for the `ChatPanel.tsx`, including a message history area and an input form (FR2.1, FR2.2).
  - [x] 3.2 Create the backend API endpoint (`app/api/chat/route.ts`) to proxy requests to a OpenAI API followed by https://platform.openai.com/docs/api-reference/chat.
  - [x] 3.3 Integrate the OpenAI API that has web search capabilities followed by https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat.
  - [x] 3.4 Connect the `ChatPanel.tsx` to the backend endpoint to send user queries and receive AI responses.
  - [x] 3.5 Ensure AI responses with web sources are parsed and displayed with clickable links/footnotes (FR2.4).
  - [x] 3.6 Add search status indicator to show when AI is searching the web (UX enhancement).

- [x] 4.0 **Web-Card & In-App Preview**
  - [x] 4.1 Build the `WebPreviewPanel.tsx` component, likely using an `<iframe>` to display external web pages (FR5.1, FR5.2).
  - [x] 4.2 Implement the logic to open citation links from the chat panel in the `WebPreviewPanel.tsx` (FR2.5).
  - [x] 4.3 Create the backend API endpoint (`app/api/metadata/route.ts`) to fetch metadata from a URL (FR3.2).
  - [x] 4.4 Implement the functionality to create a `WebCard.tsx` on the canvas when a user pastes a link (FR3.1). This will call the metadata endpoint.
  - [x] 4.5 Add an "Add to Canvas" button in the `WebPreviewPanel.tsx` that creates a corresponding `WebCard.tsx` on the main canvas (FR3.3).
  - [x] 4.6 Implement the logic for a click on a `WebCard.tsx` to open its link in the `WebPreviewPanel.tsx` (FR3.4).

- [ ] 5.0 **Connecting the Core Loop**
  - [ ] 5.1 Implement a selection mechanism for cards on the canvas (e.g., single-click to select, multi-select with Shift key).
  - [ ] 5.2 Modify the AI chat submission logic to check for selected cards and include their content as context in the API request to the backend (FR2.6).
  - [ ] 5.3 Update the `/api/chat` backend endpoint to accept and process the additional context from canvas cards.
  - [ ] 5.4 Conduct an end-to-end test of the primary user flow: Ask -> Get cited response -> Open source in preview -> Add source to canvas -> Select card -> Ask a new question referencing the card. 