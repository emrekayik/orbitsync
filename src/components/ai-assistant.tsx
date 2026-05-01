/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FC, useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { IconRobot, IconLoader2, IconSparkles } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAISettings } from "@/hooks/use-ai-settings";
import type { AIWorkerRequest, AIWorkerResponse } from "@/workers/ai.worker";

export const AIAssistant: FC = () => {
  const { useAI, isMounted } = useAISettings();
  const [open, setOpen] = useState(false);
  const worker = useRef<Worker | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [prompt, setPrompt] = useState("Describe this image in detail and transcribe this audio verbatim.");
  const [imageUrl, setImageUrl] = useState("https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/artemis.jpeg");
  const [audioUrl, setAudioUrl] = useState("https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav");
  
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (!useAI) {
      if (worker.current) {
        worker.current.terminate();
        worker.current = null;
      }
      setIsReady(false);
      return;
    }

    if (typeof window !== "undefined" && !worker.current) {
      // Initialize the worker
      worker.current = new Worker(new URL('@/workers/ai.worker.ts', import.meta.url), {
        type: 'module'
      });
      
      worker.current.addEventListener('message', (e: MessageEvent<AIWorkerResponse>) => {
        const data = e.data;
        if (data.type === 'PROGRESS') {
          setProgress(data.progress);
        } else if (data.type === 'READY') {
          setIsReady(true);
          setLoading(false);
        } else if (data.type === 'GENERATING') {
          setResponse(data.text);
        } else if (data.type === 'DONE') {
          setResponse(data.text);
          setLoading(false);
        } else if (data.type === 'ERROR') {
          setResponse("Error: " + data.error);
          setLoading(false);
        }
      });
    }

    return () => {
      // We don't terminate here so it stays loaded across dialog opens
    };
  }, [useAI]);

  const handleLoadModel = () => {
    if (!worker.current) return;
    setLoading(true);
    setResponse("");
    worker.current.postMessage({ type: 'LOAD_MODEL' } as AIWorkerRequest);
  };

  const handleGenerate = () => {
    if (!worker.current) return;
    setLoading(true);
    setResponse("");
    worker.current.postMessage({
      type: 'GENERATE',
      prompt,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null
    } as AIWorkerRequest);
  };

  if (!isMounted || !useAI) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <IconSparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">AI Mode</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconRobot className="w-5 h-5 text-primary" />
            AI Assistant (Gemma 4 E2B)
          </DialogTitle>
          <DialogDescription>
            Run local AI models directly in your browser using WebGPU. No data leaves your device.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {!isReady ? (
            <div className="flex flex-col items-center justify-center py-6 bg-muted/50 rounded-xl border border-border gap-4">
              <IconRobot className="w-12 h-12 text-muted-foreground opacity-50" />
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Model Not Loaded</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Load the onnx-community/gemma-4-E2B-it-ONNX model to start generating. (approx ~2GB). This is a one-time process.
                </p>
              </div>
              {loading ? (
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    Loading Model... {progress > 0 && `(${progress.toFixed(1)}%)`}
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out" 
                      style={{ width: `${Math.max(2, progress)}%` }} 
                    />
                  </div>
                </div>
              ) : (
                <Button onClick={handleLoadModel}>Start Download</Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Image (URL or Local File)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      placeholder="https://..."
                      className="h-8 text-xs flex-1"
                    />
                    <div className="relative">
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const objectUrl = URL.createObjectURL(file);
                            setImageUrl(objectUrl);
                          }
                        }}
                        className="h-8 text-xs w-[180px] file:mr-2 file:h-8 file:-my-2 file:-ml-3 file:px-3 file:bg-transparent file:border-r file:border-border file:text-xs file:font-medium file:text-primary file:cursor-pointer cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Audio (URL or Local File)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      value={audioUrl} 
                      onChange={(e) => setAudioUrl(e.target.value)} 
                      placeholder="https://..."
                      className="h-8 text-xs flex-1"
                    />
                    <div className="relative">
                      <Input 
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const objectUrl = URL.createObjectURL(file);
                            setAudioUrl(objectUrl);
                          }
                        }}
                        className="h-8 text-xs w-[180px] file:mr-2 file:h-8 file:-my-2 file:-ml-3 file:px-3 file:bg-transparent file:border-r file:border-border file:text-xs file:font-medium file:text-primary file:cursor-pointer cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Prompt</Label>
                  <Textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || !prompt}
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate"}
                </Button>
              </div>

              {response && (
                <div className="bg-muted p-3 rounded-lg border border-border min-h-[100px] max-h-[250px] overflow-y-auto">
                  <Label className="text-xs font-semibold mb-2 block">Output:</Label>
                  <div className="text-sm whitespace-pre-wrap font-mono">
                    {response}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
