// Reusable Skeleton Components for loading states

// Base pulse animation wrapper
export const SkeletonBox = ({ className = "" }) => (
  <div className={`animate-pulse bg-zinc-800/60 rounded-2xl ${className}`} />
);

// Light variant for white backgrounds
export const SkeletonBoxLight = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />
);

// Service card skeleton (dark theme)
export const ServiceCardSkeleton = () => (
  <div className="bg-zinc-900/40 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col">
    <SkeletonBox className="h-48 sm:h-56 lg:h-64 rounded-none" />
    <div className="p-6 sm:p-8 flex flex-col gap-3">
      <SkeletonBox className="h-6 w-3/4" />
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-4 w-2/3" />
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-10 w-24" />
      </div>
    </div>
  </div>
);

// Product card skeleton (light theme)
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] p-5 border border-gray-100 flex flex-col">
    <SkeletonBoxLight className="h-48 sm:h-60 rounded-[2rem] mb-6" />
    <div className="flex-1 flex flex-col px-2 gap-3">
      <SkeletonBoxLight className="h-6 w-3/4" />
      <SkeletonBoxLight className="h-4 w-full" />
      <SkeletonBoxLight className="h-4 w-1/2" />
      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between mb-4">
        <SkeletonBoxLight className="h-8 w-20" />
        <SkeletonBoxLight className="h-4 w-24" />
      </div>
      <SkeletonBoxLight className="h-12 w-full rounded-2xl" />
    </div>
  </div>
);

// Booking row skeleton (dark theme)
export const BookingRowSkeleton = () => (
  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
      <SkeletonBox className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonBox className="h-5 w-40" />
        <SkeletonBox className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
      <div className="flex gap-4">
        <SkeletonBox className="h-10 w-20" />
        <SkeletonBox className="h-10 w-20" />
        <SkeletonBox className="h-8 w-20 rounded-xl" />
      </div>
      <SkeletonBox className="h-10 w-10 rounded-2xl" />
    </div>
  </div>
);

// User booking card skeleton (light theme)
export const UserBookingCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-center">
      <SkeletonBoxLight className="w-full md:w-2 h-2 md:h-16 rounded-none" />
      <div className="flex-1 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <SkeletonBoxLight className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <SkeletonBoxLight className="h-5 w-36" />
            <SkeletonBoxLight className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SkeletonBoxLight className="h-8 w-24 rounded-xl hidden sm:block" />
          <SkeletonBoxLight className="h-10 w-10 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

// Dashboard stat card skeleton
export const StatCardSkeleton = () => (
  <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5">
    <SkeletonBox className="h-12 w-12 rounded-2xl mb-6" />
    <SkeletonBox className="h-3 w-28 mb-3" />
    <SkeletonBox className="h-12 w-20" />
  </div>
);

// Dashboard recent booking row skeleton
export const RecentBookingSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5 gap-4">
    <div className="flex items-center gap-4">
      <SkeletonBox className="h-12 w-12 rounded-xl flex-shrink-0" />
      <div className="flex flex-col gap-2">
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-3 w-24" />
      </div>
    </div>
    <div className="flex gap-4">
      <SkeletonBox className="h-8 w-24" />
      <SkeletonBox className="h-8 w-20" />
      <SkeletonBox className="h-8 w-20" />
    </div>
    <SkeletonBox className="h-8 w-20 rounded-full" />
  </div>
);

// Admin service card skeleton
export const AdminServiceCardSkeleton = () => (
  <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
    <SkeletonBox className="h-48 rounded-none" />
    <div className="p-6 flex flex-col gap-3">
      <SkeletonBox className="h-6 w-3/4" />
      <div className="flex justify-between items-center mt-2">
        <SkeletonBox className="h-6 w-16" />
        <SkeletonBox className="h-4 w-20" />
      </div>
    </div>
  </div>
);

// Admin product table row skeleton
export const AdminProductRowSkeleton = () => (
  <tr>
    <td className="py-5 px-8">
      <div className="flex items-center gap-6">
        <div className="animate-pulse bg-zinc-800/60 w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="animate-pulse bg-zinc-800/60 h-5 w-36 rounded-xl" />
          <div className="animate-pulse bg-zinc-800/60 h-3 w-48 rounded-xl" />
        </div>
      </div>
    </td>
    <td className="py-5 px-6">
      <div className="animate-pulse bg-zinc-800/60 h-6 w-16 rounded-xl" />
    </td>
    <td className="py-5 px-8 text-right">
      <div className="flex justify-end gap-2">
        <div className="animate-pulse bg-zinc-800/60 h-12 w-12 rounded-2xl" />
        <div className="animate-pulse bg-zinc-800/60 h-12 w-12 rounded-2xl" />
      </div>
    </td>
  </tr>
);

// Error state component (dark theme)
export const ErrorState = ({ message = "Something went wrong", onRetry, title }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-3xl flex items-center justify-center">
        <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
        <span className="text-white text-[10px] font-black">!</span>
      </div>
    </div>
    <h3 className="text-white font-black text-lg uppercase italic tracking-tight mb-2">
      {title || "Something went wrong"}
    </h3>
    <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Try Again
      </button>
    )}
  </div>
);

// Error state component (light theme)
export const ErrorStateLight = ({ message = "Something went wrong", onRetry, title }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
    <div className="relative mb-6">
      <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center">
        <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white text-[10px] font-black">!</span>
      </div>
    </div>
    <h3 className="text-slate-900 font-black text-lg uppercase italic tracking-tight mb-2">
      {title || "Something went wrong"}
    </h3>
    <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Try Again
      </button>
    )}
  </div>
);
