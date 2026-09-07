'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Store, Plus, Building2, RefreshCw } from 'lucide-react';
import AlertBanner from '@/components/AlertBanner';
import { apiFetch } from '@/lib/api';

interface LocationItem {
  _id: string;
  businessName: string;
  address: string;
  category: string;
  city: string;
  createdAt: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/locations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load locations');
      setLocations(data.locations || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Business Locations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a mock Google Business Profile location to create and publish posts.
          </p>
        </div>

        <button
          onClick={fetchLocations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Locations</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse space-y-4"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-full"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full pt-4"></div>
            </div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No locations found in database
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
            Run <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-blue-600">npm run seed</code> inside the backend directory to seed default mock Google Business Profile locations.
          </p>
          <button
            onClick={fetchLocations}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Database</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {loc.category}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Mock Location</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {loc.businessName}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {loc.city}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{loc.address}, {loc.city}</span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href={`/posts/create?locationId=${loc._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-blue-600 shadow-sm transition-all duration-200"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Post</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
