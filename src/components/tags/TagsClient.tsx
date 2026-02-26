'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Tags as TagsIcon } from 'lucide-react';
import Link from 'next/link';
import { deleteTag } from '@/actions/tags';

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface TagsClientProps {
  tags: Tag[];
}

export default function TagsClient({ tags }: TagsClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (tagId: string, tagName: string, postCount: number) => {
    if (postCount > 0) {
      if (!confirm(`Tag "${tagName}" is used in ${postCount} posts. Deleting it will remove the tag from those posts. Continue?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
        return;
      }
    }

    setDeleting(tagId);
    
    const formData = new FormData();
    formData.append('id', tagId);
    
    try {
      const result = await deleteTag(formData);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete tag');
      }
    } catch (error) {
      alert('An error occurred while deleting the tag');
    } finally {
      setDeleting(null);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No tags yet. Create your first tag!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-emerald-100 transition-colors"
        >
          <TagsIcon className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-600" />
          <Link
            href={`/dashboard/tags/${tag.id}/edit`}
            className="text-gray-700 group-hover:text-emerald-700 hover:underline"
          >
            {tag.name}
          </Link>
          <span className="text-xs text-gray-500 group-hover:text-emerald-600">
            ({tag.postCount})
          </span>
          <div className="flex items-center gap-1 ml-1">
            <Link
              href={`/dashboard/tags/${tag.id}/edit`}
              className="opacity-0 group-hover:opacity-100 p-1 text-emerald-600 hover:text-emerald-700 transition-opacity"
            >
              <Edit className="w-3 h-3" />
            </Link>
            <button
              onClick={() => handleDelete(tag.id, tag.name, tag.postCount)}
              disabled={deleting === tag.id}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
