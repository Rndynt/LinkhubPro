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
  ArrowRightIcon,
  StarIcon,
  ZapIcon,
  GlobeIcon,
  UsersIcon,
  MenuIcon,
  XIcon
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center transition-transform hover:scale-105">
                <span className="text-primary-foreground font-bold text-sm sm:text-lg">L</span>
              </div>
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Linkhub Pro
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-200" data-testid="button-signup">
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" data-testid="button-mobile-login">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 mt-2" data-testid="button-mobile-signup">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/50"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 animate-pulse" data-testid="hero-badge">
              ⚡ Trusted by 10,000+ creators
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
              One Link,<br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Infinite Possibilities
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create your professional bio link page in minutes. Share all your important links in one beautiful, customizable page that converts visitors into followers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 px-8 py-4 text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  data-testid="button-get-started-hero"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
                data-testid="button-view-demo"
              >
                View Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
          
          {/* Phone Mockup - Responsive */}
          <div className="mt-12 sm:mt-16 flex justify-center">
            <div className="relative mx-auto w-64 h-[500px] sm:w-80 sm:h-[600px] bg-foreground rounded-[2.5rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-2xl transition-transform hover:scale-105 duration-300">
              <div className="w-full h-full bg-background rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                <div className="p-4 sm:p-6 text-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-2xl">
                    J
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Jessica Creator</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Content Creator & Entrepreneur</p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground p-3 sm:p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer text-sm sm:text-base">
                      📚 My Latest Blog Posts
                    </div>
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 sm:p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer text-sm sm:text-base">
                      🛍️ Online Shop
                    </div>
                    <div className="bg-muted text-foreground p-3 sm:p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer text-sm sm:text-base">
                      🎵 Spotify Playlist
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer text-sm sm:text-base">
                      📸 Instagram
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30" data-testid="section-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Powerful Features for Every Creator</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to showcase your brand and grow your audience
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-unlimited-links">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Unlimited Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Add as many links as you want with our pro plan. Organize them perfectly.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-drag-drop">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <PaletteIcon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-card-foreground">Drag & Drop Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customize your page layout with our intuitive drag and drop interface.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-analytics">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <BarChartIcon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-card-foreground">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track clicks, views, and engagement with detailed analytics.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-mobile-optimized">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <SmartphoneIcon className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-card-foreground">Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your page looks perfect on all devices with responsive design.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-custom-branding">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <GlobeIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-card-foreground">Custom Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Use your own domain and remove our branding with pro features.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border" data-testid="feature-card-secure-reliable">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-card-foreground">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Trusted by creators worldwide</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-muted-foreground">
              <div className="flex items-center space-x-2 transition-colors hover:text-foreground">
                <UsersIcon className="w-5 h-5" />
                <span className="font-semibold">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2 transition-colors hover:text-foreground">
                <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 transition-colors hover:text-foreground">
                <ZapIcon className="w-5 h-5" />
                <span className="font-semibold">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30" data-testid="section-pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-card border-border transition-all duration-300 hover:shadow-lg" data-testid="pricing-card-free">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-card-foreground">Free</CardTitle>
                <div className="text-4xl font-bold text-card-foreground">
                  Rp 0<span className="text-lg text-muted-foreground font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/auth/register">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors" data-testid="button-get-started-free">
                    Get Started Free
                  </Button>
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">1 Bio Page</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Basic Blocks (Links, Social, Contact)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Basic Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Linkhub Branding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative bg-card transition-all duration-300 hover:shadow-xl hover:scale-105" data-testid="pricing-card-pro">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-3xl sm:text-4xl font-bold">
                  Rp 35,000<span className="text-base sm:text-lg font-normal opacity-90">/month</span>
                </div>
                <div className="text-sm opacity-90">or Rp 420,000/year (save 2 months)</div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-200" data-testid="button-upgrade-pro">
                  Upgrade to Pro
                </Button>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Unlimited Bio Pages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">All Block Types (20+ blocks)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Custom Domain</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Remove Linkhub Branding</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-card-foreground">Priority Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Ready to create your bio link page?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8">
            Join thousands of creators who trust Linkhub Pro to showcase their brand
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 px-6 sm:px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              data-testid="button-final-cta"
            >
              Get Started Free Today
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Linkhub Pro</span>
          </div>
          <p className="text-muted-foreground">© 2024 Linkhub Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}