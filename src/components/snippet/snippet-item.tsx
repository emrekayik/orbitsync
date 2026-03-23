"use client";

import { FC } from "react";
import * as Evolu from "@evolu/common";
import { IconEdit, IconTrash, IconCopy, IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useEvolu, type SnippetsRow } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EXTENSIONS: Record<string, any> = {
  javascript: javascript({ jsx: true, typescript: true }),
  python: python(),
  html: html(),
  css: css(),
  json: json(),
  go: go(),
  rust: rust(),
  markdown: markdown(),
  sql: sql(),
  java: java(),
  cpp: cpp(),
};

export const SnippetItem: FC<{
  row: SnippetsRow;
}> = ({ row: { id, title, content, image, tags, language, copyCount } }) => {
  const { update } = useEvolu();
  const [copied, setCopied] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openEdit = () => {
    setEditTitle(title != null ? String(title) : "");
    setEditContent(content != null ? String(content) : "");
    setEditTags(tags != null ? String(tags) : "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    const parseResult = snippetSchema.safeParse({
      title: editTitle.trim(),
      content: editContent,
      tags: editTags.trim() || undefined,
      language: language != null ? String(language) : undefined,
    });
    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0].message);
      return;
    }

    const result = update("snippet", {
      id,
      title: parseResult.data.title as never,
      content: parseResult.data.content as never,
      tags: (parseResult.data.tags ? parseResult.data.tags : null) as never,
    });

    if (!result.ok) {
      toast.error("Bilinmeyen bir hata oluştu.");
      return;
    }
    
    setIsEditOpen(false);
    toast.success("Snippet updated");
  };

  const confirmDelete = () => {
    update("snippet", {
      id,
      isDeleted: Evolu.sqliteTrue,
    });
    setIsDeleteOpen(false);
    toast.success("Snippet deleted");
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
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group pb-6 border-b border-border/80 last:border-none last:pb-0"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-medium text-foreground tracking-tight leading-snug">
            {title}
          </h3>
          {tags && String(tags).trim().length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {String(tags).split(',').map((t, i) => {
                const trimmed = t.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className="text-[11px] font-medium text-muted-foreground">
                    #{trimmed}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isCode && (
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mr-2 border border-border/60 px-1.5 py-0.5 rounded">
              {language}
            </span>
          )}
          <button
            onClick={handleCopyClick}
            className="p-1.5 text-muted-foreground hover:bg-accent rounded-md transition-colors hover:text-foreground"
            title="Copy"
          >
            {copied ? <IconCheck stroke={1.5} className="w-4 h-4 text-green-600" /> : <IconCopy stroke={1.5} className="w-4 h-4" />}
          </button>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <button
                onClick={openEdit}
                className="p-1.5 text-muted-foreground hover:bg-accent rounded-md transition-colors hover:text-foreground"
                title="Edit"
              >
                <IconEdit stroke={1.5} className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Edit Snippet</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Content {language ? `(${language})` : ''}</Label>
                  <Textarea 
                    value={editContent} 
                    onChange={e => setEditContent(e.target.value)} 
                    rows={8} 
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input value={editTags} onChange={e => setEditTags(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <button
                className="p-1.5 text-muted-foreground hover:bg-destructive/10 rounded-md transition-colors hover:text-destructive"
                title="Delete"
              >
                <IconTrash stroke={1.5} className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Snippet</DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete this snippet forever?
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full text-[13px] mt-2 group-hover:border-border transition-colors border border-transparent rounded-lg">
        {!isCode ? (
          <div className="text-muted-foreground whitespace-pre-wrap font-sans bg-card px-4 py-3 border border-border rounded-lg selection:bg-primary/20">
            {content}
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
            <CodeMirror
              value={String(content)}
              readOnly={true}
              theme="light"
              extensions={[EXTENSIONS[String(language)] || javascript({ jsx: true, typescript: true })]}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
              }}
              className="*:outline-none p-2 selection:bg-primary/20"
            />
          </div>
        )}
      </div>
    </motion.li>
  );
};
