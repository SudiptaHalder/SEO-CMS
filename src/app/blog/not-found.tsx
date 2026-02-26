import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/blog"
        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Back to Blog
      </Link>
    </div>
  );
}
