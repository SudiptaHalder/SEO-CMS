// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Save,
//   Eye,
//   Send,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   X,
//   ChevronDown,
//   Calendar,
//   User,
//   FolderTree,
//   Tags,
//   Image as ImageIcon,
// } from 'lucide-react';

// import RichTextEditor from '@/components/editor/RichTextEditor';
// import SEOScoreCard from '@/components/seo/SEOScoreCard';
// import GoogleSnippet from '@/components/seo/GoogleSnippet';
// import AIAssistant from '@/components/seo/AIAssistant';
// import { SEOAnalyzer, SEOAnalysisResult } from '@/lib/seo/analyzer';

// const postSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
//   slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
//   content: z.string().min(100, 'Content must be at least 100 characters'),
//   excerpt: z.string().max(200, 'Excerpt too long').optional(),
//   metaTitle: z.string().max(60, 'Meta title too long').optional(),
//   metaDescription: z.string().max(160, 'Meta description too long').optional(),
//   focusKeyword: z.string().optional(),
//   status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
//   categoryId: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   featuredImage: z.string().optional(),
//   scheduledFor: z.string().optional(),
// });

// type PostFormData = z.infer<typeof postSchema>;

// export default function PostForm() {
//   const router = useRouter();
//   const [saving, setSaving] = useState(false);
//   const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
//   const [seoResult, setSeoResult] = useState<SEOAnalysisResult | null>(null);
//   const [wordCount, setWordCount] = useState(0);
//   const [readingTime, setReadingTime] = useState(0);
//   const [showSEOPanel, setShowSEOPanel] = useState(true);

//   const analyzer = new SEOAnalyzer();

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     getValues,
//     formState: { errors, isDirty },
//   } = useForm<PostFormData>({
//     resolver: zodResolver(postSchema),
//     defaultValues: {
//       title: '',
//       slug: '',
//       content: '',
//       metaTitle: '',
//       metaDescription: '',
//       focusKeyword: '',
//       status: 'DRAFT',
//     },
//   });

//   const title = watch('title');
//   const content = watch('content');
//   const metaTitle = watch('metaTitle');
//   const metaDescription = watch('metaDescription');
//   const focusKeyword = watch('focusKeyword');
//   const slug = watch('slug');

//   // Auto-generate slug from title
//   useEffect(() => {
//     if (title && !isDirty) {
//       const generatedSlug = title
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/(^-|-$)/g, '');
//       setValue('slug', generatedSlug);
//     }
//   }, [title, setValue, isDirty]);

//   // SEO Analysis with debounce
//   useEffect(() => {
//     const timer = setTimeout(async () => {
//       if (content || title || metaDescription || focusKeyword) {
//         const result = await analyzer.analyze(
//           content || '',
//           metaTitle || title || '',
//           metaDescription || '',
//           focusKeyword || '',
//           slug || ''
//         );
//         setSeoResult(result);
//         setWordCount(result.wordCount);
//         setReadingTime(result.readingTime);
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [content, title, metaTitle, metaDescription, focusKeyword, slug, analyzer]);

//   // Auto-save
//   useEffect(() => {
//     if (!isDirty) return;

//     const timer = setTimeout(async () => {
//       setSaveState('saving');
//       try {
//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setSaveState('saved');
//         setTimeout(() => setSaveState('idle'), 2000);
//       } catch (error) {
//         setSaveState('error');
//       }
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [title, content, metaTitle, metaDescription, focusKeyword, slug, isDirty]);

//   const onSubmit = async (data: PostFormData) => {
//     setSaving(true);
//     try {
//       // Simulate publish
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       router.push('/dashboard/posts');
//     } catch (error) {
//       console.error('Publish failed:', error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getSaveStateIcon = () => {
//     switch (saveState) {
//       case 'saving':
//         return <Clock className="w-3.5 h-3.5 text-gray-400 animate-spin" />;
//       case 'saved':
//         return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
//       case 'error':
//         return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       {/* Top Action Bar */}
//       <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 -mx-4 px-4 py-3">
//         <div className="flex items-center justify-between">
//           {/* Left side */}
//           <div className="flex items-center gap-4 flex-1">
//             <input
//               type="text"
//               placeholder="Post title..."
//               {...register('title')}
//               className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full max-w-lg placeholder:text-gray-300"
//             />
            
//             <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">
//               Draft
//             </span>

//             <div className="flex items-center gap-1 text-xs text-gray-500">
//               {getSaveStateIcon()}
//               {saveState === 'saving' && <span>Saving...</span>}
//               {saveState === 'saved' && <span>Saved</span>}
//               {saveState === 'error' && <span className="text-red-600">Save failed</span>}
//             </div>
//           </div>

//           {/* Right side */}
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//             >
//               <Eye className="w-4 h-4" />
//               Preview
//             </button>
            
//             <button
//               type="button"
//               className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//             >
//               <Save className="w-4 h-4" />
//               Save Draft
//             </button>
            
//             <button
//               type="submit"
//               disabled={saving}
//               className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm flex items-center gap-2 disabled:opacity-50"
//             >
//               <Send className="w-4 h-4" />
//               {saving ? 'Publishing...' : 'Publish'}
//             </button>
//           </div>
//         </div>

