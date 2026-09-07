'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Edit3
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

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLocationId = searchParams.get('locationId') || '';

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [topic, setTopic] = useState('');
  const [postType, setPostType] = useState('Update');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [cta, setCta] = useState('Learn More');
  const [generatedContent, setGeneratedContent] = useState('');

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiFetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations || [];
        setLocations(locs);
        if (!selectedLocationId && locs.length > 0) {
          setSelectedLocationId(locs[0]._id);
        }
      })
      .catch((err) => {
        console.error('Error fetching locations:', err);
        setError('Failed to load business locations.');
      })
      .finally(() => setLoadingLocations(false));
  }, [selectedLocationId]);

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

      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      setGeneratedContent(data.content || '');
      setSuccess('AI Content generated successfully! You can now edit it or preview below.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating post with AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePost = async (status: 'draft' | 'published') => {
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
    if (!generatedContent.trim()) {
      setError('Post content cannot be empty. Click "Generate with AI" or enter content manually.');
      return;
    }

    if (status === 'draft') setSaving(true);
    else setPublishing(true);

    try {
      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          locationId: selectedLocationId,
          topic: topic.trim(),
          postType,
          tone,
          language,
          cta,
          content: generatedContent.trim(),
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${status === 'draft' ? 'save draft' : 'publish post'}`);
      }

      setSuccess(
        status === 'published'
          ? 'Post marked as published successfully! Redirecting...'
          : 'Post saved as draft successfully! Redirecting...'
      );

      setTimeout(() => {
        router.push('/posts');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Create GBP Post
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Follow the step-by-step flow to configure details, generate AI copy, preview, and publish your post.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              Post Details Configuration
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                Select Business Location <span className="text-red-500">*</span>
              </label>
              {loadingLocations ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading locations...
                </div>
              ) : locations.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                  No mock locations found. Please run seed script in backend.
                </div>
              ) : (
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
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                Post Topic / Main Focus <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Weekend special offer on specialty coffees with 20% discount"
                rows={3}
                required
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
                  <Smile className="w-3.5 h-3.5 text-blue-600" /> Tone of Voice
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

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generating}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating with OpenRouter AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                Generated Content & Editor
              </h2>
              {generatedContent && (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Post Text (Editable)
              </label>
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                placeholder="AI-generated post content will appear here. You can also type or edit text directly."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <Eye className="w-5 h-5 text-blue-600" />
              Live GBP Post Preview
            </h2>

            <PostPreviewCard
              businessName={selectedLocation?.businessName || 'Selected Location'}
              category={selectedLocation?.category || 'Category'}
              address={selectedLocation?.address || 'Address'}
              city={selectedLocation?.city || 'City'}
              postType={postType}
              tone={tone}
              language={language}
              cta={cta}
              content={generatedContent || 'Your live post preview will be rendered here as you fill out the details and generate AI copy.'}
              status="draft"
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                disabled={saving || publishing}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSavePost('published')}
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

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 text-sm">Loading Post Creator...</div>}>
      <CreatePostForm />
    </Suspense>
  );
}
