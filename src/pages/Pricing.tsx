import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CodeBracketIcon,
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';

interface PricingTier {
  name: string;
  icon: any;
  resources: number;
  complexity: 'Low' | 'Medium' | 'High';
  multiplier: number;
  price: number;
  isFree?: boolean;
  popular?: boolean;
  examples: string[];
  features: string[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter Project',
    icon: SparklesIcon,
    resources: 15,
    complexity: 'Low',
    multiplier: 1.0,
    price: 0,
    isFree: true,
    examples: ['New OSS library', 'Beta product', 'Small tool'],
    features: [
      'Under 20 resources',
      'Basic documentation',
      'Community support',
      'Standard delivery',
    ],
  },
  {
    name: 'Growing Product',
    icon: RocketLaunchIcon,
    resources: 50,
    complexity: 'Medium',
    multiplier: 1.5,
    price: 675,
    popular: true,
    examples: ['SaaS platform', 'Developer tool', 'Framework'],
    features: [
      '40-80 resources',
      'Multi-source research',
      'Priority support',
      'Fast delivery (48h)',
    ],
  },
  {
    name: 'Established Ecosystem',
    icon: BuildingOffice2Icon,
    resources: 150,
    complexity: 'High',
    multiplier: 2.0,
    price: 1800,
    examples: ['Auth provider', 'Payment API', 'Cloud platform'],
    features: [
      '100-200 resources',
      'Deep analysis',
      'Dedicated support',
      'Rush delivery (24h)',
    ],
  },
  {
    name: 'Major Platform',
    icon: ChartBarIcon,
    resources: 500,
    complexity: 'High',
    multiplier: 2.0,
    price: 5000,
    examples: ['Stripe-level', 'AWS service', 'Major framework'],
    features: [
      '300+ resources',
      'Enterprise analysis',
      'White-glove support',
      'Same-day delivery',
    ],
  },
];

