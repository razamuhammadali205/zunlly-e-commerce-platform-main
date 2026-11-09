export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722]">
      <div className="animate-pulse">
        
        {/* Top Header Skeleton */}
        <section className="px-5 pt-12 pb-8 md:px-8 lg:px-12 max-w-7xl mx-auto border-b border-[#e6e1d9]">
          <div className="h-3 w-24 rounded bg-[#e8ded2]" />
          
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Heading Skeleton */}
              <div className="h-16 w-64 md:w-96 rounded bg-[#e8ded2]" />
              {/* Subtitle Skeleton */}
              <div className="mt-4 h-4 w-72 md:w-[450px] rounded bg-[#e8ded2]" />
            </div>
            {/* Count Skeleton */}
            <div className="h-4 w-24 rounded bg-[#e8ded2]" />
          </div>
        </section>

        {/* Filter & Sort Bar Skeleton */}
        <section className="px-5 py-6 md:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto">
            <div className="h-4 w-12 rounded bg-[#e8ded2] mr-2" />
            <div className="h-8 w-16 rounded bg-[#e8ded2]" />
            <div className="h-8 w-20 rounded bg-[#e8ded2]" />
            <div className="h-8 w-24 rounded bg-[#e8ded2]" />
            <div className="h-8 w-16 rounded bg-[#e8ded2]" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="h-4 w-12 rounded bg-[#e8ded2] mr-2" />
            <div className="h-8 w-24 rounded bg-[#e8ded2]" />
            <div className="h-8 w-32 rounded bg-[#e8ded2]" />
          </div>
        </section>

        {/* Product Grid Skeleton */}
        <section className="px-5 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* 8 Skeleton Cards (Taake screen bhari hui lage) */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="flex flex-col">
                {/* Image Placeholder */}
                <div className="aspect-[4/5] w-full rounded-sm bg-[#e8ded2] mb-4" />
                
                {/* Title Placeholder */}
                <div className="h-6 w-3/4 rounded bg-[#e8ded2]" />
                
                {/* Subtitle / Notes Placeholder */}
                <div className="mt-2 h-3 w-1/2 rounded bg-[#e8ded2]" />
                
                {/* Price & Badge Placeholder */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 w-20 rounded bg-[#e8ded2]" />
                  <div className="h-5 w-24 rounded bg-[#e8ded2]" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}