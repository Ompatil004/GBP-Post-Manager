'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  FileClock, 
  Edit, 
  Trash2, 
  Send, 
  Loader2,
  Filter
} from 'lucide-react';
import AlertBanner from '@/components/AlertBanner';
import { apiFetch } from '@/lib/api';

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

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/posts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
      setPosts(data.posts || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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
      await fetchPosts();
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
      await fetchPosts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'draft') return post.status === 'draft';
    if (activeFilter === 'published') return post.status === 'published';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Manage GBP Posts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View, edit, filter, draft, and mark your Google Business Profile posts as published.
          </p>
        </div>

        <Link
          href="/posts/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create GBP Post</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All ({posts.length})
        </button>

        <button
          onClick={() => setActiveFilter('draft')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'draft'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Drafts ({posts.filter((p) => p.status === 'draft').length})
        </button>

        <button
          onClick={() => setActiveFilter('published')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'published'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Published ({posts.filter((p) => p.status === 'published').length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading your posts...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            No {activeFilter !== 'all' ? activeFilter : ''} posts found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {activeFilter === 'all'
              ? 'You have not created any GBP posts yet.'
              : `No posts with status "${activeFilter}" were found.`}
          </p>
          <Link
            href="/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create GBP Post</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Post Details</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Metadata</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {post.topic}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {post.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {post.locationId?.businessName || 'N/A'}
                      </p>
                      <p className="text-gray-400">{post.locationId?.city || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {post.postType}
                        </span>
                        <span className="text-gray-400">• {post.tone}</span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        CTA: {post.cta}
                      </p>
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
                      <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                      {post.publishedAt && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Pub: {new Date(post.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(post._id)}
                            disabled={publishingId === post._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-xs font-semibold rounded-lg transition-colors"
                            title="Mark as Published"
                          >
                            {publishingId === post._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Publish</span>
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
        </div>
      )}
    </div>
  );
}
