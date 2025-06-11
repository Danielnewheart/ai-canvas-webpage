# AI Canvas - Intelligent Canvas Note-Taking Tool

AI Canvas is an innovative canvas-based note-taking and research tool designed for researchers, knowledge workers, and students. It seamlessly integrates AI chat functionality with an infinite canvas, allowing you to visually organize knowledge and collaborate with AI for in-depth research.

## 🌟 Features

### Core Features
- **AI Chat Assistant**: Built-in intelligent AI assistant supporting web search and citation
- **Infinite Canvas**: A space that can be infinitely zoomed and dragged, freely organizing your ideas
- **Web Cards**: Convert web content into visual cards to build your knowledge base
- **Note Cards**: Free note cards supporting Markdown format
- **Connection Lines**: Draw connection lines between cards to establish knowledge associations
- **Web Preview**: In-app preview of web content without leaving the work environment

### Unique Value
- **AI-First Workflow**: Start with simple conversations and naturally transition to visual organization
- **Context-Aware AI**: AI can read your canvas content to provide more relevant answers
- **Research Loop**: Query → Search → Cite → Read → Add to Canvas → Re-query

## 🚀 Getting Started

### System Requirements
- Node.js 18.0 or higher
- npm or yarn package manager
- Modern browsers (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone the Project**
   ```bash
   git clone <repository-url>
   cd ai-dev-tasks
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variable Setup**
   
   Create a `.env.local` file and add the necessary API keys:
   ```bash
   # Copy environment variable template
   cp .env.example .env.local
   ```
   
   Edit the `.env.local` file:
   ```env
   # OpenAI API Key
   OPENAI_API_KEY="your_openai_api_key_here"
   
   # Perplexity AI API Key
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   
   # Other optional configurations
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the Application**
   
   Visit [http://localhost:3000](http://localhost:3000) in your browser

### Obtaining API Keys

#### Perplexity AI API Key
1. Go to the [Perplexity AI API](https://www.perplexity.ai/api) website
2. Register an account and log in
3. Create a new API key in the console
4. Add the key to the `.env.local` file

## 📖 User Guide

### First-Time Use
1. **Start a Conversation**: When you first open the app, you'll see a simple chat input field
2. **Ask a Question**: Enter your question or research topic, and the AI will provide answers and relevant web resources
3. **Enter the Canvas**: After submitting the first question, the interface will automatically switch to the full canvas view

### Main Operations

#### AI Chat Panel
- Chat with AI in the right-side chat panel
- Click citation links in AI responses to preview web content
- Use the "Add to Canvas" button to convert web pages into cards

#### Canvas Operations
- **Zoom**: Use the mouse wheel to zoom the canvas
- **Pan**: Drag the blank area to move the canvas view
- **Create Notes**: Double-click a blank area to create new note cards
- **Edit Content**: Click on a card to enter edit mode, supporting Markdown syntax
- **Move Cards**: Drag cards to rearrange
- **Resize**: Drag card edges to adjust size
- **Create Connections**: Drag from one card to another to create connection lines

#### Web Cards
- Add web pages to the canvas from the chat panel
- Directly paste URLs onto the canvas to create web cards
- Click web cards to view content in the preview panel

### Advanced Tips
- **Contextual Queries**: Select cards on the canvas, then ask the AI, which will use these cards as context
- **Batch Citation**: Select multiple web cards and ask the AI to summarize the content of these resources
- **Knowledge Mapping**: Use connection lines to establish associations between concepts, building a visual knowledge map

## 🛠 Technical Architecture

### Frontend Tech Stack
- **Next.js 15.3.3**: Full-stack React framework
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **React Flow**: Canvas and graph rendering
- **Tiptap**: Rich text editor (Markdown support)
- **Lucide React**: Icon library

### Key Dependencies
- **AI SDK**: Integration with AI models
- **Puppeteer**: Web content scraping
- **Cheerio**: HTML parsing and manipulation
- **Axios**: HTTP client
- **React Markdown**: Markdown rendering

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/         # AI chat API
│   │   ├── browse/       # Web browsing API
│   │   ├── metadata/     # Web metadata API
│   │   └── proxy/        # Proxy API
│   ├── canvas/           # Canvas page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── canvas/           # Canvas components
│   ├── cards/            # Card components
│   └── ui/               # UI components
└── lib/                  # Utility libraries
```

## 🚢 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start the production server
npm start
```

### Vercel Deployment (Recommended)
1. Push the project to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables (same as `.env.local`)
4. Complete the deployment

### Other Platforms
The project supports deployment to any Node.js-compatible platform:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🧪 Development

### Available Scripts
```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Code linting
npm run lint

# Run tests
npm run test
```

### Development Environment Setup
1. Install recommended VS Code extensions:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Importer

2. Configure code formatting:
   - Prettier
   - ESLint

### Testing
The project uses Jest and React Testing Library for testing:
```bash
# Run all tests
npm run test

# Watch mode for tests
npm run test:watch
```

## 🤝 Contribution

We welcome community contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards
- Use TypeScript for type checking
- Follow ESLint rules
- Write meaningful commit messages
- Add appropriate tests

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Q: AI chat is not working**
A: Ensure `PERPLEXITY_API_KEY` is correctly set in the `.env.local` file

**Q: Web preview is not loading**
A: Some websites may have CORS restrictions, try using the proxy API route

**Q: Canvas performance issues**
A: If too many cards cause performance degradation, try zooming or grouping cards

**Q: Build failure**
A: Ensure Node.js version >= 18.0, and clear node_modules to reinstall dependencies

### Getting Help
- Check the [Issues](../../issues) page for solutions
- Submit a new Issue to report problems
- Participate in [Discussions](../../discussions) for community support

## 🔮 Future Plans

- [ ] Multi-user collaboration
- [ ] Data persistence and cloud sync
- [ ] More AI model options
- [ ] Template system
- [ ] Mobile support
- [ ] Offline functionality
- [ ] Advanced analytics and insights

---

**Start your AI-enhanced research journey!** 🚀

If you have any questions or suggestions, feel free to open an Issue or submit a Pull Request.
