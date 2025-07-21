// Whisper AI Web Worker - Maintains exact same functionality but off main thread
// This worker handles all Whisper AI processing to prevent UI freezing

// Import Transformers.js in worker context using dynamic import
// Since workers don't support ES6 modules directly, we'll use dynamic import
let pipeline = null;

async function loadTransformers() {
  try {
    const module = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
    pipeline = module.pipeline;
    return true;
  } catch (error) {
    console.error('[Worker] Failed to load Transformers.js:', error);
    return false;
  }
}

let transcriber = null;
let isInitializing = false;
const MODEL_NAME = 'Xenova/whisper-tiny.en';

// Initialize Whisper model in worker
async function initializeWhisperModel() {
  if (transcriber || isInitializing) return;
  
  isInitializing = true;
  console.log('🔄 [Worker] Initializing Whisper model...');
  
  try {
    // Load Transformers.js first
    if (!pipeline) {
      console.log('🔄 [Worker] Loading Transformers.js...');
      const loaded = await loadTransformers();
      if (!loaded) {
        throw new Error('Failed to load Transformers.js library');
      }
    }
    
    // Use same exact configuration as main thread
    transcriber = await pipeline('automatic-speech-recognition', MODEL_NAME, {
      cache: 'force-cache'
    });
    
    console.log('✅ [Worker] Whisper model loaded successfully');
    
    // Notify main thread that model is ready
    self.postMessage({
      type: 'model-ready',
      success: true,
      modelName: MODEL_NAME
    });
    
  } catch (error) {
    console.error('❌ [Worker] Failed to load Whisper model:', error);
    
    // Notify main thread of error
    self.postMessage({
      type: 'model-error',
      error: error.message
    });
  } finally {
    isInitializing = false;
  }
}

// Process audio transcription
async function processAudioTranscription(audioData, options = {}) {
  if (!transcriber) {
    throw new Error('Whisper model not initialized');
  }
  
  console.log('🤖 [Worker] Starting transcription...');
  console.log('📊 [Worker] Audio data length:', audioData.length, 'samples');
  
  try {
    // Use exact same parameters as main thread
    const output = await transcriber(audioData, {
      chunk_length_s: options.chunk_length_s || 10,
      stride_length_s: options.stride_length_s || 2
    });
    
    const transcript = output.text ? output.text.trim() : '';
    console.log('📝 [Worker] Transcription result:', transcript || 'No text detected');
    
    return {
      success: true,
      transcript: transcript,
      raw: output
    };
    
  } catch (error) {
    console.error('❌ [Worker] Transcription error:', error);
    throw error;
  }
}

// Worker message handler
self.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;
  
  try {
    switch (type) {
      case 'init-model':
        await initializeWhisperModel();
        break;
        
      case 'transcribe':
        if (!transcriber) {
          self.postMessage({
            type: 'transcribe-error',
            id: id,
            error: 'Whisper model not initialized'
          });
          return;
        }
        
        const result = await processAudioTranscription(data.audioData, data.options);
        
        self.postMessage({
          type: 'transcribe-result',
          id: id,
          result: result
        });
        break;
        
      case 'get-status':
        self.postMessage({
          type: 'status-response',
          id: id,
          status: {
            modelLoaded: !!transcriber,
            modelName: MODEL_NAME,
            isInitializing: isInitializing
          }
        });
        break;
        
      default:
        console.warn('[Worker] Unknown message type:', type);
    }
    
  } catch (error) {
    console.error('[Worker] Error processing message:', error);
    
    self.postMessage({
      type: 'error',
      id: id,
      error: error.message
    });
  }
});

// Initialize on worker start
console.log('🚀 [Worker] Whisper Worker started');

// Auto-initialize model when worker loads
initializeWhisperModel();