export default function ProductCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-cappuccino/25 bg-cream-light">
      <div
        className="w-full animate-shimmer bg-gradient-to-r from-cappuccino/30 via-cream to-cappuccino/30 bg-[length:400px_100%]"
        style={{ aspectRatio: '4/5' }}
      />

      <div className="space-y-3 p-4">
        <div className="h-2 w-24 animate-shimmer rounded bg-gradient-to-r from-cappuccino/40 via-cream to-cappuccino/40 bg-[length:400px_100%]" />
        <div className="h-3 w-full animate-shimmer rounded bg-gradient-to-r from-cappuccino/30 via-cream to-cappuccino/30 bg-[length:400px_100%]" />
        <div className="h-3 w-3/4 animate-shimmer rounded bg-gradient-to-r from-cappuccino/30 via-cream to-cappuccino/30 bg-[length:400px_100%]" />
        <div className="h-3 w-1/3 animate-shimmer rounded bg-gradient-to-r from-cappuccino/40 via-cream to-cappuccino/40 bg-[length:400px_100%]" />
      </div>
    </div>
  )
}
