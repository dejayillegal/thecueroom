import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, AlertTriangle, Gavel } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These terms govern your use of TheCueRoom. Please read them carefully.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: June 28, 2025
            </p>
          </div>

          {/* Acceptance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing or using TheCueRoom, you agree to be bound by these Terms of Service 
                and our Privacy Policy. If you do not agree to these terms, please do not use our platform. 
                These terms may be updated from time to time, and continued use constitutes acceptance 
                of any changes.
              </p>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>Community Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Respectful Conduct</h4>
                <p className="text-muted-foreground text-sm">
                  Treat all community members with respect. Harassment, discrimination, hate speech, 
                  or personal attacks will not be tolerated and may result in immediate account suspension.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Authentic Content</h4>
                <p className="text-muted-foreground text-sm">
                  Share only original content or properly attributed material. Respect intellectual 
                  property rights and do not post copyrighted material without permission.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Underground Spirit</h4>
                <p className="text-muted-foreground text-sm">
                  Keep discussions focused on electronic music, particularly techno and house. 
                  Commercial promotion should be authentic and community-relevant.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Responsibilities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Account & User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Account Security</h4>
                <p className="text-muted-foreground text-sm">
                  You are responsible for maintaining the security of your account credentials. 
                  Report any unauthorized access immediately. Do not share your account with others.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Accurate Information</h4>
                <p className="text-muted-foreground text-sm">
                  Provide accurate information during registration and keep your profile updated. 
                  False information may result in account suspension or termination.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Verification Requirements</h4>
                <p className="text-muted-foreground text-sm">
                  Artists must provide valid social media links for verification. Maintaining 
                  verification status requires active presence in the electronic music community.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <span>Prohibited Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Content Violations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Spam or repetitive content</li>
                    <li>• NSFW or inappropriate material</li>
                    <li>• Copyright infringement</li>
                    <li>• Misleading or false information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Platform Abuse</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automated or bot activity</li>
                    <li>• Attempting to hack or exploit</li>
                    <li>• Creating multiple accounts</li>
                    <li>• Circumventing restrictions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content & Intellectual Property */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Content & Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Your Content</h4>
                <p className="text-muted-foreground text-sm">
                  You retain ownership of content you post but grant TheCueRoom a license to display, 
                  distribute, and moderate your content on the platform. You are responsible for 
                  ensuring you have rights to any content you share.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Platform Content</h4>
                <p className="text-muted-foreground text-sm">
                  TheCueRoom's design, features, and original content are protected by intellectual 
                  property laws. You may not copy, reproduce, or distribute platform elements 
                  without permission.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Moderation & Enforcement */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="h-6 w-6 text-primary" />
                <span>Moderation & Enforcement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Content Moderation</h4>
                <p className="text-muted-foreground text-sm">
                  We use both automated systems and human moderators to maintain community standards. 
                  Content may be removed or accounts suspended for violations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Appeal Process</h4>
                <p className="text-muted-foreground text-sm">
                  If you believe moderation action was taken in error, you may appeal by contacting 
                  us within 30 days. We'll review appeals fairly and respond promptly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Account Termination</h4>
                <p className="text-muted-foreground text-sm">
                  We reserve the right to suspend or terminate accounts for violations of these terms. 
                  Severe violations may result in immediate termination without warning.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Disclaimers & Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Service Availability</h4>
                <p className="text-muted-foreground text-sm">
                  We strive for high availability but cannot guarantee uninterrupted service. 
                  Maintenance, updates, or technical issues may temporarily affect access.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">User-Generated Content</h4>
                <p className="text-muted-foreground text-sm">
                  TheCueRoom is not responsible for user-generated content. Views expressed by 
                  users do not represent our opinions or endorsements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">External Links</h4>
                <p className="text-muted-foreground text-sm">
                  Our platform may contain links to external websites. We are not responsible 
                  for the content, privacy practices, or security of external sites.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About These Terms?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p className="font-medium">legal@thecueroom.com</p>
                <p className="text-sm text-muted-foreground">
                  We'll respond to legal inquiries within 5 business days.
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