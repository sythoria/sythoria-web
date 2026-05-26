import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  MessageSquare,
  Settings,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui";

const categories = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Get up and running with Sythoria in under a minute.",
    href: "/docs/getting-started",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Features",
    description:
      "Streaming, multi-provider support, and everything in between.",
    href: "/docs/features/streaming",
    accent: "from-indigo-500 to-indigo-600",
  },
  {
    icon: BookOpen,
    title: "Providers",
    description: "Connect to OpenAI, Anthropic, Gemini, Ollama, and more.",
    href: "/docs/providers/openai",
    accent: "from-blue-500 to-blue-600",
  },
  {
    icon: Settings,
    title: "Configuration",
    description:
      "Customize models, temperature, system prompts, and other settings.",
    href: "/docs/configuration",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "How Sythoria keeps your API keys and data safe.",
    href: "/docs/privacy",
    accent: "from-emerald-500 to-emerald-600",
  },
];

export default function DocsLanding() {
  return (
    <div className="animate-fade-in">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
          Documentation
        </h1>
        <p className="mt-3 text-lg text-text-secondary leading-relaxed max-w-xl">
          Everything you need to know about Sythoria — from quickstart to
          advanced configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(({ icon: Icon, title, description, href, accent }) => (
          <Link key={title} href={href} className="group">
            <Card variant="glass" padding="md" hover className="h-full">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-text-primary">
                      {title}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
