import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Globe, Shield, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg">Linkhub Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
                One Link,<br />
                <span className="text-accent-foreground">Infinite Possibilities</span>
              </h1>
              <p className="text-xl mb-8 text-white/90" data-testid="text-hero-subtitle">
                Create your professional bio link page in minutes. Share all your important links in one beautiful, customizable page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-hero-cta">
                    Get Started Free
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-hero-demo">
                  View Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Phone mockup */}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-features-title">
              Powerful Features for Every Creator
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to showcase your brand and grow your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Unlimited Links</h3>
                <p className="text-muted-foreground">Add as many links as you want with our pro plan. Organize them perfectly.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Editor</h3>
                <p className="text-muted-foreground">Customize your page layout with our intuitive drag and drop interface.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Track clicks, views, and engagement with detailed analytics.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mobile Optimized</h3>
                <p className="text-muted-foreground">Your page looks perfect on all devices with responsive design.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Branding</h3>
                <p className="text-muted-foreground">Add your own domain and remove our branding with pro features.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-muted-foreground">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-bold mb-6" data-testid="text-price-free">
                    Rp 0<span className="text-lg text-muted-foreground font-normal">/month</span>
                  </div>
                  <Button className="w-full mb-8" variant="secondary" data-testid="button-free-plan">
                    Get Started Free
                  </Button>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>1 Bio Page</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Basic Blocks (Links, Social, Contact)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Linkhub Branding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-bold mb-2" data-testid="text-price-pro">
                    Rp 35,000<span className="text-lg font-normal">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">or Rp 420,000/year (save 2 months)</div>
                  <Button className="w-full mb-8" data-testid="button-pro-plan">
                    Upgrade to Pro
                  </Button>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Unlimited Bio Pages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>All Block Types (20+ blocks)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Custom Domain</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Remove Linkhub Branding</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg">Linkhub Pro</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 Linkhub Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
