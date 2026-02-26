'use client';

import { useRouter } from 'next/navigation';
import { Edit, Trash2, Tags as TagsIcon } from 'lucide-react';
import Link from 'next/link';
import { deleteTag } from '@/actions/tags';

interface TagActionsProps {
  tag: {
    id: string;
    name: string;
  };
  postCount: number;
}

export default function TagActions({ tag, postCount }: TagActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (postCount > 0) {
      if (!confirm(`This tag is used in ${postCount} posts. Deleting it will remove the tag from those posts. Continue?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this tag?')) {
        return;
      }
    }

    const formData = new FormData();
    formData.append('id', tag.id);
    
    const result = await deleteTag(formData);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-emerald-100 transition-colors">
      <TagsIcon className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-600" />
      <Link
        href={`/dashboard/tags/${tag.id}/edit`}
        className="text-gray-700 group-hover:text-emerald-700 hover:underline"
      >
        {tag.name}
      </Link>
      <span className="text-xs text-gray-500 group-hover:text-emerald-600">
        ({postCount})
      </span>
      <div className="flex items-center gap-1 ml-1">
        <Link
          href={`/dashboard/tags/${tag.id}/edit`}
          className="opacity-0 group-hover:opacity-100 p-1 text-emerald-600 hover:text-emerald-700 transition-opacity"
        >
          <Edit className="w-3 h-3" />
        </Link>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
