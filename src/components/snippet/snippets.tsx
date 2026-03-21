"use client";

import { FC, useState } from "react";
import * as Evolu from "@evolu/common";
import { useQuery } from "@evolu/react";
import { useEvolu, snippetsQuery } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import { SnippetItem } from "./snippet-item";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { toast } from "sonner";
import { SettingsDialog } from "../settings-dialog";

const EXTENSIONS: Record<string, any> = {
  javascript: javascript({ jsx: true, typescript: true }),
  python: python(),
  html: html(),
  css: css(),
  json: json(),
};

export const Snippets: FC = () => {
  const snippets = useQuery(snippetsQuery);
  const { insert } = useEvolu();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [language, setLanguage] = useState("text");

  const addSnippet = () => {
    const parseResult = snippetSchema.safeParse({
      title: newTitle.trim(),
      content: newContent,
      tags: newTags.trim() || undefined,
      language: language.trim() || undefined,
    });

    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0].message);
      return;
    }

    const result = insert(
      "snippet",
      {
        title: parseResult.data.title as never,
        content: parseResult.data.content as never,
        tags: (parseResult.data.tags ? parseResult.data.tags : null) as never,
        language: (parseResult.data.language ? parseResult.data.language : null) as never,
      },
      {
        onComplete: () => {
          setNewTitle("");
          setNewContent("");
          setNewTags("");
        },
      },
    );

    if (!result.ok) {
      toast.error("Bilinmeyen bir hata oluştu.");
    }
  };

  return (
    <div className="w-full pb-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 font-noto">snipsync.</h1>
        <SettingsDialog />
      </div>

      <div className="mb-14 rounded-xl border border-gray-200/70 bg-white shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-gray-100 transition-all">
        <div className="flex px-4 py-3 border-b border-gray-100/60 bg-white">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Snippet title..."
            className="flex-1 bg-transparent text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (csv)"
            className="w-24 sm:w-32 bg-transparent text-[12px] text-gray-500 outline-none placeholder:text-gray-300 text-right"
          />
        </div>
        
        {language === "text" ? (
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Paste text or code here..."
            className="w-full min-h-[140px] bg-white text-[13px] px-4 py-3 outline-none resize-y text-gray-700 placeholder:text-gray-400 font-mono"
            spellCheck={false}
          />
        ) : (
          <div className="bg-[#fafafa] min-h-[140px]">
            <CodeMirror
              value={newContent}
              minHeight="140px"
              extensions={[EXTENSIONS[language] || []]}
              onChange={(value) => setNewContent(value)}
              className="*:outline-none p-1 text-[13px]"
              theme="light"
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100/60 bg-gray-50/50">
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            className="text-[12px] font-medium bg-transparent border-none text-gray-500 outline-none cursor-pointer hover:text-gray-900 transition-colors focus:ring-0"
          >
            <option value="text">Plain Text</option>
            <option value="javascript">JavaScript / TS</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
          
          <button 
            onClick={addSnippet} 
            disabled={!newTitle || !newContent}
            className="text-[12px] font-medium bg-gray-900 text-white px-3.5 py-1.5 rounded-md hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Save snippet
          </button>
        </div>
      </div>

      <ol className="space-y-6">
        {snippets.length === 0 ? (
          <li className="text-sm text-gray-400 py-12 text-center">
            No snippets found. Start building your pocket memory.
          </li>
        ) : (
          snippets.map((snippet) => (
            <SnippetItem key={snippet.id} row={snippet} />
          ))
        )}
      </ol>
    </div>
  );
};
