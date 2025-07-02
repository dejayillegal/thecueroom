import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Shield, Heart, Zap, Globe } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">About TheCueRoom</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              India's premier underground techno and house music community for artists, DJs, and electronic music enthusiasts.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                TheCueRoom exists to foster and celebrate India's underground electronic music scene. We provide a dedicated space 
                where techno and house music artists, DJs, and passionate listeners can connect, collaborate, and grow together. 
                Our verified community ensures quality interactions while maintaining the intimate, underground spirit that 
                defines our culture.
              </p>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Verified Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Our verification process maintains the quality and authenticity of interactions, 
                  ensuring every member contributes meaningfully to the underground scene.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Artist-Focused</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Built by artists, for artists. We understand the unique needs of electronic music creators 
                  and provide tools to showcase, promote, and connect with like-minded individuals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span>Underground Spirit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  We celebrate the raw, authentic energy of underground techno and house music, 
                  supporting experimental sounds and pushing creative boundaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>India-Wide Network</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Connecting electronic music communities across India - from Bangalore's tech scene 
                  to Mumbai's nightlife, Delhi's underground, and Goa's beach parties.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span>What We Offer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">For Artists & DJs</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-platform music profile integration</li>
                    <li>• Gig promotion and event listings</li>
                    <li>• Direct fan engagement tools</li>
                    <li>• Collaborative playlist creation</li>
                    <li>• Artist verification system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">For the Community</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Curated electronic music news</li>
                    <li>• Underground meme culture</li>
                    <li>• Event discovery and promotion</li>
                    <li>• Weekly playlist recommendations</li>
                    <li>• Real-time community discussions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">Join the Movement</h3>
            <p className="text-muted-foreground mb-6">
              Ready to be part of India's underground electronic music revolution? 
              Get an invite from an existing member or reach out to us.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}