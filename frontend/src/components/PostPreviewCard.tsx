import React from 'react';
import { Store, Tag, Globe2, PhoneCall, ExternalLink, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface PostPreviewCardProps {
  businessName?: string;
  category?: string;
  address?: string;
  city?: string;
  postType?: string;
  tone?: string;
  language?: string;
  cta?: string;
  content?: string;
  status?: 'draft' | 'published';
  publishedAt?: string | Date | null;
}

export default function PostPreviewCard({
  businessName = 'Your Business Name',
  category = 'Local Business',
  address = '123 Main Street',
  city = 'City Name',
  postType = 'Update',
  tone = 'Professional',
  language = 'English',
  cta = 'Learn More',
  content = 'Your generated Google Business Profile post preview will appear here. Enter a topic and click "Generate with AI" to get started.',
  status,
  publishedAt,
}: PostPreviewCardProps) {
  
  const getCtaIcon = (ctaText: string) => {
    switch (ctaText.toLowerCase()) {
      case 'call now':
        return <PhoneCall className="w-4 h-4" />;
      case 'book':
      case 'sign up':
        return <Calendar className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getPostTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'offer':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'event':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'product':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'announcement':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden max-w-lg mx-auto transition-all duration-300">
      {/* GBP Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-inner">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-white text-base leading-tight">
              {businessName}
            </h4>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>{category}</span>
              <span>•</span>
              <span>{city}</span>
            </p>
          </div>
        </div>

        {status && (
          <div className="flex items-center gap-1.5">
            {status === 'published' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                Draft
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta Tags Bar */}
      <div className="bg-slate-50 dark:bg-gray-800/50 px-5 py-2.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getPostTypeBadgeColor(postType)}`}>
            {postType}
          </span>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Tone: {tone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <Globe2 className="w-3.5 h-3.5" />
          <span>{language}</span>
        </div>
      </div>

      {/* Post Body Content */}
      <div className="p-5 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line min-h-[120px]">
        {content}
      </div>

      {/* CTA Button & Business Address Footer */}
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <button
          type="button"
          disabled
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 uppercase tracking-wide cursor-default"
        >
          {getCtaIcon(cta)}
          <span>{cta}</span>
        </button>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
          <span className="truncate max-w-[260px]">{address}, {city}</span>
          {publishedAt && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Published on {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
