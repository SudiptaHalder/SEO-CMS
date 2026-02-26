'use client';

import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CategoryActionsProps {
  categoryId: string;
  postCount: number;
  onDelete: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function CategoryActions({ categoryId, postCount, onDelete }: CategoryActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (postCount > 0) {
      if (!confirm(`This category has ${postCount} posts. Deleting it may affect those posts. Continue?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }

    const formData = new FormData();
    formData.append('id', categoryId);
    
    const result = await onDelete(formData);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/categories/${categoryId}/edit`}
        className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
