import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { InteractiveSphere } from '../components/InteractiveSphere';

import {
  Sparkles,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  Upload,
  Check,
  ArrowRight,
  PlayCircle,
  Zap,
  Target,
  Users,
  Star,
  ChevronRight,
  Rocket,
  Shield,
  Globe,
  Clock,
  Award,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';

export default function Landing() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  const features = [
    {
      title: 'Automation',
      description: 'AI automates your entire content workflow from creation to publishing',
      icon: Zap,
      color: 'from-[#8FA287] to-[#91A789]',
      stats: '10x faster'
    },
    {
      title: 'Analytics',
      description: 'Deep insights into performance metrics and audience engagement',
      icon: BarChart3,
      color: 'from-[#5C6F5C] to-[#607060]',
      stats: '99% accuracy'
    },
    {
      title: 'Growth',
      description: 'Scale your social presence with AI-powered growth strategies',
      icon: TrendingUp,
      color: 'from-[#91A789] to-[#8FA287]',
      stats: '300% growth'
    },
    {
      title: 'Thumbnails',
      description: 'Generate eye-catching thumbnails that maximize click-through rates',
      icon: ImageIcon,
      color: 'from-[#A4B49A] to-[#8FA287]',
      stats: '85% CTR boost'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator • 500K followers',
      avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=100&h=100&fit=crop',
      quote: 'PASMI cut my content creation time by 80%. The AI is incredibly accurate and understands my brand voice perfectly.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Marketing Director • Tech Startup',
      avatar: 'https://images.unsplash.com/photo-1748950363681-8f1eb9b416f7?w=100&h=100&fit=crop',
      quote: 'Our engagement increased 300% in just 2 months. This tool is a complete game-changer for our social strategy.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Social Media Manager • Agency',
      avatar: 'https://images.unsplash.com/photo-1615843423179-bea071facf96?w=100&h=100&fit=crop',
      quote: 'The thumbnail generator alone is worth the subscription. Incredible results and saves us hours every week.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users', icon: Users },
    { number: '1M+', label: 'Posts Generated', icon: Rocket },
    { number: '95%', label: 'Time Saved', icon: Clock },
    { number: '4.9/5', label: 'User Rating', icon: Star }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Upload your content',
      description: 'Drag and drop your video, image, or text content. Supports all major formats including MP4, JPG, PNG, and more.',
      icon: Upload,
      color: 'from-[#C9D5B5] to-[#A8B89D]'
    },
    {
      step: '02',
      title: 'AI generates everything',
      description: 'Our advanced AI analyzes your content and creates optimized titles, captions, thumbnails, and hashtags in seconds.',
      icon: Sparkles,
      color: 'from-[#A8B89D] to-[#9DB391]'
    },
    {
      step: '03',
      title: 'Publish & grow',
      description: 'Review, customize, and publish to all your social channels instantly. Track performance in real-time.',
      icon: TrendingUp,
      color: 'from-[#9DB391] to-[#6B7965]'
    }
  ];

  const integrations = [
    { name: 'YouTube', logo: 'https://images.unsplash.com/photo-1705904506626-aba18263a2c7?w=200&h=200&fit=crop' },
    { name: 'Instagram', logo: 'https://images.unsplash.com/photo-1692372374563-9ab54f303b7b?w=200&h=200&fit=crop' },
    { name: 'X', logo: 'https://images.unsplash.com/photo-1694878981829-da6c6a172c44?w=200&h=200&fit=crop' },
    { name: 'Facebook', logo: 'https://images.unsplash.com/photo-1764604617405-acd703852823?w=200&h=200&fit=crop' },
    { name: 'LinkedIn', logo: 'https://images.unsplash.com/photo-1762330463209-825488c52272?w=200&h=200&fit=crop' }
  ];

  return (
    <div className="min-h-screen bg-[#E8E8D8] overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#A4B49A]/40 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#8FA287]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#91A789]/30 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#3D4E5C]/95 backdrop-blur-xl z-50 border-b border-[#2A3742]/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <div
                className="text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: 'Georgia, serif', filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.4))' }}
              >
                PASMI
              </div>
              <div className="hidden lg:flex items-center gap-4 border-l border-[#8FA287]/30 pl-6">
                <span className="text-sm font-medium text-white/80">Welcome, UMAIR</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-white/90 hover:text-white transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="/dashboard">
                <Button variant="outline" className="border-[#8FA287] text-white hover:bg-[#8FA287]/20 transition-all font-semibold">
                  Dashboard
                </Button>
              </a>
              <a href="/login">
                <Button className="bg-gradient-to-r from-[#8FA287] to-[#5C6F5C] hover:from-[#91A789] hover:to-[#607060] text-white transition-all shadow-lg hover:shadow-[#8FA287]/30">
                  Login
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Interactive Sphere */}
      <section className="h-screen pt-20"> {/* Added pt-20 to pull down past fixed navbar */}
        <InteractiveSphere />
      </section>

      {/* Features Page */}
      <section id="features" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8E5D5] to-white py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Badge className="bg-gradient-to-r from-[#A8B89D] to-[#9DB391] text-white border-0 mb-6 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-[#A8B89D]/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-[#3d4238]">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-[#A8B89D] to-[#6B7965] bg-clip-text text-transparent">
                dominate social media
              </span>
            </h2>
            <p className="text-xl text-[#6B7965] max-w-3xl mx-auto leading-relaxed">
              AI-powered tools that transform your content strategy and drive real results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px" }}
                transition={{ duration: 1.0, delay: index * 0.15, ease: "easeOut" }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <Card className="p-8 h-full hover:shadow-2xl transition-all duration-500 border-2 hover:border-[#A8B89D] bg-white group overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  <div className="relative">
                    {/* Icon circle */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Stats badge */}
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#A8B89D] to-[#9DB391] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {feature.stats}
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-[#3d4238]">
                      {feature.title}
                    </h3>
                    <p className="text-[#6B7965] leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow indicator on hover */}
                    <div className="mt-6 flex items-center text-[#8FA287] group-hover:text-[#6B7965] transition-colors">
                      <span className="text-sm font-semibold mr-2">Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feature highlights */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          >
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border-2 border-[#C9D5B5]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#6B7965] mb-2">10K+</div>
              <div className="text-sm text-[#3d4238] font-medium">Active Users</div>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border-2 border-[#C9D5B5]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#6B7965] mb-2">1M+</div>
              <div className="text-sm text-[#3d4238] font-medium">Posts Generated</div>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border-2 border-[#C9D5B5]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#6B7965] mb-2">4.9/5</div>
              <div className="text-sm text-[#3d4238] font-medium">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations + Testimonials Page */}
      <section id="testimonials" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3d4238] via-[#505449] to-[#3d4238] py-20 px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto w-full relative">
          {/* Integrations Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-[#A8B89D]/30 to-[#9DB391]/30 text-[#C9D5B5] border-[#A8B89D]/50 mb-6 px-5 py-2.5 text-sm font-semibold">
                <Globe className="w-4 h-4 mr-2" />
                Integrations
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Works with all your favorite platforms
              </h2>
              <p className="text-lg text-[#C9D5B5] max-w-2xl mx-auto">
                Seamlessly publish to multiple social networks with one click
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-16">
              {integrations.map((integration, index) => (
                <motion.div
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 border-2 border-[#A8B89D]/30 hover:border-[#A8B89D]/60 w-40 h-40 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                >
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="w-16 h-16 object-contain mb-3 group-hover:scale-110 transition-transform"
                  />
                  <div className="text-sm font-semibold text-[#C9D5B5] group-hover:text-white transition-colors">
                    {integration.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-[#A8B89D]/30 to-[#9DB391]/30 text-[#C9D5B5] border-[#A8B89D]/50 mb-6 px-5 py-2.5 text-sm font-semibold">
                <Heart className="w-4 h-4 mr-2" />
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Loved by creators just like you
              </h2>
              <p className="text-lg text-[#C9D5B5] max-w-2xl mx-auto">
                See what our community has to say about transforming their social media presence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 1.0, delay: index * 0.2, ease: "easeOut" }}
                >
                  <Card className="p-8 bg-white/10 backdrop-blur-sm border-2 border-[#A8B89D]/30 hover:border-[#A8B89D]/60 hover:bg-white/15 transition-all duration-300 group h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#A8B89D] group-hover:scale-110 transition-transform"
                      />
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-[#C9D5B5]">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#A8B89D] text-[#A8B89D]" />
                      ))}
                    </div>
                    <p className="text-[#C9D5B5] leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works & Get Started Page */}
      <section id="how-it-works" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8E5D5] to-white py-20 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#A8B89D] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#9DB391] rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <Badge className="bg-gradient-to-r from-[#A8B89D] to-[#9DB391] text-white border-0 mb-8 px-6 py-3 text-base font-semibold shadow-lg shadow-[#A8B89D]/30">
              <Rocket className="w-5 h-5 mr-2" />
              Ready to Transform Your Social Media?
            </Badge>

            <h2 className="text-6xl md:text-8xl font-bold mb-8 text-[#3d4238] leading-tight">
              Start creating with<br />
              <span className="bg-gradient-to-r from-[#A8B89D] to-[#6B7965] bg-clip-text text-transparent">
                AI today
              </span>
            </h2>

            <p className="text-2xl text-[#6B7965] mb-16 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators who have already revolutionized their content strategy with PASMI's AI-powered tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <a href="/signup">
                <Button className="bg-gradient-to-r from-[#A8B89D] to-[#6B7965] hover:from-[#9DB391] hover:to-[#708070] text-white px-16 h-20 text-xl font-semibold shadow-2xl shadow-[#A8B89D]/40 hover:shadow-3xl hover:shadow-[#A8B89D]/50 transition-all hover:scale-105">
                  Get Started Free
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </a>
              <Button variant="outline" className="border-2 border-[#A8B89D] text-[#6B7965] hover:bg-[#A8B89D]/10 px-16 h-20 text-xl font-semibold">
                Watch Demo
                <PlayCircle className="w-6 h-6 ml-3" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-[#6B7965] mb-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>

            {/* How It Works - Quick Steps */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 1.0, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                >
                  <Card className="p-8 bg-white border-2 border-[#C9D5B5] hover:border-[#A8B89D] hover:shadow-xl transition-all group">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-[#C9D5B5] mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold text-[#3d4238] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#6B7965]">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3d4238] text-white py-16 px-6 lg:px-8 shadow-inner border-t border-[#2A3742]/50 relative z-10 w-full flex-shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A8B89D] to-[#9DB391] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">PASMI</h3>
              </div>
              <p className="text-[#C9D5B5] text-sm leading-relaxed">
                AI-powered social media management that helps creators and businesses grow faster.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#C9D5B5]">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#C9D5B5]">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#C9D5B5]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#5C6F5C] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#C9D5B5]">
              © 2024 PASMI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#5C6F5C] hover:bg-[#A8B89D] rounded-full flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#5C6F5C] hover:bg-[#A8B89D] rounded-full flex items-center justify-center transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#5C6F5C] hover:bg-[#A8B89D] rounded-full flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}