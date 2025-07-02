import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Music, Mail, Shield, FileText } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="mb-6">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
              India's exclusive underground techno and house music community. 
              Connect with artists, DJs, and music enthusiasts in the electronic music scene.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="h-4 w-4 flex-shrink-0" />
                <span>Since 2025</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>Verified Artists</span>
              </div>
            </div>
          </div>

          {/* Community Links */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
              Community
            </h3>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link href="/">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 block">
                      Home Feed
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/gigs">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 block">
                      Gigs & Events
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/music-platforms">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 block">
                      Music Platforms
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/playlists">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 block">
                      Playlists
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
              Support
            </h3>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link href="/about">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 flex items-center gap-2">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span>About Us</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 flex items-center gap-2">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span>Contact Us</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 flex items-center gap-2">
                      <Shield className="h-3 w-3 flex-shrink-0" />
                      <span>Privacy Policy</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200 flex items-center gap-2">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span>Terms of Service</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 TheCueRoom. Made with 💚 for the underground scene.
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Bangalore • Mumbai • Delhi • Goa • India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
export { Footer };