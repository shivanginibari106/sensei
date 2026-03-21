import Link from "next/link";
import { ArrowRight, Brain, FileText, MessageSquare, TrendingUp, Star, CheckCircle, Zap, Shield, BarChart3, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: TrendingUp,
    title: "Industry Insights",
    description:
      "Real-time market data, salary trends, and in-demand skills updated weekly via automated cron jobs.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    description:
      "Generate ATS-optimized resume content with Gemini AI. Improve any entry with one click.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description:
      "Role-specific quiz questions, performance tracking over time, and AI improvement tips.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Brain,
    title: "Cover Letter Generator",
    description:
      "Paste any job description and get a tailored, professional cover letter in seconds.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

const steps = [
  { step: "01", title: "Create your profile", desc: "Tell us your industry, role, experience, and skills." },
  { step: "02", title: "Get instant insights", desc: "Your personalized dashboard is ready with live market data." },
  { step: "03", title: "Use AI tools", desc: "Build your resume, prep for interviews, write cover letters." },
  { step: "04", title: "Land your dream job", desc: "Apply with confidence and track your improvement." },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Software Engineer at Meta",
    content: "Sensei helped me optimize my resume and practice interview questions. Got my dream job in 3 weeks!",
    rating: 5,
  },
  {
    name: "Marcus R.",
    role: "Product Manager at Stripe",
    content: "The industry insights dashboard is a game changer. I knew exactly what skills to highlight.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Data Scientist at OpenAI",
    content: "The AI cover letter generator saved me hours. Each letter feels personal and tailored.",
    rating: 5,
  },
];

const stats = [
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "4.9★", label: "Average Rating", icon: Star },
  { value: "89%", label: "Interview Success", icon: Award },
  { value: "2x", label: "Faster Job Search", icon: Zap },
];

const faqs = [
  {
    q: "How does the AI Resume Builder work?",
    a: "Our resume builder uses Google Gemini AI to analyze your experience and generate ATS-optimized bullet points and summaries tailored to your industry and target role.",
  },
  {
    q: "How often is the industry data updated?",
    a: "Industry insights are updated every week via automated background jobs, ensuring you always have the latest salary data, skill demand, and market trends.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your data is encrypted and never shared. We use Clerk for enterprise-grade authentication and Prisma with PostgreSQL for secure data storage.",
  },
  {
    q: "Can I try Sensei for free?",
    a: "Yes! You can sign up and explore the dashboard and industry insights for free. AI features require a subscription.",
  },
  {
    q: "What industries does Sensei support?",
    a: "Sensei supports technology, finance, healthcare, marketing, design, and many more. New industries are added based on user demand.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
              Sensei
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 gradient-mesh">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Zap className="w-3 h-3" />
            Powered by Gemini AI
          </Badge>
          <h1
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Your AI-Powered
            <br />
            <span className="gradient-text">Career Coach</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Land your dream job faster with AI-driven resume building, personalized interview prep,
            real-time industry insights, and smart cover letters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 px-8">
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                See features
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Free forever plan", "Cancel anytime"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
              Everything you need to
              <br />
              <span className="gradient-text">land your next role</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Four powerful AI tools working together to supercharge your job search.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <Card key={title} className="border-border/50 hover:border-primary/30 transition-colors group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Get started in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-black text-primary" style={{ fontFamily: "Syne, sans-serif" }}>{step}</span>
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Loved by job seekers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, content, rating }) => (
              <Card key={name} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{content}"</p>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Common questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 rounded-xl px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="rounded-3xl bg-primary/5 border border-primary/20 p-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
              Ready to level up
              <br />
              <span className="gradient-text">your career?</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join 50,000+ professionals using Sensei to accelerate their careers.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 px-10">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>Sensei</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ using Next.js, Tailwind CSS & Gemini AI
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
