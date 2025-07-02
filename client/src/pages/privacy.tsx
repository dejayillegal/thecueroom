import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, UserCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is fundamental to TheCueRoom. Learn how we protect and handle your data.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: June 28, 2025
            </p>
          </div>

          {/* Data Collection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-primary" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Account Information</h4>
                <p className="text-muted-foreground text-sm">
                  When you create an account, we collect your email, name, stage name, date of birth, 
                  city, and verification links to social media profiles. This information is necessary 
                  for account verification and community safety.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Content & Activity</h4>
                <p className="text-muted-foreground text-sm">
                  We store posts, comments, likes, music profiles, and gig listings you create. 
                  This content is visible to other community members as part of the platform's social features.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Technical Data</h4>
                <p className="text-muted-foreground text-sm">
                  We collect IP addresses, browser information, and usage analytics to maintain 
                  platform security and improve user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-6 w-6 text-primary" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Platform Operations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Account creation and verification</li>
                    <li>• Content moderation and safety</li>
                    <li>• Community features and interactions</li>
                    <li>• Technical support and maintenance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Communication</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Account notifications and updates</li>
                    <li>• Community guidelines enforcement</li>
                    <li>• Platform announcements</li>
                    <li>• Security alerts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-6 w-6 text-primary" />
                <span>Data Protection & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Encryption & Storage</h4>
                <p className="text-muted-foreground text-sm">
                  All data is encrypted in transit and at rest. We use industry-standard security 
                  measures including secure databases, encrypted connections, and regular security audits.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Access Controls</h4>
                <p className="text-muted-foreground text-sm">
                  Access to user data is strictly limited to essential personnel and automated 
                  systems necessary for platform operation. All access is logged and monitored.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Password Security</h4>
                <p className="text-muted-foreground text-sm">
                  Passwords are hashed using industry-standard algorithms. We never store or have 
                  access to your plain-text password.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-primary" />
                <span>Data Sharing & Disclosure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">We Do NOT Share</h4>
                <p className="text-muted-foreground text-sm">
                  We do not sell, rent, or share your personal information with third parties 
                  for marketing purposes. Your data stays within our platform ecosystem.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Limited Sharing</h4>
                <p className="text-muted-foreground text-sm">
                  We may share data only in these specific circumstances:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• With your explicit consent</li>
                  <li>• When required by law or legal process</li>
                  <li>• To protect platform safety and security</li>
                  <li>• With service providers under strict confidentiality agreements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Your Rights & Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Data Access</h4>
                  <p className="text-muted-foreground text-sm">
                    You can view and download your personal data through your profile settings 
                    or by contacting us directly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Data Correction</h4>
                  <p className="text-muted-foreground text-sm">
                    Update your information anytime through your account settings. 
                    Contact us for assistance with data corrections.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Account Deletion</h4>
                  <p className="text-muted-foreground text-sm">
                    You can request account deletion through your settings or by contacting us. 
                    Some data may be retained for legal compliance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Data Portability</h4>
                  <p className="text-muted-foreground text-sm">
                    Export your content and data in a machine-readable format 
                    upon request for personal use or migration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about this privacy policy or how we handle your data, 
                please contact us:
              </p>
              <div className="space-y-2">
                <p className="font-medium">privacy@thecueroom.com</p>
                <p className="text-sm text-muted-foreground">
                  We'll respond to privacy inquiries within 72 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}