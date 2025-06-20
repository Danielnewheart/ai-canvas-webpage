## Relevant Files

- `src/components/ui/WebPreviewPanel.tsx` - The main React component to be completely redesigned.
- `src/components/ui/WebPreviewPanel.test.tsx` - Unit tests for the `WebPreviewPanel` component.
- `src/app/api/browse/route.ts` - New API route handler for the server-side headless browser service.
- `src/app/api/browse/route.test.ts` - Unit tests for the `browse` API route.
- `lib/browser-service.ts` - New utility module to encapsulate the core headless browser logic (e.g., using Puppeteer/Playwright).
- `lib/browser-service.test.ts` - Unit tests for the browser service utility.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npm test` or `npx jest [optional/path/to/test/file]` to run tests.

## Tasks

- [x] 1.0 Backend: Set Up Headless Browser Service & API
  - [x] 1.1 Install a headless browser library (e.g., `puppeteer`) and add it to `package.json`.
  - [x] 1.2 Create the new API endpoint file at `src/app/api/browse/route.ts`.
  - [x] 1.3 In `lib/browser-service.ts`, implement the core logic to launch a browser instance, navigate to a given URL, and return the full page HTML.
  - [x] 1.4 In the API route, call the browser service and return the rendered HTML to the client.
  - [x] 1.5 Implement robust error handling for cases where a page fails to load in the headless browser.
  - [x] 1.6 Create basic unit tests for the browser service.

- [x] 2.0 Frontend: Redesign the WebPreviewPanel Component UI
  - [x] 2.1 Overhaul `src/components/ui/WebPreviewPanel.tsx`, removing the `iframe` and its related state. Keep "Add to canvas" button and function.
  - [x] 2.2 Build the new UI shell, including the top navigation bar and a content area.
  - [x] 2.3 Implement the browser-like controls: Back, Forward, Refresh, "Open in new tab", and Close buttons.
  - [x] 2.4 Add a non-editable address bar to display the current URL.
  - [x] 2.5 Design and implement clear visual states for loading and error conditions.

- [x] 3.0 Frontend: Integrate WebPreviewPanel with Backend Service
  - [x] 3.1 Create a client-side function within `WebPreviewPanel.tsx` to call the `/api/browse` endpoint.
  - [x] 3.2 When the component receives a `url` prop, trigger the API call and show the loading state.
  - [x] 3.3 Use the API response to render the fetched HTML into the component's content area (e.g., using `dangerouslySetInnerHTML`).
  - [x] 3.4 Connect the error state to failed API calls, displaying the error UI.
  - [x] 3.5 Create unit tests for the `WebPreviewPanel` component, mocking the API call.

- [x] 4.0 Core: Implement Interactive Navigation
  - [x] 4.1 Enhance the backend service to manage persistent browser sessions for a user.
  - [x] 4.2 On the frontend, write logic to intercept clicks on links (`<a>` tags) within the rendered HTML.
  - [x] 4.3 When a link is clicked, prevent the default browser action and instead call the `/api/browse` endpoint with the new URL.
  - [x] 4.4 Implement the "Back", "Forward", and "Refresh" button functionalities by making corresponding API calls to a backend service that controls the headless browser's navigation.
  - [x] 4.5 Manage a URL history state on the client to correctly enable/disable the Back and Forward buttons.

- [x] 5.0 Testing: Ensure End-to-End Reliability and Performance
  - [x] 5.1 Create end-to-end tests (e.g., using Playwright or Cypress) for the entire user flow: opening the panel, navigating a few pages, and closing it.
  - [x] 5.2 Perform manual testing against a list of known difficult-to-embed websites (e.g., GitHub, news sites) to verify the >95% success rate.
  - [x] 5.3 Conduct a basic performance review to ensure the remote browsing experience feels responsive.

- [x] 6.0 Make Web Preview Panel Resizable
  - [x] 6.1 Install `re-resizable` library for component resizing.
  - [x] 6.2 Wrap the `WebPreviewPanel` in a `Resizable` component.
  - [x] 6.3 Configure the resize handle to appear on the left, set default/min/max width, and ensure proper styling. 