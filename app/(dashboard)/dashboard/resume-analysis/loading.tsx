// Streaming skeleton shown while ResumeAnalysisPage server component fetches data

export default function ResumeAnalysisLoading() {
  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto animate-pulse">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="h-12 bg-muted rounded-lg w-72" />
            <div className="h-5 bg-muted rounded w-96" />
          </div>
          <div className="h-11 bg-muted rounded-lg w-36" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left 7/12 */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Resume Overview */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
              <div className="h-6 bg-muted rounded w-40 mb-4" />
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-muted">
                <div className="w-12 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-48" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            </div>

            {/* Strength Insights */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
              <div className="h-7 bg-muted rounded w-48 mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted rounded-lg" />
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right 5/12 */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* ATS gauge */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic flex flex-col items-center gap-6">
              <div className="h-4 bg-muted rounded w-36" />
              <div className="w-48 h-48 rounded-full bg-muted" />
              <div className="h-4 bg-muted rounded w-48" />
            </div>

            {/* Skills */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
              <div className="h-4 bg-muted rounded w-32 mb-6" />
              <div className="flex flex-wrap gap-2">
                {[80, 64, 96, 72, 56, 88, 60].map((w) => (
                  <div key={w} className="h-7 bg-muted rounded-full" style={{ width: w }} />
                ))}
              </div>
            </div>

            {/* Missing keywords */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-aesthetic">
              <div className="h-4 bg-muted rounded w-36 mb-6" />
              <div className="flex flex-wrap gap-2">
                {[72, 96, 60, 80].map((w) => (
                  <div key={w} className="h-7 bg-muted rounded-full" style={{ width: w }} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
