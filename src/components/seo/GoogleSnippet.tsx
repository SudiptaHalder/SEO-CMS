'use client';

interface GoogleSnippetProps {
  title: string;
  metaDescription: string;
  slug: string;
}

export default function GoogleSnippet({ title, metaDescription, slug }: GoogleSnippetProps) {
  const siteUrl = process.env.NEXTAUTH_URL?.replace('https://', '').replace('http://', '') || 'yoursite.com';
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-medium text-gray-700 mb-3">Google Search Preview</h3>
      
      <div className="space-y-1">
        {/* URL */}
        <p className="text-xs text-emerald-700 truncate">
          {siteUrl} › {slug || 'post-slug'}
        </p>
        
        {/* Title */}
        <p className="text-sm font-medium text-blue-700 hover:text-blue-800 cursor-pointer line-clamp-2">
          {title || 'Post Title'} 
        </p>
        
        {/* Meta Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {metaDescription || 'Meta description will appear here...'}
        </p>
        
        {/* Date (optional) */}
        <p className="text-xs text-gray-500 mt-1">Updated recently</p>
      </div>

      {/* Character counters */}
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="text-gray-500">Title</p>
          <p className={`font-medium ${(title.length > 60 || title.length < 30) ? 'text-red-600' : 'text-emerald-600'}`}>
            {title.length} / 60 chars
          </p>
        </div>
        <div>
          <p className="text-gray-500">Description</p>
          <p className={`font-medium ${(metaDescription.length > 160 || metaDescription.length < 120) ? 'text-red-600' : 'text-emerald-600'}`}>
            {metaDescription.length} / 160 chars
          </p>
        </div>
      </div>
    </div>
  );
}
