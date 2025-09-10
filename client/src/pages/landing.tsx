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
  UsersIcon
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Linkhub Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-signup">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              ⚡ Trusted by 10,000+ creators
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              One Link,<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Infinite Possibilities
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create your professional bio link page in minutes. Share all your important links in one beautiful, customizable page that converts visitors into followers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
                  data-testid="button-get-started-hero"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
                data-testid="button-view-demo"
              >
                View Demo
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
          
          {/* Phone Mockup */}
          <div className="mt-16 flex justify-center">
            <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    J
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Jessica Creator</h3>
                  <p className="text-sm text-gray-600 mb-6">Content Creator & Entrepreneur</p>
                  
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer">
                      📚 My Latest Blog Posts
                    </div>
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer">
                      🛍️ Online Shop
                    </div>
                    <div className="bg-gray-100 text-gray-900 p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer">
                      🎵 Spotify Playlist
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl transition-transform hover:scale-105 cursor-pointer">
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
      <section className="py-24 bg-gray-50" data-testid="section-features">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Features for Every Creator</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to showcase your brand and grow your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-unlimited-links">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Unlimited Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Add as many links as you want with our pro plan. Organize them perfectly.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-drag-drop">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <PaletteIcon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Drag & Drop Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Customize your page layout with our intuitive drag and drop interface.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-analytics">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChartIcon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track clicks, views, and engagement with detailed analytics.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-mobile-optimized">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <SmartphoneIcon className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Your page looks perfect on all devices with responsive design.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-custom-branding">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <GlobeIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Custom Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Use your own domain and remove our branding with pro features.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white" data-testid="feature-card-secure-reliable">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by creators worldwide</h3>
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5" />
                <span className="font-semibold">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <ZapIcon className="w-5 h-5" />
                <span className="font-semibold">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" data-testid="section-pricing">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="bg-white" data-testid="pricing-card-free">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Free</CardTitle>
                <div className="text-4xl font-bold text-gray-900">
                  Rp 0<span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/auth/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800" data-testid="button-get-started-free">
                    Get Started Free
                  </Button>
                </Link>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">1 Bio Page</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Basic Blocks (Links, Social, Contact)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Basic Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Linkhub Branding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-500 relative bg-white" data-testid="pricing-card-pro">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">
                  Rp 35,000<span className="text-lg font-normal opacity-90">/month</span>
                </div>
                <div className="text-sm opacity-90">or Rp 420,000/year (save 2 months)</div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-upgrade-pro">
                  Upgrade to Pro
                </Button>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Unlimited Bio Pages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">All Block Types (20+ blocks)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Custom Domain</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Remove Linkhub Branding</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Priority Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to create your bio link page?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators who trust Linkhub Pro to showcase their brand
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              data-testid="button-final-cta"
            >
              Get Started Free Today
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Linkhub Pro</span>
          </div>
          <p className="text-gray-600">© 2024 Linkhub Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}