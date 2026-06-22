// Streaming skeleton shown while DashboardPage server component fetches data

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-8 md:p-10 overflow-y-auto animate-pulse">
      <div className="max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-10">
          <div className="h-9 bg-muted rounded-lg w-72 mb-3" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* ATS Score card */}
          <div className="bg-card p-6 rounded border border-border shadow-aesthetic flex flex-col items-center justify-center gap-4">
            <div className="h-5 bg-muted rounded w-36 mb-2" />
            <div className="w-32 h-32 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>

          {/* Interview Progress card */}
          <div className="bg-card p-6 rounded border border-border shadow-aesthetic lg:col-span-2">
            <div className="h-5 bg-muted rounded w-56 mb-6" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-muted rounded w-36" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lists row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[0, 1].map((col) => (
            <div key={col} className="bg-card p-6 rounded border border-border shadow-aesthetic">
              <div className="flex justify-between items-center mb-6">
                <div className="h-5 bg-muted rounded w-44" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
              <div className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1.5">
                      <div className="h-4 bg-muted rounded w-48" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                    <div className="h-6 bg-muted rounded-full w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
