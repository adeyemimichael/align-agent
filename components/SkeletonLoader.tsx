'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({ 
  variant = 'rect', 
  width = 'w-full', 
  height = 'h-4',
  className = ''
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-shimmer bg-gray-200';
  
  const variantClasses = {
    text: 'rounded h-4',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    card: 'rounded-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circle" width="w-12" height="h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="w-3/4" height="h-5" />
          <SkeletonLoader variant="text" width="w-1/2" height="h-4" />
        </div>
      </div>
      <SkeletonLoader variant="rect" width="w-full" height="h-20" />
      <div className="flex gap-2">
        <SkeletonLoader variant="rect" width="w-20" height="h-8" />
        <SkeletonLoader variant="rect" width="w-20" height="h-8" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
