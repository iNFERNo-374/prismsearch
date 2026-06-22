import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: slow-spin 8s linear infinite;
        }
      `}</style>

      <main className="bg-background text-foreground antialiased">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Text column */}
              <div>
                <h1 className="text-4xl md:text-6xl font-serif leading-tight mb-6">
                  Understand Your Resume Like a Recruiter Does
                </h1>
                <p className="text-lg text-foreground/80 mb-10 max-w-lg leading-relaxed">
                  Stop guessing why your applications are getting ignored. PrismSearch
                  uses advanced AI to audit your resume for ATS compatibility and skill gaps.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/upload-resume"
                    className="bg-primary text-white px-8 py-4 rounded font-medium hover:shadow-lg transition-all text-center"
                  >
                    Upload Resume
                  </Link>
                  <a
                    href="#features"
                    className="border border-border bg-transparent px-8 py-4 rounded font-medium hover:bg-muted transition-colors text-center"
                  >
                    View Example Analysis
                  </a>
                </div>
              </div>

              {/* Visual column */}
              <div className="relative">
                <div className="bg-card border border-border p-8 rounded-lg shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl">Resume Analysis</h3>
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                      Live Preview
                    </span>
                  </div>

                  {/* ATS Score */}
                  <div className="mb-8 p-6 bg-background rounded border border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-70">Overall ATS Score</p>
                      <p className="text-3xl font-serif mt-1">
                        84<span className="text-lg opacity-50">/100</span>
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin-slow" />
                  </div>

                  {/* Skills + suggestions */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                      Top Detected Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Project Management", "Product Strategy", "Data Analysis"].map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 bg-[#d4c8aa]/30 rounded-full text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <hr className="border-border my-4" />
                    <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                      Improvement Suggestions
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm italic">
                        <span className="text-primary">•</span>
                        &ldquo;Quantify your achievements in the 2021 Project Lead role.&rdquo;
                      </li>
                      <li className="flex items-start gap-2 text-sm italic">
                        <span className="text-primary">•</span>
                        &ldquo;Include more keywords related to &lsquo;Cloud Infrastructure&rsquo;.&rdquo;
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif mb-4">How It Works</h2>
              <div className="w-20 h-px bg-primary mx-auto" />
            </div>
            <div className="grid md:grid-cols-4 gap-8">

              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-lg">Upload Resume</h4>
                <p className="text-sm text-foreground/70 px-4">
                  Simply drag and drop your PDF or Docx file.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-lg">AI Analysis</h4>
                <p className="text-sm text-foreground/70 px-4">
                  Our engine parses your data through hiring lenses.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-lg">Identify Skill Gaps</h4>
                <p className="text-sm text-foreground/70 px-4">
                  See exactly what recruiters are looking for but missing.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto text-primary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <h4 className="font-serif text-lg">Optimize Resume</h4>
                <p className="text-sm text-foreground/70 px-4">
                  Apply tailored fixes to stand out in the pile.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────── */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-serif">Deep Insights for Better Hireability</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* ATS Compatibility */}
              <div className="p-8 bg-card border border-border rounded-lg shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)] flex flex-col justify-between hover:bg-white transition-colors">
                <div>
                  <div className="w-10 h-10 mb-6 bg-[#d4c8aa]/20 flex items-center justify-center rounded text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path clipRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" fillRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif mb-3">ATS Compatibility</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Ensure your resume doesn&apos;t get rejected by automated gatekeepers due to formatting.
                  </p>
                </div>
              </div>

              {/* Skill Detection */}
              <div className="p-8 bg-card border border-border rounded-lg shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)] flex flex-col justify-between hover:bg-white transition-colors">
                <div>
                  <div className="w-10 h-10 mb-6 bg-[#d4c8aa]/20 flex items-center justify-center rounded text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path clipRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" fillRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif mb-3">Skill Detection</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Identify both hard and soft skills extracted from your experience and projects.
                  </p>
                </div>
              </div>

              {/* Keyword Gap */}
              <div className="p-8 bg-card border border-border rounded-lg shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)] flex flex-col justify-between hover:bg-white transition-colors">
                <div>
                  <div className="w-10 h-10 mb-6 bg-[#d4c8aa]/20 flex items-center justify-center rounded text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.447.894L12 10.882V13.5l-2-2V10.882L5.447 6.894A1 1 0 015 6V3z" fillRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif mb-3">Keyword Gap</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Compare your resume against specific job descriptions to find missing terminology.
                  </p>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="p-8 bg-card border border-border rounded-lg shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)] flex flex-col justify-between hover:bg-white transition-colors">
                <div>
                  <div className="w-10 h-10 mb-6 bg-[#d4c8aa]/20 flex items-center justify-center rounded text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM13 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM16.464 16.464a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif mb-3">AI Suggestions</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Actionable, sentence-level feedback to improve impact and readability.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── VISUAL INSIGHTS / DASHBOARD PREVIEW ─────────────────────── */}
        <section className="py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Text */}
              <div>
                <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-snug">
                  Visual Insights for Rapid Improvement
                </h2>
                <p className="text-foreground/80 mb-8 leading-relaxed">
                  Our dashboard isn&apos;t just a list of errors. It&apos;s a comprehensive map of your
                  professional profile. See how you rank against industry benchmarks and get
                  specific, AI-generated rewrites for weak bullets.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Visual heatmaps of keyword density",
                    "Action-verb frequency auditor",
                    "Export ready optimized resumes",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dashboard mock */}
              <div className="relative">
                <div className="bg-background rounded-lg border border-border shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)] overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-white p-4 border-b border-border flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-300" />
                    <div className="w-2 h-2 rounded-full bg-yellow-300" />
                    <div className="w-2 h-2 rounded-full bg-green-300" />
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: "Score", value: "89%" },
                        { label: "Skills", value: "14" },
                        { label: "Gap", value: "Low" },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-4 bg-white rounded border border-border">
                          <p className="text-[10px] uppercase tracking-wider text-foreground/50">{label}</p>
                          <p className="text-xl font-serif text-primary">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                      <div className="pt-4">
                        <div className="p-3 bg-[#d4c8aa]/10 border border-[#d4c8aa]/20 rounded text-xs leading-relaxed italic">
                          &ldquo;Suggestion: Replace &lsquo;Managed team of 5&rsquo; with &lsquo;Directed a
                          cross-functional team of 5, increasing output by 20% over 6 months&rsquo;.&rdquo;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── WHO IS IT FOR ─────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif mb-4">Who Is It For?</h2>
              <p className="text-foreground/60">
                Tailored analysis for every stage of your career.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">

              <div className="text-center">
                <h3 className="font-serif text-xl mb-4">Students</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Translate academic projects and internships into professional language
                  that resonates with corporate recruiters.
                </p>
              </div>

              <div className="text-center">
                <h3 className="font-serif text-xl mb-4">Career Switchers</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Identify transferable skills and reframe your experience to match the
                  expectations of your target industry.
                </p>
              </div>

              <div className="text-center">
                <h3 className="font-serif text-xl mb-4">Professionals</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Fine-tune high-level experience and ensure your executive summary hits
                  the right strategic notes for senior roles.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center bg-card border border-border py-16 px-8 rounded-xl shadow-[0_4px_20px_-2px_rgba(166,124,82,0.1)]">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Improve Your Resume With AI Insight
              </h2>
              <p className="text-foreground/70 mb-10 max-w-lg mx-auto">
                Join over 10,000 professionals who used PrismSearch to land interviews
                at top-tier companies.
              </p>
              <Link
                href="/upload-resume"
                className="inline-block bg-primary text-white px-10 py-4 rounded font-medium hover:scale-105 transition-transform"
              >
                Analyze My Resume
              </Link>
              <p className="mt-4 text-xs text-foreground/50 italic">
                No credit card required for your first analysis.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer id="team" className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <span className="text-xl font-serif font-bold text-primary">PrismSearch</span>
                <p className="mt-4 text-xs text-foreground/60 leading-relaxed">
                  Elevating professional stories through data-driven resume insights
                  and ethical AI.
                </p>
              </div>

              {/* Product */}
              <div>
                <h5 className="font-medium text-sm mb-4">Product</h5>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                  <li><Link href="/upload-resume" className="hover:text-primary transition-colors">Analysis Tool</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h5 className="font-medium text-sm mb-4">Resources</h5>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h5 className="font-medium text-sm mb-4">Contact</h5>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-foreground/50">
                © 2024 PrismSearch AI. All rights reserved.
              </p>
              <div className="flex gap-4">
                <div className="w-4 h-4 bg-foreground/20 rounded-full" />
                <div className="w-4 h-4 bg-foreground/20 rounded-full" />
                <div className="w-4 h-4 bg-foreground/20 rounded-full" />
              </div>
            </div>

          </div>
        </footer>

      </main>
    </>
  );
}
