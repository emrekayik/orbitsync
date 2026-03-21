"use client";

import { FC } from "react";
import * as Evolu from "@evolu/common";
import { IconEdit, IconTrash, IconCopy, IconCheck } from "@tabler/icons-react";
import { useEvolu, type SnippetsRow } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { toast } from "sonner";
import { useState } from "react";

const EXTENSIONS: Record<string, any> = {
  javascript: javascript({ jsx: true, typescript: true }),
  python: python(),
  html: html(),
  css: css(),
  json: json(),
};

export const SnippetItem: FC<{
  row: SnippetsRow;
}> = ({ row: { id, title, content, image, tags, language, copyCount } }) => {
  const { update } = useEvolu();
  const [copied, setCopied] = useState(false);

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
      content: newContent,
      tags: newTags.trim() || undefined,
      language: language != null ? String(language) : undefined, // keeps the same
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
    if(window.confirm("Delete this snippet forever?")) {
      update("snippet", {
        id,
        isDeleted: Evolu.sqliteTrue,
      });
    }
  };

  const handleCopyClick = () => {
    if (content) {
      navigator.clipboard.writeText(String(content));
      setCopied(true);
      toast.success("Copied to clipboard", { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCode = language && language !== "text";

  return (
    <li className="group pb-6 border-b border-gray-100/80 last:border-none last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-medium text-gray-900 tracking-tight leading-snug">
            {title}
          </h3>
          {tags && String(tags).trim().length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {String(tags).split(',').map((t, i) => {
                const trimmed = t.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className="text-[11px] font-medium text-gray-500">
                    #{trimmed}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isCode && (
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mr-2 border border-gray-200/60 px-1.5 py-0.5 rounded">
              {language}
            </span>
          )}
          <button
            onClick={handleCopyClick}
            className="p-1.5 text-gray-400 hover:bg-gray-100/80 rounded-md transition-colors hover:text-gray-900"
            title="Copy"
          >
            {copied ? <IconCheck stroke={1.5} className="w-4 h-4 text-green-600" /> : <IconCopy stroke={1.5} className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRenameClick}
            className="p-1.5 text-gray-400 hover:bg-gray-100/80 rounded-md transition-colors hover:text-gray-900"
            title="Edit"
          >
            <IconEdit stroke={1.5} className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-400 hover:bg-gray-100/80 rounded-md transition-colors hover:text-red-600"
            title="Delete"
          >
            <IconTrash stroke={1.5} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full text-[13px] mt-2 group-hover:border-gray-300 transition-colors border border-transparent rounded-lg">
        {!isCode ? (
          <div className="text-gray-600 whitespace-pre-wrap font-sans bg-white px-4 py-3 border border-gray-100 rounded-lg selection:bg-gray-200">
            {content}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-[#fafafa]">
            <CodeMirror
              value={String(content)}
              readOnly={true}
              theme="light"
              extensions={[EXTENSIONS[String(language)] || javascript({ jsx: true, typescript: true })]}
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
              }}
              className="*:outline-none p-2 selection:bg-gray-200"
            />
          </div>
        )}
      </div>
    </li>
  );
};