//         {/* Error messages */}
//         {Object.keys(errors).length > 0 && (
//           <div className="mt-2 p-2 bg-red-50 rounded-lg">
//             {Object.entries(errors).map(([key, error]) => (
//               <p key={key} className="text-xs text-red-600">
//                 {error?.message as string}
//               </p>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Main Content Area */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Editor */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Rich Text Editor */}
//           <RichTextEditor
//             content={content}
//             onChange={(html) => setValue('content', html)}
//             onWordCountChange={setWordCount}
//           />

//           {/* Post Organization */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//             <h3 className="text-sm font-medium text-gray-900 mb-4">Post Organization</h3>
            
//             <div className="space-y-4">
//               {/* Category */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   <FolderTree className="w-3.5 h-3.5 inline mr-1" />
//                   Category
//                 </label>
//                 <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
//                   <option value="">Select category</option>
//                   <option value="tech">Technology</option>
//                   <option value="business">Business</option>
//                   <option value="marketing">Marketing</option>
//                 </select>
//               </div>

//               {/* Tags */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   <Tags className="w-3.5 h-3.5 inline mr-1" />
//                   Tags
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Add tags (press Enter)"
//                   className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                 />
//               </div>

//               {/* Featured Image */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
//                   Featured Image
//                 </label>
//                 <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
//                   <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
//                 </div>
//               </div>

//               {/* Schedule */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   <Calendar className="w-3.5 h-3.5 inline mr-1" />
//                   Schedule Publish
//                 </label>
//                 <input
//                   type="datetime-local"
//                   className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - SEO Panel (Sticky) */}
//         <div className="lg:col-span-1">
//           <div className="lg:sticky lg:top-20 space-y-6">
//             {/* Mobile Toggle */}
//             <button
//               onClick={() => setShowSEOPanel(!showSEOPanel)}
//               className="lg:hidden w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
//             >
//               <span className="text-sm font-medium">SEO Intelligence</span>
//               <ChevronDown className={`w-4 h-4 transition-transform ${showSEOPanel ? 'rotate-180' : ''}`} />
//             </button>

//             <AnimatePresence>
//               {(showSEOPanel || window.innerWidth >= 1024) && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-6"
//                 >
//                   {/* SEO Score Card */}
//                   {seoResult && (
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                       <SEOScoreCard
//                         score={seoResult.score}
//                         checks={seoResult.checks}
//                         wordCount={wordCount}
//                         readingTime={readingTime}
//                       />
//                     </div>
//                   )}

//                   {/* Google Snippet Preview */}
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                     <GoogleSnippet
//                       title={metaTitle || title}
//                       metaDescription={metaDescription}
//                       slug={slug}
//                     />
//                   </div>

//                   {/* SEO Meta Fields */}
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                     <h3 className="text-sm font-medium text-gray-900 mb-4">SEO Meta</h3>
                    
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           Meta Title
//                         </label>
//                         <input
//                           type="text"
//                           {...register('metaTitle')}
//                           className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                           placeholder="SEO title (optional)"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           Meta Description
//                         </label>
//                         <textarea
//                           {...register('metaDescription')}
//                           rows={3}
//                           className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                           placeholder="SEO description (optional)"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           Focus Keyword
//                         </label>
//                         <input
//                           type="text"
//                           {...register('focusKeyword')}
//                           className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                           placeholder="Main keyword for this post"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">
//                           URL Slug
//                         </label>
//                         <input
//                           type="text"
//                           {...register('slug')}
//                           className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                           placeholder="post-url-slug"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* AI Assistant */}
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                     <AIAssistant
//                       content={content}
//                       keyword={focusKeyword}
//                       onGenerateMetaDescription={(desc) => setValue('metaDescription', desc)}
//                       onGenerateTitle={(title) => setValue('metaTitle', title)}
//                       onGenerateKeywords={(keywords) => {
//                         // Handle keywords
//                         console.log('Generated keywords:', keywords);
//                       }}
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  X,
  ChevronDown,
  Calendar,
  User,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Bug,
} from 'lucide-react';

