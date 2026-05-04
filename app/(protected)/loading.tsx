import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px] bg-black/5" />
        <Skeleton className="h-6 w-[350px] bg-black/5" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Skeleton className="h-[120px] rounded-2xl bg-black/5" />
        <Skeleton className="h-[120px] rounded-2xl bg-black/5" />
        <Skeleton className="h-[120px] rounded-2xl bg-black/5" />
        <Skeleton className="h-[120px] rounded-2xl bg-black/5" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-[400px] rounded-2xl bg-black/5" />
      </div>
    </div>
  )
}
