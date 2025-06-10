# PRD: Web Preview Panel Redesign

## 1. Introduction/Overview

This document outlines the requirements for a complete redesign of the `WebPreviewPanel` component. The current `iframe`-based solution is unreliable, as many websites block embedding, leading to a poor and inconsistent user experience. The goal is to build a robust, integrated web viewer that allows users to seamlessly browse any external webpage from within the application, ensuring content always loads successfully.

## 2. Goals

-   **Reliability:** Eliminate page-loading failures. The new solution must successfully render content from any public webpage, including those that currently block `iframe` embedding.
-   **Seamless User Experience:** Create a fluid, in-app browsing experience that feels like a native feature, not a fragile embedded window.
-   **Full Interactivity:** Allow users to navigate the web within the panel just as they would in a standard browser, including clicking links and moving between pages.
-   **High Fidelity:** Render web pages with 100% visual accuracy, preserving the original site's layout, styles, and functionality.

## 3. User Stories

-   As a **user**, I want to click a link to a news article and read it directly within the app so that I don't have to switch contexts to an external browser.
-   As a **user**, when viewing a technical document on GitHub, I want to click on links to other pages in the repository and have them load within the panel so I can navigate the documentation easily.
-   As a **user**, I want to view a source link for a citation and be confident that the page will load every time, without seeing an error message.

## 4. Functional Requirements

1.  The system **must** display a web preview panel when a user initiates a web view action (e.g., clicking a citation link).
2.  The panel **must** successfully load and render the full HTML, CSS, and JavaScript content of the target URL.
3.  The panel **must** provide browser-like navigation controls:
    -   A "Back" button.
    -   A "Forward" button.
    -   A "Refresh" button.
    -   A non-editable address bar displaying the current URL.
4.  Users **must** be able to click any link on the rendered page, and the panel must navigate to and display the new page's content.
5.  The system **must** handle navigation state, so the back and forward buttons work as expected for the user's browsing history within the panel.
6.  The panel **must** include a button to "Open in new tab" that opens the current URL in the user's default external browser.
7.  The panel **must** include a "Close" button to dismiss the interface.
8.  The system **must** display a loading indicator while a page is being fetched and rendered.
9.  The system **must** handle and display errors gracefully (e.g., for a 404 Not Found error), with an option to try again.

## 5. Non-Goals (Out of Scope)

-   **User Logins & Complex Forms:** This feature is primarily for viewing public content. The first version will not support logging into websites or filling out complex, multi-page forms.
-   **Browser Extensions:** The solution should not require the user to install any browser extensions.
-   **Reader Mode:** A simplified, "reader mode" that reformats content is not required. The priority is rendering the original page with perfect fidelity.
-   **Developer Tools:** The panel will not include developer inspection tools.
-   **Multiple Tabs:** The panel will only display one web page at a time; it will not have its own tab management system.

## 6. Design Considerations

-   The UI should be clean, modern, and integrate seamlessly with the existing application design.
-   The navigation controls (Back, Forward, Refresh, URL bar) should be intuitive and positioned at the top of the panel.
-   The loading and error states should be visually clear and provide a good user experience.

## 7. Technical Considerations

-   **Core Technology:** A standard `iframe` approach is explicitly forbidden due to its unreliability (`X-Frame-Options`, CSP).
-   **Recommended Approach:** The suggested implementation is a **server-side headless browser**.
    -   The backend will receive a URL from the client.
    -   It will use a headless browser service (e.g., using libraries like Puppeteer or Playwright) to load the page in a virtual environment on the server.
    -   This service will return the fully rendered, interactive page content to the client-side `WebPreviewPanel` component.
    -   This approach guarantees that even JavaScript-heavy sites and SPAs render correctly and bypasses `iframe` blocking issues.
-   **Interactivity:** User interactions (like clicks) will need to be sent to the backend, which will execute them in the headless browser and return the updated page state. This creates a "remote browser" session.
-   **Performance:** The backend service must be optimized for performance to ensure the browsing experience feels responsive to the user. Consider resource management for headless browser instances.

## 8. Success Metrics

-   **Rendering Success Rate:** The feature will be tested against a list of 20 known difficult-to-embed websites (e.g., GitHub, various news sites, social media). Success is defined as a >95% successful render rate across this list and for general browsing.
-   **User Engagement:** Track the number of times the web preview panel is used and the average number of pages viewed per session. An increase indicates the feature is useful.
-   **Qualitative Feedback:** Collect user feedback to confirm the new solution is a significant improvement over the old one.

## 9. Open Questions

-   What is the expected server load and cost of running a headless browser service at scale? A performance and cost analysis should be conducted.
-   How should we manage session state for users navigating multiple pages? Does the session need to persist if the user closes and re-opens the panel to the same URL? 