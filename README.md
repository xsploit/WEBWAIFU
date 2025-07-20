# WEBWAIFU 🤖💖

An interactive AI VTuber experience with VRM avatar support, real-time speech recognition, and dynamic responses. Chat with your AI companion through voice or text while watching them react with lifelike animations and expressions.

![WEBWAIFU Demo](ww.png)

## ✨ Features

### 🎭 VRM Avatar Support
- **Load Custom Models**: Upload your own `.vrm` files for personalized avatars
- **Lifelike Animations**: Real-time facial expressions, mouth movement, and audio-reactive body gestures
- **Full Customization**: Adjust avatar position, scale, rotation, and fine-tune arm/elbow positioning

### 🎤 Advanced Speech Recognition
- **Whisper AI Integration**: High-accuracy, local speech-to-text using `Xenova/transformers`
- **Optimized Performance**: Fast 10-second chunk processing with 2-second overlap for real-time feel
- **Voice Hotkeys**: Set hotkey (Shift, Ctrl, Alt, Space) for always-on voice activation

### 🤖 Multi-Provider AI Support
- **Google Gemini**: Latest Gemini models with fast, creative responses
- **OpenAI**: GPT-4o, GPT-4 Turbo, and other OpenAI models
- **Ollama**: Local AI models running completely offline
- **Smart Request Queue**: Prevents API overwhelm while maintaining responsiveness
- **30-Second Timeouts**: No more hanging requests or frozen responses

### 🔊 High-Quality Text-to-Speech
- **Azure Neural Voices**: Premium, natural-sounding voices (24kHz, 48kbit quality)
- **Browser TTS Fallback**: Free built-in alternative with voice selection
- **Voice Customization**: Adjust pitch, rate, volume, and speaking styles

### 📺 Streaming & Chat Integration
- **Twitch Chat**: Direct integration with Twitch channel chat
- **Stream Mode**: Overlay interface designed for streaming
- **Message Queue System**: Smart batching and prioritization of chat messages
- **Real-time Chat Display**: Live chat overlay with user messages

### 🎨 Customization Options
- **Custom Backgrounds**: Images or videos as avatar backdrop
- **Visual Effects**: Curve and bend effects for immersive scenes
- **Real-time Controls**: Adjust all settings without reloading

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome/Edge recommended for full feature support).
- **For AI features**: API keys for your chosen provider (Google Gemini or OpenAI).
- **For premium TTS**: An Azure Cognitive Services key (optional).
- **For local AI**: A running instance of [Ollama](https://ollama.com/) (optional). See the [Ollama Setup Guide](OLLAMA_SETUP.md) for detailed instructions.

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/xsploit/WEBWAIFU.git
    cd WEBWAIFU
    ```

2.  **Open in browser:**
    - Simply open the `index.html` file in your web browser
    - No build process or servers required - pure client-side application!

### First-Time Setup
1.  **Upload VRM Model**: In settings panel → "📁 VRM Model" → upload your `.vrm` file
2.  **Configure AI**: Go to "🤖 AI Configuration" → select provider → enter API key
3.  **Configure Voice**: Set up microphone and TTS under "🎙️ Voice Controls" and "🔊 Text-to-Speech"
4.  **Start Chatting**: Use text input or voice hotkey (default: Shift) to interact with your AI companion!

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript (ES6), HTML5, CSS3 - zero dependencies
- **3D Rendering**: [Three.js](https://threejs.org/) with `@pixiv/three-vrm` library
- **Speech Recognition**: [Xenova/transformers.js](https://huggingface.co/docs/transformers.js) for client-side Whisper
- **Audio Processing**: Web Audio API for real-time microphone analysis and TTS mouth sync
- **Performance**: Smart request queuing, 30s API timeouts, optimized Whisper chunks
- **Storage**: Local browser storage for all settings (no server required)

### Performance Optimizations
- **Fast Speech Processing**: 10-second Whisper chunks (3x faster than default)
- **Smart AI Queue**: Prevents API spam while maintaining responsiveness  
- **Timeout Protection**: All API calls have 30-second timeouts to prevent hanging
- **Memory Management**: Proper cleanup of audio contexts and event listeners

### Supported File Formats
- **VRM Models**: `.vrm` (VRM 0.x specification)
- **Backgrounds**: JPG, PNG, GIF, WEBP, MP4, MOV, AVI
- **Audio**: High-quality Azure TTS (24kHz) or browser TTS fallback

## 🔧 Troubleshooting

### Common Issues
- **Speech Recognition Not Working?**
  - Check browser microphone permissions
  - Verify correct microphone selected in settings
  - Refresh page to reload Whisper model
  - Use Shift key (default hotkey) to activate

- **VRM Model Not Loading?**
  - Ensure valid `.vrm` file (VRM 0.x specification)
  - Check browser console for error messages
  - Try smaller VRM files first

- **AI Not Responding?**
  - Verify API key is correct and active
  - Check internet connection stability
  - Look for timeout errors in console (should auto-retry)
  - Try different AI provider if one fails

- **Performance Issues?**
  - Close other browser tabs to free memory
  - Disable background extensions
  - Use Chrome/Edge for best performance
  - Check console for memory warnings

## 🔗 Repository
**GitHub**: [https://github.com/xsploit/WEBWAIFU.git](https://github.com/xsploit/WEBWAIFU.git)

## 🙏 Acknowledgments

Built upon the excellent **VU-VRM** project foundation ([https://github.com/Automattic/VU-VRM](https://github.com/Automattic/VU-VRM)) by [itsTallulahhh](https://github.com/itsTallulahhh) and powered by these open-source libraries:
- [Three.js](https://threejs.org/) - 3D graphics engine
- [three-vrm](https://github.com/pixiv/three-vrm) - VRM avatar support  
- [Transformers.js](https://github.com/xenova/transformers.js) - Client-side AI models

## 📄 License

This project is open source. See the repository for license details.

---

**Future Features Coming Soon:**
- Azure TTS Streaming for real-time voice synthesis
- LLM Streaming for faster response generation  
- Enhanced VRM expression controls
- More AI provider integrations