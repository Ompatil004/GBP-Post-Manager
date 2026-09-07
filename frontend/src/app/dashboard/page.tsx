'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  FileText, 
  FileClock, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Sparkles,
  Loader2,
  Trash2,
  Edit,
  Send
} from 'lucide-react';
import AlertBanner from '@/components/AlertBanner';
import { apiFetch } from '@/lib/api';

interface Stats {
  totalLocations: number;
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
}

interface LocationPopulated {
  _id: string;
  businessName: string;
  category: string;
  city: string;
}

interface PostItem {
  _id: string;
  topic: string;
  locationId: LocationPopulated | null;
  postType: string;
  tone: string;
  language: string;
  cta: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLocations: 0,
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, postsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/posts'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setRecentPosts((postsData.posts || []).slice(0, 5));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handlePublish = async (postId: string) => {
    setPublishingId(postId);
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/api/posts/${postId}/publish`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish post');

      setSuccess('Post marked as published!');
      await loadDashboardData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error publishing post');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');

      setSuccess('Post deleted successfully');
      await loadDashboardData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting post');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Marketing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Google Business Profile Dashboard
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Generate, manage, preview, and mark your GBP posts as published in real-time.
          </p>
        </div>

        <Link
          href="/posts/create"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-900 bg-white hover:bg-blue-50 shadow-lg shadow-white/10 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5] text-blue-600" />
          <span>+ Create GBP Post</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Locations
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {loading ? '...' : stats.totalLocations}
            </span>
            <Link
              href="/locations"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Posts
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {loading ? '...' : stats.totalPosts}
            </span>
            <Link
              href="/posts"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Draft Posts
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileClock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {loading ? '...' : stats.draftPosts}
            </span>
            <span className="text-xs font-medium text-gray-400">In Draft</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Published Posts
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : stats.publishedPosts}
            </span>
            <span className="text-xs font-medium text-gray-400">Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <p className="text-xs text-gray-500">
              Your latest created Google Business Profile posts
            </p>
          </div>
          <Link
            href="/posts"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Posts</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading recent posts...</span>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No posts created yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Create your first AI-assisted Google Business Profile post now.
            </p>
            <Link
              href="/posts/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create GBP Post</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Post Topic</th>
                  <th className="px-6 py-3.5 font-semibold">Location</th>
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Created Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {post.topic}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {post.locationId?.businessName || 'Unknown Location'}{' '}
                      <span className="text-gray-400">({post.locationId?.city || 'N/A'})</span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {post.postType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <FileClock className="w-3.5 h-3.5" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(post._id)}
                            disabled={publishingId === post._id}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Mark as Published"
                          >
                            {publishingId === post._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <Link
                          href={`/posts/${post._id}`}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit / View Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
