"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Brain, ChevronDown, LayoutDashboard, FileText, MessageSquare, Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const tools = [
  {
    href: "/dashboard",
    label: "Industry Insights",
    icon: TrendingUp,
    description: "Market trends & salaries",
  },
  {
    href: "/resume",
    label: "Resume Builder",
    icon: FileText,
    description: "AI-powered ATS resume",
  },
  {
    href: "/interview",
    label: "Interview Prep",
    icon: MessageSquare,
    description: "Mock quizzes & tips",
  },
  {
    href: "/ai-cover-letter",
    label: "Cover Letter",
    icon: Mail,
    description: "Tailored cover letters",
  },
  {
    href: "/ai-studio",
    label: "AI Studio",
    icon: Brain,
    description: "Create images & videos with AI",
  }
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span
            className="font-extrabold text-lg hidden sm:block"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Sensei
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <SignedIn>
            {/* Dashboard link */}
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
                className="hidden md:flex gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Growth Tools
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  AI-powered career tools
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tools.map(({ href, label, icon: Icon, description }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href} className={cn("flex items-start gap-3 p-2", pathname === href && "bg-accent")}>
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
