import Header from "@/components/header";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 min-h-screen">{children}</main>
      <footer className="border-t border-border/50 py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Made with ❤️ by Sensei AI
        </div>
      </footer>
    </div>
  );
}
