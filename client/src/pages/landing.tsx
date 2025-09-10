import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckIcon, 
  LinkIcon, 
  SmartphoneIcon, 
  BarChartIcon,
  PaletteIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-xl">Linkhub Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button data-testid="button-signup">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                One Link,<br />
                <span className="text-accent-foreground">Infinite Possibilities</span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Create your professional bio link page in minutes. Share all your important links in one beautiful, customizable page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg"
                    data-testid="button-get-started-hero"
                  >
                    Get Started Free
                    <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                  data-testid="button-view-demo"
                >
                  View Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-5 h-5" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-5 h-5" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            
            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-72 h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            J
                          </div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Jessica Creator</h3>
                    <p className="text-sm text-gray-600 mb-6">Content Creator & Entrepreneur</p>
                    
                    <div className="space-y-3">
                      <div className="bg-primary text-white p-4 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">
                        📚 My Latest Blog Posts
                      </div>
                      <div className="bg-accent text-white p-4 rounded-xl hover:bg-accent/90 transition-colors cursor-pointer">
                        🛍️ Online Shop
                      </div>
                      <div className="bg-gray-100 text-gray-900 p-4 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                        🎵 Spotify Playlist
                      </div>
                      <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
                        📸 Instagram
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background" data-testid="section-features">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Every Creator</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to showcase your brand and grow your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-unlimited-links">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Unlimited Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Add as many links as you want with our pro plan. Organize them perfectly.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-drag-drop">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <PaletteIcon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Drag & Drop Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customize your page layout with our intuitive drag and drop interface.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-analytics">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChartIcon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track clicks, views, and engagement with detailed analytics.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-mobile-optimized">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <SmartphoneIcon className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your page looks perfect on all devices with responsive design.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-custom-branding">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <PaletteIcon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Custom Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Add your own domain and remove our branding with pro features.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="feature-card-secure-reliable">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30" data-testid="section-pricing">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card data-testid="pricing-card-free">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold">
                  Rp 0<span className="text-lg text-muted-foreground font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/auth/register">
                  <Button className="w-full" variant="secondary" data-testid="button-get-started-free">
                    Get Started Free
                  </Button>
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span>1 Bio Page</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span>Basic Blocks (Links, Social, Contact)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span>Linkhub Branding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary relative" data-testid="pricing-card-pro">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">
                  Rp 35,000<span className="text-lg font-normal opacity-80">/month</span>
                </div>
                <div className="text-sm opacity-80">or Rp 420,000/year (save 2 months)</div>
              </CardHeader>
              <CardContent className="space-y-6 bg-primary text-primary-foreground rounded-b-lg">
                <Button className="w-full bg-white text-primary hover:bg-white/90" data-testid="button-upgrade-pro">
                  Upgrade to Pro
                </Button>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Unlimited Bio Pages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>All Block Types (20+ blocks)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Custom Domain</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Remove Linkhub Branding</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-white" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-xl">Linkhub Pro</span>
          </div>
          <p className="text-muted-foreground">© 2024 Linkhub Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
