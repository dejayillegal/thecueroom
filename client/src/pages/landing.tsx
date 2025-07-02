import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users, Shield, Zap } from "lucide-react";
import AuthModal from "@/components/auth/auth-modal";
import { Logo } from "@/components/ui/logo";

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <Button 
              onClick={() => setAuthModalOpen(true)}
              className="cue-button"
            >
              Enter The Room
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to the{" "}
            <span className="cue-text-gradient">Underground</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An invite-only community for techno and house music artists in India. 
            Connect, create, and push the boundaries of electronic music culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="cue-button text-lg px-8 py-3"
            >
              Join the Community
            </Button>
            <Button 
              onClick={() => {
                const featuresSection = document.getElementById('features-section');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why <span className="text-primary">TheCueRoom</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cue-card">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Verified Artists Only</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Exclusive community of verified techno and house artists with authentic portfolios.
                </p>
              </CardContent>
            </Card>

            <Card className="cue-card">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Moderated Space</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered moderation ensures quality discussions without self-promotion or spam.
                </p>
              </CardContent>
            </Card>

            <Card className="cue-card">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI-Powered Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate memes, customize avatars, and get curated content tailored to the scene.
                </p>
              </CardContent>
            </Card>

            <Card className="cue-card">
              <CardHeader>
                <Music className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Underground Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dedicated to authentic underground electronic music culture and community building.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get verified and become part of India's premier underground electronic music community.
          </p>
          <Button 
            onClick={() => setAuthModalOpen(true)}
            size="lg"
            className="cue-button text-lg px-8 py-3"
          >
            Start Your Journey
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            * Verification required through valid social media or music platform links
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 TheCueRoom. Made with 💚 in Bangalore.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
