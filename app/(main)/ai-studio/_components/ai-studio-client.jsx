"use client";

import { useState } from "react";
import { generateImage, generateVideo, purchaseCredits } from "@/actions/ai-studio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Image, Video, Zap, ShoppingCart, Sparkles } from "lucide-react";

const IMAGE_APIS = [
  { id: "huggingface", name: "Hugging Face", desc: "Stable Diffusion XL", badge: "Free" },
  { id: "replicate", name: "Replicate", desc: "Mock Demo", badge: "Mock" },
  { id: "gemini", name: "Google Gemini", desc: "Gemini Image Gen", badge: "Free" },
  { id: "llama", name: "Meta LLaMA", desc: "Mock Integration", badge: "Mock" },
];

const VIDEO_APIS = [
  { id: "veo", name: "Google Veo", desc: "Concept-level Mock", badge: "Mock" },
  { id: "replicate", name: "Replicate", desc: "Mock Video Demo", badge: "Mock" },
];

const CREDIT_PACKS = [
  { credits: 5, price: "$2.99", popular: false },
  { credits: 15, price: "$6.99", popular: true },
  { credits: 50, price: "$19.99", popular: false },
];

export default function AIStudioClient({ initialCredits, initialGenerations }) {
  const [credits, setCredits] = useState(initialCredits);
  const [generations, setGenerations] = useState(initialGenerations);
  const [prompt, setPrompt] = useState("");
  const [selectedApi, setSelectedApi] = useState("");
  const [generationType, setGenerationType] = useState(""); // must select
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleGenerate = async () => {
    if (!generationType) {
      toast.error("Please select Image or Video first!");
      return;
    }
    if (!selectedApi) {
      toast.error("Please select an AI model!");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt!");
      return;
    }
    if (credits.balance <= 0) {
      toast.error("Free limit reached, please purchase credits!");
      setShowPurchase(true);
      return;
    }
    if (generationType === "video" && credits.balance < 2) {
      toast.error("Insufficient credits to generate video! Need 2 credits.");
      setShowPurchase(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data;
      if (generationType === "image") {
        data = await generateImage({ prompt, api: selectedApi });
      } else {
        data = await generateVideo({ prompt, api: selectedApi });
      }

      setResult({ type: generationType, url: data.resultUrl });
      setCredits((prev) => ({
        ...prev,
        balance: prev.balance - (generationType === "video" ? 2 : 1),
      }));
      toast.success("Generation complete!");

    } catch (error) {
      if (error.message === "INSUFFICIENT_CREDITS") {
        toast.error("Free limit reached, please purchase credits!");
        setShowPurchase(true);
      } else {
        toast.error("Generation failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (amount) => {
    setPurchasing(true);
    try {
      await purchaseCredits(amount);
      setCredits((prev) => ({ ...prev, balance: prev.balance + amount }));
      setShowPurchase(false);
      toast.success(`${amount} credits added successfully!`);
    } catch (error) {
      toast.error("Purchase failed!");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" /> AI Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate images and videos with multiple AI models
          </p>
        </div>

        {/* Credit Balance */}
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="text-yellow-500 w-5 h-5" />
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-bold">{credits.balance}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPurchase(true)}
              className="ml-2"
            >
              <ShoppingCart className="w-4 h-4 mr-1" /> Buy
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Free limit warning */}
      {credits.balance === 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-destructive font-medium">
            ⚠️ Free limit reached, please purchase credits to continue generating.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowPurchase(true)}
          >
            Purchase Credits
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Generator */}
        <div className="space-y-6">
          {/* Step 1: Select Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Step 1 — Select Generation Type
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setGenerationType("image"); setSelectedApi(""); setResult(null); }}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  generationType === "image"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Image className="w-8 h-8 text-primary" />
                <span className="font-semibold">Generate Image</span>
                <span className="text-xs text-muted-foreground">1 credit</span>
              </button>
              <button
                onClick={() => { setGenerationType("video"); setSelectedApi(""); setResult(null); }}
                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                  generationType === "video"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Video className="w-8 h-8 text-primary" />
                <span className="font-semibold">Generate Video</span>
                <span className="text-xs text-muted-foreground">2 credits</span>
              </button>
            </CardContent>
          </Card>

          {/* Step 2: Select API */}
          {generationType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2 — Select AI Model</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {(generationType === "image" ? IMAGE_APIS : VIDEO_APIS).map((api) => (
                  <button
                    key={api.id}
                    onClick={() => setSelectedApi(api.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedApi === api.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{api.name}</span>
                      <Badge variant={api.badge === "Mock" ? "secondary" : "default"} className="text-xs">
                        {api.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{api.desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Prompt */}
          {selectedApi && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3 — Enter Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="w-full h-32 p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={loading || credits.balance <= 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate {generationType}</>
                  )}
                </Button>
                {credits.balance <= 0 && (
                  <p className="text-destructive text-sm text-center">
                    Insufficient credits to generate. Please purchase credits.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Result */}
        <div className="space-y-6">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg">Result</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI is generating your {generationType}...</p>
                  <p className="text-xs text-muted-foreground">This may take 10-30 seconds</p>
                </div>
              )}
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                  <Sparkles className="w-12 h-12 opacity-20" />
                  <p>Your generation will appear here</p>
                </div>
              )}
              {result && result.type === "image" && (
                <div className="space-y-3">
                    <img
                    src={result.url}
                    alt="Generated"
                    className="w-full rounded-lg border border-border"
                    onError={(e) => {
                        e.target.src = `https://picsum.photos/512/512?random=${Date.now()}`;
                    }}
                    />
                    <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        if (result.url.startsWith("data:")) {
                        const link = document.createElement("a");
                        link.href = result.url;
                        link.download = `generated-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        } else {
                        window.open(result.url, "_blank");
                        }
                    }}
                    >
                    Download Image
                    </Button>
                </div>
                )}
              {result && result.type === "video" && (
                <div className="space-y-3">
                  <video
                    src={result.url}
                    controls
                    className="w-full rounded-lg border border-border"
                  />
                  <Badge variant="secondary" className="w-full justify-center">
                    {selectedApi === "veo" ? "Google Veo — Concept Mock" : "Replicate Video"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Generations</CardTitle>
            </CardHeader>
            <CardContent>
              {generations.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No generations yet
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {generations.slice(0, 10).map((gen) => (
                    <div
                      key={gen.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {gen.type === "image" ? (
                          <Image className="w-4 h-4 text-primary" />
                        ) : (
                          <Video className="w-4 h-4 text-primary" />
                        )}
                        <span className="truncate max-w-[150px]">{gen.prompt}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{gen.api}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="text-primary" /> Purchase Credits
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a credit pack to continue generating
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.credits}
                  onClick={() => handlePurchase(pack.credits)}
                  disabled={purchasing}
                  className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all hover:border-primary ${
                    pack.popular ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="text-yellow-500" />
                    <div className="text-left">
                      <p className="font-bold">{pack.credits} Credits</p>
                      {pack.popular && (
                        <Badge className="text-xs">Most Popular</Badge>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-primary">{pack.price}</span>
                </button>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPurchase(false)}
              >
                Cancel
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                🔒 Test mode — no real payment processed
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}