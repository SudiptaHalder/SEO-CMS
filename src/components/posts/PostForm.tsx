'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Calendar,
  FolderTree,
  Tags,
  Image as ImageIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

import RichTextEditor from '@/components/editor/RichTextEditor';
import SEOScoreCard from '@/components/seo/SEOScoreCard';
import GoogleSnippet from '@/components/seo/GoogleSnippet';
import AIAssistant from '@/components/seo/AIAssistant';
import PreviewModal from '@/components/posts/PreviewModal';
import FeaturedImageUpload from '@/components/posts/FeaturedImageUpload';
import { SEOAnalyzer, SEOAnalysisResult } from '@/lib/seo/analyzer';
import { createPost } from '@/actions/posts/createPost';
import { updatePost } from '@/actions/posts/updatePost';

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(200, 'Excerpt too long').optional(),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  focusKeyword: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  scheduledFor: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface Category {
  id: string;
  name: string;
}

interface PostFormProps {
  initialData?: PostFormData;
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [seoResult, setSeoResult] = useState<SEOAnalysisResult | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showSEOPanel, setShowSEOPanel] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const analyzer = new SEOAnalyzer();

  // Check session
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      status: 'DRAFT',
      featuredImage: '',
    },
  });

  const title = watch('title');
  const content = watch('content');
  const metaTitle = watch('metaTitle');
  const metaDescription = watch('metaDescription');
  const focusKeyword = watch('focusKeyword');
  const slug = watch('slug');
  const excerpt = watch('excerpt');
  const featuredImage = watch('featuredImage');
  const postId = watch('id');
  const postStatus = watch('status');

  // Log featured image changes for debugging
  useEffect(() => {
    console.log('Featured image changed:', featuredImage);
  }, [featuredImage]);

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (!initialData && title && !isDirty) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, isDirty, initialData]);

  // SEO Analysis with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content || title || metaDescription || focusKeyword) {
        const result = await analyzer.analyze(
          content || '',
          metaTitle || title || '',
          metaDescription || '',
          focusKeyword || '',
          slug || ''
        );
        setSeoResult(result);
        setWordCount(result.wordCount);
        setReadingTime(result.readingTime);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, title, metaTitle, metaDescription, focusKeyword, slug, analyzer]);

  // Auto-save for existing posts
  useEffect(() => {
    if (!isDirty || !postId) return;

    const timer = setTimeout(async () => {
      setSaveState('saving');
      try {
        const formData = new FormData();
        const values = getValues();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
          }
        });

        const result = await updatePost(formData);
        
        if (result?.success) {
          setSaveState('saved');
          setTimeout(() => setSaveState('idle'), 2000);
        } else {
          setSaveState('error');
        }
      } catch (error) {
        setSaveState('error');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, metaTitle, metaDescription, focusKeyword, slug, isDirty, postId, getValues]);

  const onSubmit = async (data: PostFormData) => {
    console.log('📤 Form submitted:', data);
    
    if (status !== 'authenticated') {
      setSubmitError('You must be logged in to create a post');
      return;
    }

    setSaving(true);
    setSubmitError(null);
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Log form data for debugging
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      let result;
      if (postId) {
        result = await updatePost(formData);
      } else {
        result = await createPost(formData);
      }
      
      if (result?.error) {
        setSubmitError(result.error);
      } else if (result?.success) {
        router.push('/dashboard/posts');
        router.refresh();
      }
    } catch (error) {
      console.error('💥 Publish failed:', error);
      setSubmitError('Failed to publish post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setValue('status', 'PUBLISHED');
    handleSubmit(onSubmit)();
  };

  const handleSaveDraft = () => {
    setValue('status', 'DRAFT');
    handleSubmit(onSubmit)();
  };

  const getSaveStateIcon = () => {
    switch (saveState) {
      case 'saving':
        return <Clock className="w-3.5 h-3.5 text-gray-400 animate-spin" />;
      case 'saved':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      default:
        return null;
    }
  };

const handlePreview = () => {
  // Get the latest form values
  const currentValues = getValues();
  setPreviewOpen(true);
};

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden ID field */}
        {postId && <input type="hidden" {...register('id')} />}
        <input type="hidden" {...register('status')} />

        {/* Top Action Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 -mx-4 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                placeholder="Post title..."
                {...register('title')}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full max-w-lg placeholder:text-gray-300"
              />
              
              <span className={`px-2 py-1 text-xs rounded-full border ${
                postStatus === 'PUBLISHED' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {postStatus || 'DRAFT'}
              </span>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                {getSaveStateIcon()}
                {saveState === 'saving' && <span>Saving...</span>}
                {saveState === 'saved' && <span>Saved</span>}
                {saveState === 'error' && <span className="text-red-600">Save failed</span>}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreview}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Publishing...' : (postStatus === 'PUBLISHED' ? 'Update' : 'Publish')}
              </button>
            </div>
          </div>

          {/* Error messages */}
          {(Object.keys(errors).length > 0 || submitError) && (
            <div className="mt-2 p-2 bg-red-50 rounded-lg">
              {submitError && <p className="text-xs text-red-600">{submitError}</p>}
              {Object.entries(errors).map(([key, error]) => (
                <p key={key} className="text-xs text-red-600">
                  {error?.message as string}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rich Text Editor */}
            <RichTextEditor
              content={content}
              onChange={(html) => setValue('content', html)}
              onWordCountChange={setWordCount}
            />

            {/* Post Organization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Post Organization</h3>
              
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <FolderTree className="w-3.5 h-3.5 inline mr-1" />
                    Category
                  </label>
                  <select 
                    {...register('categoryId')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select a category</option>
                    {loadingCategories ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Tags className="w-3.5 h-3.5 inline mr-1" />
                    Tags
                  </label>
                  <input
                    type="text"
                    {...register('tags')}
                    placeholder="Enter tags separated by commas"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas (e.g., seo, marketing, content)
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    {...register('excerpt')}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Brief summary of your post (optional)"
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                    Featured Image
                  </label>
                  <FeaturedImageUpload
                    value={featuredImage}
                    onChange={(url) => {
                      console.log('Setting featured image:', url);
                      setValue('featuredImage', url, { shouldDirty: true });
                    }}
                  />
                  {featuredImage && (
                    <p className="text-xs text-emerald-600 mt-1 break-all">
                      ✓ Image selected: {featuredImage}
                    </p>
                  )}
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Schedule Publish
                  </label>
                  <input
                    type="datetime-local"
                    {...register('scheduledFor')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - SEO Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Mobile Toggle */}
              <button
                onClick={() => setShowSEOPanel(!showSEOPanel)}
                className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
              >
                <span className="text-sm font-medium">SEO Intelligence</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSEOPanel ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {(showSEOPanel || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* SEO Score Card */}
                    {seoResult && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <SEOScoreCard
                          score={seoResult.score}
                          checks={seoResult.checks}
                          wordCount={wordCount}
                          readingTime={readingTime}
                        />
                      </div>
                    )}

                    {/* Google Snippet Preview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <GoogleSnippet
                        title={metaTitle || title}
                        metaDescription={metaDescription || ''}
                        slug={slug}
                      />
                    </div>

                    {/* SEO Meta Fields */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">SEO Meta</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Meta Title
                          </label>
                          <input
                            type="text"
                            {...register('metaTitle')}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="SEO title (optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Meta Description
                          </label>
                          <textarea
                            {...register('metaDescription')}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="SEO description (optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Focus Keyword
                          </label>
                          <input
                            type="text"
                            {...register('focusKeyword')}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Main keyword for this post"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            URL Slug
                          </label>
                          <input
                            type="text"
                            {...register('slug')}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="post-url-slug"
                          />
                        </div>
                      </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <AIAssistant
                        content={content}
                        keyword={focusKeyword || ''}
                        onGenerateMetaDescription={(desc) => setValue('metaDescription', desc)}
                        onGenerateTitle={(title) => setValue('metaTitle', title)}
                        onGenerateKeywords={(keywords) => {
                          console.log('Generated keywords:', keywords);
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        post={{
          title,
          content,
          excerpt,
          featuredImage,
          slug,
        }}
      />
    </>
  );
}