import RichTextEditor from '@/components/editor/RichTextEditor';
import SEOScoreCard from '@/components/seo/SEOScoreCard';
import GoogleSnippet from '@/components/seo/GoogleSnippet';
import AIAssistant from '@/components/seo/AIAssistant';
import { SEOAnalyzer, SEOAnalysisResult } from '@/lib/seo/analyzer';
import { createPost } from '@/actions/posts/createPost';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(200, 'Excerpt too long').optional(),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  focusKeyword: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  scheduledFor: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function PostForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [seoResult, setSeoResult] = useState<SEOAnalysisResult | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showSEOPanel, setShowSEOPanel] = useState(true);
  
  // Debug states
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [lastServerResponse, setLastServerResponse] = useState<any>(null);

  const analyzer = new SEOAnalyzer();

  // Debug logger
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data, null, 2) : ''}`;
    console.log(log);
    setDebugLogs(prev => [log, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      status: 'DRAFT',
    },
  });

  const title = watch('title');
  const content = watch('content');
  const metaTitle = watch('metaTitle');
  const metaDescription = watch('metaDescription');
  const focusKeyword = watch('focusKeyword');
  const slug = watch('slug');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isDirty) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
      addDebugLog('Auto-generated slug:', generatedSlug);
    }
  }, [title, setValue, isDirty]);

  // SEO Analysis with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content || title || metaDescription || focusKeyword) {
        addDebugLog('Running SEO analysis...');
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
        addDebugLog('SEO analysis complete', { score: result.score });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, title, metaTitle, metaDescription, focusKeyword, slug, analyzer]);

  // Auto-save
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(async () => {
      setSaveState('saving');
      addDebugLog('Auto-save triggered');
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaveState('saved');
        addDebugLog('Auto-save completed');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch (error) {
        setSaveState('error');
        addDebugLog('Auto-save failed', error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, metaTitle, metaDescription, focusKeyword, slug, isDirty]);

  const debugFormData = () => {
    const values = getValues();
    addDebugLog('Current form values:', values);
    addDebugLog('Form errors:', errors);
    addDebugLog('Form is dirty:', isDirty);
    addDebugLog('SEO score:', seoResult?.score);
  };
const onSubmit = async (data: PostFormData) => {
  addDebugLog('🚀 Form submitted', data);
  setSaving(true);
  
  try {
    const formData = new FormData();
    
    // Handle tags specially - convert array to JSON string
    if (data.tags && Array.isArray(data.tags)) {
      formData.append('tags', JSON.stringify(data.tags));
      addDebugLog('Appending tags as JSON:', data.tags);
    }
    
    // Add all other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'tags' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
          addDebugLog(`Appending array ${key}:`, value);
        } else {
          formData.append(key, String(value));
          addDebugLog(`Appending ${key}:`, value);
        }
      }
    });

    // Ensure required fields are present
    if (!formData.has('content') && data.content) {
      formData.append('content', data.content);
    }
    if (!formData.has('status')) {
      formData.append('status', data.status || 'DRAFT');
    }

    addDebugLog('Calling createPost server action...');
    const result = await createPost(formData);
    
    addDebugLog('Server response:', result);
    setLastServerResponse(result);

    if (result?.error) {
      addDebugLog('❌ Server error:', result.error);
      alert(`Error: ${result.error}`);
    } else if (result?.success) {
      addDebugLog('✅ Post created successfully!');
      router.push('/dashboard/posts');
      router.refresh();
    }
  } catch (error) {
    addDebugLog('💥 Unexpected error:', error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setSaving(false);
  }
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">
              Draft
            </span>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              {getSaveStateIcon()}
              {saveState === 'saving' && <span>Saving...</span>}
              {saveState === 'saved' && <span>Saved</span>}
              {saveState === 'error' && <span className="text-red-600">Save failed</span>}
            </div>

            {/* Debug Button - Only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="ml-2 p-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                title="Toggle Debug Panel"
              >
                <Bug className="w-3.5 h-3.5" />
                Debug
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Error messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg">
            {Object.entries(errors).map(([key, error]) => (
              <p key={key} className="text-xs text-red-600">
                {error?.message as string}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-emerald-400 font-semibold">Debug Console</h3>
              <button
                onClick={() => setDebugLogs([])}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-xs"
              >
                Clear Logs
              </button>
            </div>
            
            {/* Quick Debug Actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={debugFormData}
                className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
              >
                Log Form Data
              </button>
              <button
                onClick={() => {
                  const values = getValues();
                  alert(JSON.stringify(values, null, 2));
                }}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Show Form Data
              </button>
            </div>

            {/* Logs */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Submit the form to see debug output.</p>
              ) : (
                debugLogs.map((log, i) => (
                  <pre key={i} className="text-gray-300 whitespace-pre-wrap break-words">
                    {log}
                  </pre>
                ))
              )}
            </div>

            {/* Last Server Response */}
            {lastServerResponse && (
              <div className="mt-4 pt-3 border-t border-gray-700">
                <p className="text-emerald-400 mb-2">Last Server Response:</p>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(lastServerResponse, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={(html) => {
              setValue('content', html);
              addDebugLog('Content updated, length:', html.length);
            }}
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
                  <option value="">Select category</option>
                  <option value="tech">Technology</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
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
    placeholder="Add tags (comma separated)"
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
    onChange={(e) => {
      // Store as comma-separated string
      const value = e.target.value;
      setValue('tags', value ? value.split(',').map(t => t.trim()) : []);
    }}
  />
  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
</div>

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                  Featured Image
                </label>
                <input
                  type="text"
                  {...register('featuredImage')}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
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

        {/* Right Column - SEO Panel (Sticky) */}
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
                      onGenerateMetaDescription={(desc) => {
                        setValue('metaDescription', desc);
                        addDebugLog('AI generated meta description:', desc);
                      }}
                      onGenerateTitle={(title) => {
                        setValue('metaTitle', title);
                        addDebugLog('AI generated title:', title);
                      }}
                      onGenerateKeywords={(keywords) => {
                        addDebugLog('AI generated keywords:', keywords);
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
  );
}