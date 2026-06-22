# Sythoria

A lightweight, privacy-first AI chat interface that connects to any OpenAI-compatible API. No accounts, no tracking — just pick a provider, add your key, and start chatting.

## Features

- **Multi-provider support** — OpenAI, Anthropic, Google Gemini, Ollama, OpenRouter, NVIDIA NIM, and any custom OpenAI-compatible endpoint
- **Streaming responses** — Real-time, token-by-token output via Server-Sent Events
- **Privacy-first** — API keys stored only in your browser; zero telemetry; no server-side data
- **Web search integration** — Augment responses with live search (Google, SearXNG, Firecrawl, or custom)
- **System prompts** — Built-in presets for Code Help, Code Review, Debug, and Refactor, plus custom prompts
- **Dark/light theme** — Toggle appearance in settings
- **Free and open source** — No subscriptions, no paywalls, no feature gates

## Quick Start

### Download the desktop app

Download the latest release from [GitHub Releases](https://github.com/sythoria/sythoria-desktop/releases/latest).

### Run locally for development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supported Providers

| Provider | API Key Required | Type |
|----------|-----------------|------|
| OpenAI | Yes | Cloud |
| Anthropic | Yes | Cloud |
| Google Gemini | Yes | Cloud |
| Ollama | No | Local |
| OpenRouter | Yes | Cloud |
| NVIDIA NIM | Yes | Cloud |
| Custom | Optional | Any |

See the [full documentation](https://sythoria.app/docs/getting-started) for provider-specific setup guides.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Lint, format check, and build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run check` | Full check: lint + format + test + build |

## Documentation

Full docs are available at [sythoria.app/docs](https://sythoria.app/docs):

- [Quickstart](https://sythoria.app/docs/getting-started)
- [Streaming Responses](https://sythoria.app/docs/features/streaming)
- [Multi-Provider Chat](https://sythoria.app/docs/features/multi-provider)
- [Configuration](https://sythoria.app/docs/configuration)
- [Privacy & Security](https://sythoria.app/docs/privacy)

## License

Open source. See [LICENSE](LICENSE) for details.
