'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Store, 
  MessageSquareText, 
  Tag, 
  Smile, 
  Globe2, 
  MousePointerClick, 
  Loader2, 
  Save, 
  Send, 
  RefreshCw, 
  Eye,
  Edit3,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  FileClock
} from 'lucide-react';
import PostPreviewCard from '@/components/PostPreviewCard';
import AlertBanner from '@/components/AlertBanner';
import { apiFetch } from '@/lib/api';

interface LocationItem {
  _id: string;
  businessName: string;
  address: string;
  category: string;
  city: string;
}

interface PostDetail {
  _id: string;
  topic: string;
  locationId: LocationItem | string;
  postType: string;
  tone: string;
  language: string;
  cta: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string | null;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [post, setPost] = useState<PostDetail | null>(null);

  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [topic, setTopic] = useState('');
  const [postType, setPostType] = useState('Update');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [cta, setCta] = useState('Learn More');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [locsRes, postRes] = await Promise.all([
          apiFetch('/api/locations'),
          apiFetch(`/api/posts/${postId}`),
        ]);

        if (!postRes.ok) {
          const errData = await postRes.json();
          throw new Error(errData.error || 'Post not found or unauthorized');
        }

        const locsData = await locsRes.json();
        const postData = await postRes.json();

        setLocations(locsData.locations || []);
        const loadedPost: PostDetail = postData.post;
        setPost(loadedPost);

        const locId = typeof loadedPost.locationId === 'object' ? loadedPost.locationId._id : loadedPost.locationId;
        setSelectedLocationId(locId);
        setTopic(loadedPost.topic);
        setPostType(loadedPost.postType || 'Update');
        setTone(loadedPost.tone || 'Professional');
        setLanguage(loadedPost.language || 'English');
        setCta(loadedPost.cta || 'Learn More');
        setContent(loadedPost.content || '');
        setStatus(loadedPost.status || 'draft');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load post details');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [postId]);

  const selectedLocation = locations.find((loc) => loc._id === selectedLocationId);

  const handleGenerateAI = async () => {
    setError('');
    setSuccess('');

    if (!selectedLocationId) {
      setError('Please select a business location.');
      return;
    }
    if (!topic.trim()) {
      setError('Please enter a post topic.');
      return;
    }

    setGenerating(true);

    try {
      const res = await apiFetch('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          businessName: selectedLocation?.businessName,
          category: selectedLocation?.category,
          city: selectedLocation?.city,
          topic: topic.trim(),
          postType,
          tone,
          language,
          cta,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      setContent(data.content || '');
      setSuccess('Content regenerated with OpenRouter AI!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating content with AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdatePost = async (targetStatus: 'draft' | 'published') => {
    setError('');
    setSuccess('');

    if (!topic.trim()) {
      setError('Post topic is required.');
      return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    if (targetStatus === 'draft') setSaving(true);
    else setPublishing(true);

    try {
      const res = await apiFetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
          locationId: selectedLocationId,
          topic: topic.trim(),
          postType,
          tone,
          language,
          cta,
          content: content.trim(),
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update post');

      setStatus(targetStatus);
      setSuccess(
        targetStatus === 'published'
          ? 'Post marked as published successfully!'
          : 'Draft updated successfully!'
      );
      setTimeout(() => {
        router.push('/posts');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');

      setSuccess('Post deleted successfully! Redirecting...');
      setTimeout(() => {
        router.push('/posts');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting post');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading post details...</span>
      </div>
    );
  }

  if (!post && error) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <AlertBanner type="error" message={error} />
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Posts</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <Link
            href="/posts"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Posts
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Edit3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Edit GBP Post
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {status === 'published' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Status: Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <FileClock className="w-4 h-4 text-amber-600" />
              Status: Draft
            </span>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800 transition-colors"
            title="Delete Post"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
              Post Specifications
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                Business Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.businessName} — {loc.category} ({loc.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                Post Topic
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Post Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="Update">Update</option>
                  <option value="Offer">Offer</option>
                  <option value="Event">Event</option>
                  <option value="Product">Product</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-blue-600" /> Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Casual">Casual</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Informative">Informative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-600" /> CTA
                </label>
                <select
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="Book">Book</option>
                  <option value="Order">Order</option>
                  <option value="Shop">Shop</option>
                  <option value="Learn More">Learn More</option>
                  <option value="Call Now">Call Now</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Get Offer">Get Offer</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generating}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Regenerating with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Content with AI</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Edit Content
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <Eye className="w-5 h-5 text-blue-600" />
              GBP Post Preview
            </h2>

            <PostPreviewCard
              businessName={selectedLocation?.businessName || 'Location'}
              category={selectedLocation?.category || 'Category'}
              address={selectedLocation?.address || 'Address'}
              city={selectedLocation?.city || 'City'}
              postType={postType}
              tone={tone}
              language={language}
              cta={cta}
              content={content}
              status={status}
              publishedAt={post?.publishedAt}
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleUpdatePost('draft')}
                disabled={saving || publishing}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <span>Update Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdatePost('published')}
                disabled={saving || publishing}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Mark as Published</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
