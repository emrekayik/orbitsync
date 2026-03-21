"use client";

import { FC } from "react";
import * as Evolu from "@evolu/common";
import { IconEdit, IconTrash, IconCopy } from "@tabler/icons-react";
import { useEvolu, type SnippetsRow } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import { Button } from "@/components/ui/button";

export const SnippetItem: FC<{
  row: SnippetsRow;
}> = ({ row: { id, title, content, image, tags, copyCount } }) => {
  const { update } = useEvolu();

  const handleRenameClick = () => {
    const newTitle = window.prompt(
      "Edit snippet title",
      title != null ? String(title) : "",
    );
    if (newTitle == null) return;

    const newContent = window.prompt(
      "Edit snippet content",
      content != null ? String(content) : "",
    );
    if (newContent == null) return;

    const newTags = window.prompt(
      "Edit snippet tags (comma separated)",
      tags != null ? String(tags) : "",
    );
    if (newTags == null) return;

    const parseResult = snippetSchema.safeParse({
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags.trim() || undefined,
    });
    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }

    const result = update("snippet", {
      id,
      title: parseResult.data.title as never,
      content: parseResult.data.content as never,
      tags: (parseResult.data.tags ? parseResult.data.tags : null) as never,
    });

    if (!result.ok) {
      alert("Bilinmeyen bir hata oluştu.");
    }
  };

  const handleDeleteClick = () => {
    update("snippet", {
      id,
      isDeleted: Evolu.sqliteTrue,
    });
  };

  const handleCopyClick = () => {
    if (content) {
      navigator.clipboard.writeText(String(content));
    }
  };

  return (
    <li className="-mx-2 flex items-center justify-between gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg group">
      <div
        className="flex flex-col flex-1 overflow-hidden cursor-pointer gap-1"
        onClick={handleCopyClick}
        title="Click to copy"
      >
        <span className="font-medium text-sm text-gray-900 truncate flex items-center gap-2">
          {title}
        </span>
        {tags && String(tags).trim().length > 0 && (
          <div className="flex flex-wrap gap-1">
            {String(tags).split(',').map((t, i) => {
              const trimmed = t.trim();
              if (!trimmed) return null;
              return (
                <span key={i} className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-blue-100">
                  {trimmed}
                </span>
              );
            })}
          </div>
        )}
        <span className="text-xs text-gray-500 truncate">{content}</span>
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          onClick={handleCopyClick}
          className="p-1 text-gray-400 bg-transparent hover:bg-gray-100 transition-colors hover:text-green-600 shadow-none border-none"
          title="Copy"
        >
          <IconCopy className="size-4" />
        </Button>
        <Button
          onClick={handleRenameClick}
          className="p-1 text-gray-400 bg-transparent hover:bg-gray-100 transition-colors hover:text-blue-600 shadow-none border-none"
          title="Edit"
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          onClick={handleDeleteClick}
          className="p-1 text-gray-400 bg-transparent hover:bg-gray-100 transition-colors hover:text-red-600 shadow-none border-none"
          title="Delete"
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </li>
  );
};
