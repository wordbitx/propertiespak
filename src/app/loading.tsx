export default function Loading() {
  return (
    <div className="min-h-[70vh] bg-white">
      <div className="bg-navy-950 pt-32 pb-24 lg:pt-40 lg:pb-28">
        <div className="ui-container">
          <div className="h-3 w-40 rounded-full bg-white/15" />
          <div className="mt-6 h-10 w-full max-w-xl rounded-lg bg-white/12" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-lg rounded-full bg-white/10" />
        </div>
      </div>
      <div className="ui-container -mt-16">
        <div className="h-40 rounded-panel border border-soft bg-white shadow-panel" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-panel border border-soft bg-white">
              <div className="aspect-[4/3] animate-pulse bg-soft" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-32 animate-pulse rounded-full bg-soft" />
                <div className="h-4 w-full animate-pulse rounded-full bg-soft" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-soft" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading content
      </span>
    </div>
  );
}
