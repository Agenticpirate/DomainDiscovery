
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/layout/Navigation';
import { Button } from './components/ui/Button';
import { DomainCard } from './components/domain/DomainCard';
import { Icons, TLDS } from './constants';
import { DomainResult, ToolType, AppraisalResult } from './types';
import { checkDomainAvailability } from './lib/utils';
import { getDomainSuggestions, appraiseDomain } from './services/geminiService';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appraisal, setAppraisal] = useState<AppraisalResult | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const domainToSearch = searchQuery.includes('.') ? searchQuery : `${searchQuery}.com`;
    const result = await checkDomainAvailability(domainToSearch);
    const otherResults = [];
    if (!searchQuery.includes('.')) {
      for (const tld of TLDS.slice(0, 5)) {
        otherResults.push(await checkDomainAvailability(`${searchQuery}${tld}`));
      }
    }
    setResults([result, ...otherResults]);
    setIsLoading(false);
    window.scrollTo({ top: (document.getElementById('dashboard-view')?.offsetTop || 800) - 100, behavior: 'smooth' });
  };

  const handleBulkSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const domains = searchQuery
      .split(/[\n,]/)
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    const bulkResults = await Promise.all(
      domains.map(async (d) => {
        const domainToSearch = d.includes('.') ? d : `${d}.com`;
        return checkDomainAvailability(domainToSearch);
      })
    );
    
    setResults(bulkResults);
    setIsLoading(false);
    window.scrollTo({ top: (document.getElementById('dashboard-view')?.offsetTop || 800) - 100, behavior: 'smooth' });
  };

  const handleAppraisal = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const res = await appraiseDomain(searchQuery);
    setAppraisal(res);
    setIsLoading(false);
    window.scrollTo({ top: (document.getElementById('dashboard-view')?.offsetTop || 800) - 100, behavior: 'smooth' });
  };

  useEffect(() => {
    setResults([]);
    setAppraisal(null);
    setSearchQuery('');
  }, [activeTool]);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <Navigation activeTool={activeTool} onToolSelect={setActiveTool} />

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            AI Powered Domain Intelligence
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8 crypto-gradient">
            {activeTool === 'bulk' ? 'Bulk Analysis Engine' : 'Find, Appraise, and Manage Your Domains'}
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            {activeTool === 'bulk' 
              ? 'Analyze hundreds of domains simultaneously with institutional-grade precision and real-time availability checking.'
              : 'Discover premium digital assets, analyze market trends, and make informed investment decisions with the world\'s most advanced AI domain engine.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => document.getElementById('dashboard-view')?.scrollIntoView({ behavior: 'smooth' })}>
              {activeTool === 'bulk' ? 'Start Bulk Check' : 'Get Started Now'} <span className="ml-2">→</span>
            </Button>
            <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">▶</div>
              See How it Works
            </button>
          </div>
        </div>
      </section>

      {/* Main Interactive View (The "Dashboard") */}
      <section id="dashboard-view" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-4 md:p-8 glow-soft border-white/5 bg-white/[0.02]">
            {/* Inner "Dashboard" Header */}
            <div className={`flex flex-col ${activeTool === 'bulk' ? 'items-stretch' : 'md:flex-row items-center'} gap-4 mb-8`}>
              <div className="relative flex-grow w-full">
                {activeTool === 'bulk' ? (
                  <div className="relative">
                    <textarea 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter domains or keywords (one per line or comma separated)..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:border-white/30 transition-all font-mono min-h-[200px] resize-y"
                    />
                    <div className="absolute right-4 bottom-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      Bulk Input Mode
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                      <Icons.Search />
                    </div>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (activeTool === 'appraisal' ? handleAppraisal() : handleSearch())}
                      placeholder="Enter domain or keyword..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-xl focus:outline-none focus:border-white/30 transition-all font-mono"
                    />
                  </>
                )}
              </div>
              <Button 
                size="lg" 
                className={`py-5 px-10 w-full md:w-auto ${activeTool === 'bulk' ? 'mt-4' : ''}`} 
                onClick={activeTool === 'bulk' ? handleBulkSearch : (activeTool === 'appraisal' ? handleAppraisal : handleSearch)} 
                isLoading={isLoading}
              >
                {activeTool === 'bulk' ? 'Execute Bulk Analysis' : 'Execute Analysis'}
              </Button>
            </div>

            {/* Results Grid / Table */}
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl"></div>)}
                </div>
              </div>
            ) : appraisal ? (
              <div className="glass-card p-10 bg-white/[0.01]">
                <div className="flex flex-col md:flex-row justify-between mb-10">
                  <div>
                    <h2 className="text-4xl font-black font-mono tracking-tighter mb-2">{appraisal.domain}</h2>
                    <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Comprehensive AI Appraisal</p>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Estimated Value</p>
                    <p className="text-5xl font-black text-white">{appraisal.estimatedValue}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Reasoning</h4>
                    <p className="text-white/80 leading-relaxed">{appraisal.reasoning}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Market Potential</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-white rounded-full ${appraisal.marketPotential === 'High' ? 'w-full' : appraisal.marketPotential === 'Medium' ? 'w-2/3' : 'w-1/3'}`}></div>
                      </div>
                      <span className="font-bold text-sm">{appraisal.marketPotential}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              activeTool === 'bulk' ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-white/5">
                        <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 px-4">Domain Name</th>
                        <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 px-4">Extension</th>
                        <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 px-4">Status</th>
                        <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 px-4 text-right">Est. Price</th>
                        <th className="pb-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results.map((res, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-5 px-4 font-mono font-bold text-sm">{res.domain}</td>
                          <td className="py-5 px-4 text-white/40 text-xs uppercase font-bold tracking-widest">{res.tld}</td>
                          <td className="py-5 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              res.available 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border border-white/5'
                            }`}>
                              {res.available ? 'Available' : 'Taken'}
                            </span>
                          </td>
                          <td className="py-5 px-4 text-right font-bold text-sm">{res.available ? res.price : '—'}</td>
                          <td className="py-5 px-4 text-right">
                            <Button variant={res.available ? "primary" : "secondary"} size="sm">
                              {res.available ? 'Buy' : 'WHOIS'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.map((res, i) => <DomainCard key={i} result={res} />)}
                </div>
              )
            ) : (
              <div className="py-32 text-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                <div className="mb-4 inline-block p-6 rounded-full bg-white/5">
                  {activeTool === 'bulk' ? <Icons.Layers /> : <Icons.Magic />}
                </div>
                <p className="text-lg font-bold">Ready for Execution</p>
                <p className="text-sm">
                  {activeTool === 'bulk' 
                    ? 'Paste your domain list to begin the bulk verification sequence.' 
                    : 'Input a domain and press enter to start analysis.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 mb-6 uppercase tracking-widest">
              Key Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Built for Modern Domain Traders</h2>
            <p className="text-white/40 max-w-xl mx-auto">Precision tools designed to manage the requirements of serious investors and startups.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Icons.Search />, title: "Lightning-fast processing", desc: "Instant results with zero lag time." },
              { icon: <Icons.Magic />, title: "Initiative interface", desc: "Seamless, user-friendly experience." },
              { icon: <Icons.Info />, title: "Institutional-grade security", desc: "Military-grade data protection." },
              { icon: <Icons.Magic />, title: "Smart, Adaptive Intelligence", desc: "Intelligent automation that adapts." }
            ].map((feat, i) => (
              <div key={i} className="group">
                <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold mb-2">{feat.title}</h4>
                <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 mb-6 uppercase tracking-widest">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Flexible Pricing for Every Team</h2>
          <p className="text-white/40">Choose the plan that fits your workflow and scale at your own pace.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Starter Plan", price: "$10", features: ["Real-time charts & tracking", "Basic portfolio dashboard", "Wallet connection", "Price alerts"] },
            { name: "Pro Plan", price: "$20", features: ["Advanced market analytics", "Smart AI alerts & signals", "Multiple wallet support", "Trade execution insights"], recommended: true },
            { name: "Elite Plan", price: "$49", features: ["AI-powered trading insights", "On-chain analytics & whale tracking", "Multi-exchange dashboard", "Advanced risk analysis"] }
          ].map((plan, i) => (
            <div key={i} className={`glass-card p-10 flex flex-col ${plan.recommended ? 'border-white/20 bg-white/[0.03] scale-105' : 'border-white/5'}`}>
              <div className="mb-8">
                <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-sm">per month</span>
                </div>
              </div>
              <Button variant={plan.recommended ? "primary" : "secondary"} className="mb-8">Start with {plan.name.split(' ')[0]}</Button>
              <div className="space-y-4 text-left">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-3 text-sm text-white/60">
                    <Icons.Check />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 mb-6 uppercase tracking-widest">FAQs</div>
          <h2 className="text-4xl font-extrabold tracking-tighter">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            "How is CryptoDomains different from regular tools?",
            "Is my data and wallet information safe?",
            "Which domains and extensions can I connect?",
            "Can I upgrade or downgrade anytime?"
          ].map((q, i) => (
            <div key={i} className="accordion-item py-6 flex items-center justify-between cursor-pointer group hover:border-white/20">
              <span className="text-lg font-bold group-hover:text-white transition-colors">{q}</span>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white/20">↓</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto glass-card p-16 text-center border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Bright your Crypto Future Now!</h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">Start your journey with CryptoDomains today and experience the future of digital asset management.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg">Get Started Free</Button>
            <Button variant="secondary" size="lg">Book Demo <Icons.ArrowRight /></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-lg">C</div>
                <span className="text-2xl font-black tracking-tighter">CryptoDomains</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">The ultimate AI-powered domain intelligence platform for modern investors and startups.</p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Product</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                <li className="hover:text-white cursor-pointer transition-colors">Integrations</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Company</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/60">Legal</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security</li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-white/20 uppercase tracking-widest">
            <p>© 2025 CryptoDomains. All Rights Reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Conditions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
