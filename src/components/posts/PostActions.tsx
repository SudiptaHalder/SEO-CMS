'use client';

import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deletePost } from '@/actions/posts/deletePost';

interface PostActionsProps {
  postId: string;
}

export default function PostActions({ postId }: PostActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const formData = new FormData();
    formData.append('id', postId);
    
    const result = await deletePost(formData);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete post');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/posts/${postId}/edit`}
        className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
