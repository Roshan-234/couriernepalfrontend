'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTruck, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';

export default function TrackingInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId) {
      router.push(`/tracking?id=${trackingId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaTruck className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter your tracking number"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <Button type="submit" className="flex items-center justify-center gap-2">
          <FaSearch />
          Track Package
        </Button>
      </form>
    </motion.div>
  );
}
