import {
  AutoProcessor,
  Gemma4ForConditionalGeneration,
  TextStreamer,
  load_image,
  read_audio,
} from "@huggingface/transformers";

// Web worker message types
export type AIWorkerRequest = 
  | { type: 'LOAD_MODEL' }
  | { type: 'GENERATE', imageUrl?: string | null, audioUrl?: string | null, prompt: string };

export type AIWorkerResponse = 
  | { type: 'PROGRESS', progress: number }
  | { type: 'READY' }
  | { type: 'GENERATING', text: string }
  | { type: 'DONE', text: string }
  | { type: 'ERROR', error: string };

let processor: any = null;
let model: any = null;

async function initModel() {
  if (processor && model) return;
  
  try {
    const model_id = "onnx-community/gemma-4-E2B-it-ONNX";
    
    self.postMessage({ type: 'PROGRESS', progress: 0 } as AIWorkerResponse);
    
    processor = await AutoProcessor.from_pretrained(model_id);
    model = await Gemma4ForConditionalGeneration.from_pretrained(model_id, {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback: (info: any) => {
        if (info.status === "progress_total" || info.status === "progress") {
          // You might want to fine-tune the progress tracking depending on info object
          const p = info.progress || 0;
          self.postMessage({ type: 'PROGRESS', progress: p } as AIWorkerResponse);
        }
      },
    });
    
    self.postMessage({ type: 'READY' } as AIWorkerResponse);
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', error: error.message } as AIWorkerResponse);
  }
}

self.addEventListener("message", async (e: MessageEvent<AIWorkerRequest>) => {
  const data = e.data;
  
  if (data.type === 'LOAD_MODEL') {
    await initModel();
  } 
  else if (data.type === 'GENERATE') {
    if (!processor || !model) {
      self.postMessage({ type: 'ERROR', error: "Model not loaded yet." } as AIWorkerResponse);
      return;
    }
    
    try {
      const content = [];
      
      let image = null;
      if (data.imageUrl) {
        content.push({ type: "image" });
        image = await load_image(data.imageUrl);
      }
      
      let audio = null;
      if (data.audioUrl) {
        content.push({ type: "audio" });
        audio = await read_audio(data.audioUrl, 16000);
      }
      
      content.push({
        type: "text",
        text: data.prompt,
      });

      const messages = [
        {
          role: "user",
          content: content,
        },
      ];
      
      const prompt = processor.apply_chat_template(messages, {
        enable_thinking: false,
        add_generation_prompt: true,
      });

      const inputs = await processor(prompt, image, audio, {
        add_special_tokens: false,
      });

      let generatedText = "";
      
      const outputs = await model.generate({
        ...inputs,
        max_new_tokens: 512,
        do_sample: false,
        streamer: new TextStreamer(processor.tokenizer, {
          skip_prompt: true,
          skip_special_tokens: true,
          callback_function: (text: string) => {
            generatedText += text;
            self.postMessage({ type: 'GENERATING', text: generatedText } as AIWorkerResponse);
          },
        }),
      });

      // The callback_function on streamer handles the chunking, but we can also send the final decoded string
      const decoded = processor.batch_decode(
        outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
        { skip_special_tokens: true },
      );
      
      self.postMessage({ type: 'DONE', text: decoded[0] } as AIWorkerResponse);
    } catch (error: any) {
      self.postMessage({ type: 'ERROR', error: error.message } as AIWorkerResponse);
    }
  }
});