const premiumAddons: Addon[] = [
  {
    id: 'extended_research',
    name: 'Extended Research',
    description: 'Deep dive into 50+ YouTube tutorials, 200+ Stack Overflow questions',
    price: 500,
    icon: MagnifyingGlassIcon,
  },
  {
    id: 'code_snippets',
    name: 'Code Snippets & Validation',
    description: 'Extract and test 50-200 code samples with multi-language support',
    price: 700,
    icon: CodeBracketIcon,
  },
  {
    id: 'migration_guides',
    name: 'Migration Guides',
    description: 'Getting Started guides and competitor migration paths',
    price: 850,
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    id: 'api_reference',
    name: 'API Reference Documentation',
    description: 'Auto-generate endpoint docs, authentication guides, rate limits',
    price: 1400,
    icon: CodeBracketIcon,
  },
  {
    id: 'white_label',
    name: 'White-Label Branding',
    description: 'Custom themes, logo integration, subdomain hosting',
    price: 350,
    icon: PaintBrushIcon,
  },
  {
    id: 'rush_delivery',
    name: 'Rush Delivery (24-48h)',
    description: 'Priority processing and expedited delivery',
    price: 500,
    icon: BoltIcon,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const handleGetQuote = () => {
    if (url.trim()) {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      navigate(`/?url=${encodeURIComponent(normalizedUrl)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-4 py-2 bg-[rgb(102,255,228)]/20 text-[rgb(102,255,228)] border-[rgb(102,255,228)]/30">
              Transparent Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Custom Documentation for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[rgb(102,255,228)] to-[rgb(72,225,198)]">
                DevRel Teams
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
              Pay only for what you need. Instant quotes based on your community footprint.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              No subscriptions. No hidden fees. Just transparent, fair pricing.
            </p>
          </div>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Simple, Transparent Formula
              </p>
              <p className="text-lg text-gray-400 mb-6">
                We count your community resources and calculate a fair price
              </p>
            </div>

            <div className="bg-gradient-to-r from-[rgb(102,255,228)]/10 to-[rgb(72,225,198)]/10 border border-[rgb(102,255,228)]/30 rounded-3xl p-8 md:p-12 mb-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-6">
                  $300 + (Resources × $5) × Complexity
                </div>
                <div className="text-lg text-gray-300 mb-8">
                  Capped at $5,000 maximum
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <CurrencyDollarIcon className="w-12 h-12 text-[rgb(102,255,228)] mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">$300</div>
                    <div className="text-gray-400">Base Minimum</div>
                    <div className="text-sm text-gray-500 mt-2">Covers basic research & generation</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <ChartBarIcon className="w-12 h-12 text-[rgb(102,255,228)] mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">$5</div>
                    <div className="text-gray-400">Per Resource</div>
                    <div className="text-sm text-gray-500 mt-2">Stack Overflow, GitHub, YouTube, etc.</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <SparklesIcon className="w-12 h-12 text-[rgb(102,255,228)] mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">1.0-2.0×</div>
                    <div className="text-gray-400">Complexity Multiplier</div>
                    <div className="text-sm text-gray-500 mt-2">Low, Medium, or High complexity</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(102,255,228)]/5 border border-[rgb(102,255,228)]/20 rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold text-[rgb(102,255,228)]">
                Projects under 20 resources are FREE
              </p>
              <p className="text-gray-400 mt-2">
                Perfect for small libraries and early-stage products
              </p>
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Example Pricing
              </h2>
              <p className="text-xl text-gray-300">
                Real-World Examples
              </p>
              <p className="text-lg text-gray-400 mt-2">
                See what documentation would cost for different project sizes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative p-8 bg-gray-800/50 border ${
                    tier.popular
                      ? 'border-[rgb(102,255,228)] ring-2 ring-[rgb(102,255,228)]/50'
                      : 'border-gray-700'
                  } hover:border-[rgb(102,255,228)] transition-all duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[rgb(102,255,228)] text-gray-900 border-0 px-4 py-1">
                        Most Common
                      </Badge>
                    </div>
                  )}
                  {tier.isFree && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500 text-white border-0 px-4 py-1">
                        FREE
                      </Badge>
                    </div>
                  )}

                  <tier.icon className="w-12 h-12 text-[rgb(102,255,228)] mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      {tier.isFree ? 'FREE' : `$${tier.price.toLocaleString()}`}
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      {tier.isFree && 'Waived (under 20 resources)'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Resources:</span>
                      <span className="text-white font-semibold">{tier.resources}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Complexity:</span>
                      <span className="text-white font-semibold">{tier.complexity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Multiplier:</span>
                      <span className="text-white font-semibold">{tier.multiplier}×</span>
                    </div>
                  </div>

                  {!tier.isFree && (
                    <div className="mb-6 p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Calculation:</div>
                      <div className="text-sm text-[rgb(102,255,228)] font-mono">
                        ${tier.price === 5000 ? '5,300' : tier.price.toLocaleString()}
                        {tier.price === 5000 && (
                          <div className="text-xs text-gray-400 mt-1">Capped at maximum</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-2">Examples:</div>
                    <ul className="space-y-1">
                      {tier.examples.map((example) => (
                        <li key={example} className="text-sm text-gray-300">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-[rgb(102,255,228)] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Premium Add-ons
              </h2>
              <p className="text-xl text-gray-300">
                Enhance Your Documentation
              </p>
              <p className="text-lg text-gray-400 mt-2">
                Optional features to supercharge your docs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumAddons.map((addon) => (
                <Card
                  key={addon.id}
                  className="p-6 bg-gray-800/50 border border-gray-700 hover:border-[rgb(102,255,228)] transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <addon.icon className="w-10 h-10 text-[rgb(102,255,228)] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{addon.name}</h3>
                      <div className="text-2xl font-bold text-[rgb(102,255,228)]">
                        +${addon.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{addon.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ROI Comparison
              </h2>
              <p className="text-xl text-gray-300">
                Save 70% vs Manual Research
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 bg-red-900/20 border border-red-500/30">
                <h3 className="text-2xl font-bold text-white mb-6">Manual DevRel Research</h3>
                <div className="text-4xl font-bold text-red-400 mb-6">
                  $8,000-$15,000
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-300">
                    <ClockIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Technical writer: $75-125/hour</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <ClockIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>40-80 hours manual research</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <ClockIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>3-4 weeks timeline</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <ClockIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>One-time snapshot only</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 bg-[rgb(102,255,228)]/10 border border-[rgb(102,255,228)]/30">
                <h3 className="text-2xl font-bold text-white mb-6">Viberdoc Automated</h3>
                <div className="text-4xl font-bold text-[rgb(102,255,228)] mb-6">
                  $500-$5,000
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-[rgb(102,255,228)] flex-shrink-0 mt-0.5" />
                    <span>Fully automated AI research</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-[rgb(102,255,228)] flex-shrink-0 mt-0.5" />
                    <span>Analyzes 100+ sources instantly</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-[rgb(102,255,228)] flex-shrink-0 mt-0.5" />
                    <span>24-48 hour delivery</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-[rgb(102,255,228)] flex-shrink-0 mt-0.5" />
                    <span>Can refresh quarterly</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-[rgb(102,255,228)]/30">
                  <div className="text-2xl font-bold text-[rgb(102,255,228)]">
                    Save $5,000-$10,000 (70% cost reduction)
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="text-center">
            <div className="bg-gradient-to-r from-[rgb(102,255,228)]/10 to-[rgb(72,225,198)]/10 border border-[rgb(102,255,228)]/30 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to See Your Quote?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Paste your URL and get an instant, no-commitment quote in seconds
              </p>
              <div className="max-w-2xl mx-auto flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter your product URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetQuote()}
                  className="h-14 text-lg bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[rgb(102,255,228)]"
                />
                <Button
                  onClick={handleGetQuote}
                  className="h-14 px-8 bg-[rgb(102,255,228)] text-gray-900 hover:bg-[rgb(72,225,198)] font-bold text-lg"
                >
                  Get Your Instant Quote
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                No credit card required • Free analysis • Instant results
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
