import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Music, Disc3, Volume2, Zap } from "lucide-react";

export default function NotFound() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [beatAnimation, setBeatAnimation] = useState(false);

  const undergroundQuotes = [
    "This track got lost in the mix...",
    "404 BPM not found",
    "The bassline dropped... but the page didn't",
    "Your request got filtered by the low-pass",
    "This URL went underground... too underground",
    "Page not found in the cue list",
    "The DJ skipped this track",
    "Error in the mainroom, try the underground"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % undergroundQuotes.length);
    }, 3000);

    const beatInterval = setInterval(() => {
      setBeatAnimation(true);
      setTimeout(() => setBeatAnimation(false), 100);
    }, 600); // ~100 BPM

    return () => {
      clearInterval(interval);
      clearInterval(beatInterval);
    };
  }, []);

  // Base URL for links: "/" in dev or "/thecueroom/" in prod
  const homeHref = import.meta.env.BASE_URL;

  // Back button handler: go back if possible, else redirect home
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = homeHref;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Music className="w-16 h-16 text-purple-400" />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-bounce">
          <Disc3 className="w-12 h-12 text-cyan-400" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-pulse delay-300">
          <Volume2 className="w-14 h-14 text-green-400" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce delay-500">
          <Zap className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

      <div className="text-center space-y-8 px-4 z-10">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className={`text-9xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent transition-transform duration-100 ${
            beatAnimation ? 'scale-105' : 'scale-100'
          }`}>
            4🎧4
          </h1>
          <div className="absolute -top-4 -right-4 animate-spin">
            <Disc3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {/* Animated quote */}
        <div className="h-16 flex items-center justify-center">
          <h2 className="text-xl font-semibold text-cyan-400 animate-pulse max-w-md mx-auto">
            {undergroundQuotes[currentQuote]}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-400 max-w-md mx-auto text-sm">
          Looks like this page got lost in the underground. Let's get you back to the main floor.
        </p>

        {/* Fun footer */}
        <div className="text-xs text-gray-500 font-mono">
          ERROR_RATE: 404 BPM | STATUS: TRACK_NOT_FOUND | MODE: UNDERGROUND
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href={homeHref}>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0">
              <Home className="h-4 w-4" />
              Back to The Room
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous Track
          </Button>
        </div>

        {/* Footer philosophy */}
        <div className="text-xs text-gray-600 pt-8">
          "When in doubt, drop the bass... or just go home" - TheCueRoom Philosophy
        </div>
      </div>
    </div>
  );
}
