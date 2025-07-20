# Webwaifu 🤖💖

An interactive AI VTuber experience with VRM avatar support, real-time speech recognition, and dynamic responses. Chat with your AI companion through voice or text while watching them react with lifelike animations and expressions.

![Webwaifu Demo](assets/demo.gif)

## ✨ Features

### 🎭 VRM Avatar Support
- Load custom VRM models with full animation support
- Real-time facial expressions and mouth movement
- Audio-reactive body movement and gestures
- Customizable positioning, scaling, and rotation
- Dynamic arm positioning and elbow controls

### 🎤 Advanced Speech Recognition
- **Whisper AI Integration**: Local speech-to-text using Xenova/transformers
- **Browser Fallback**: WebSpeech API for backup recognition
- **Voice Hotkeys**: Customizable always-active speech triggers
- **Microphone Selection**: Choose from available audio input devices

### 🤖 Multi-Provider AI Support
- **Google Gemini**: Latest 2.5 Pro/Flash models with advanced features
- **OpenAI**: GPT-4o, GPT-4 Turbo, and O3 series support
- **Ollama**: Local AI models with extensive parameter control
- **Unified System Prompt**: Consistent personality across all providers

### 🔊 Text-to-Speech
- **Azure Neural Voices**: Premium quality speech synthesis
- **Browser TTS Fallback**: Free alternative with voice selection
- **Voice Customization**: Pitch, rate, and volume controls
- **Audio-Reactive Animation**: Mouth movement synced to speech

### 📺 Streaming & Chat Integration
- **Twitch Chat Integration**: Real-time chat message processing
- **Stream Mode**: Overlay interface for streaming
- **Message Accumulation**: Batch process chat messages
- **Chat Overlay**: Visual display of incoming messages

### 🎨 Customization Options
- **Background Support**: Images and videos with positioning controls
- **Visual Effects**: Curve/bend effects for backgrounds
- **UI Themes**: Cyberpunk-inspired design with neon accents
- **Real-time Controls**: Adjust all parameters during runtime

## 🚀 Quick Start

### Prerequisites
- Modern web browser with ES6 module support
- For AI features: API keys for chosen provider(s)
- For premium TTS: Azure Cognitive Services key
- For local AI: Ollama installation (optional)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/webwaifu.git
   cd webwaifu
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - No build process required - runs directly in browser

3. **Configure AI Provider**
   - Click the settings gear icon
   - Expand "🤖 AI Configuration"
   - Choose your preferred provider and add API key
   - Customize the AI personality in the system prompt

### First Time Setup
1. **Upload VRM Model**: Use the file upload in "📁 VRM Model" section
2. **Configure Voice**: Set up microphone and TTS preferences
3. **Test Everything**: Use the test buttons to verify audio setup
4. **Start Chatting**: Type or use voice input to interact!

## 🎮 Usage Guide

### Basic Interaction
- **Text Chat**: Type in the floating input box and press Enter
- **Voice Input**: Click the microphone button or use your configured hotkey
- **Settings**: Click the gear icon for comprehensive configuration options

### Voice Controls
- **Speech Hotkeys**: Shift, Ctrl, Alt, Space, T, or V keys (always active)
- **Microphone Button**: Click to start/stop voice recognition
- **Voice Selection**: Choose from available microphones

### VRM Customization
- **Position Controls**: X/Y/Z positioning and rotation
- **Animation Settings**: Mouth sensitivity, body motion, expressions
- **Arm Positioning**: Individual arm and elbow control
- **Reset Options**: Quick reset to default positions

### AI Configuration
- **Provider Selection**: Switch between Gemini, OpenAI, or Ollama
- **Model Selection**: Choose specific models for each provider
- **Parameters**: Temperature, token limits, and advanced settings
- **System Prompt**: Define your AI's personality and behavior

### Streaming Setup
1. Enable "Stream Mode" in Twitch settings
2. Enter your Twitch channel name
3. Configure message accumulation threshold
4. Connect to chat for live interaction

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with ES6 modules
- **3D Rendering**: Three.js with VRM support
- **Speech Recognition**: Xenova/transformers (Whisper) + WebSpeech API
- **Audio Processing**: Web Audio API for real-time analysis
- **Storage**: LocalStorage for settings persistence

### Supported File Formats
- **VRM Models**: .vrm files (VRM 0.x specification)
- **Backgrounds**: JPG, PNG, GIF, WEBP, MP4, MOV, AVI
- **Audio**: Browser-supported formats for TTS playback

### Browser Compatibility
- **Chrome/Edge**: Full feature support
- **Firefox**: Core features supported
- **Safari**: Limited WebRTC support
- **Mobile**: Basic functionality available

### Performance Optimization
- **Whisper Model**: Uses lightweight `whisper-tiny.en` for speed
- **Audio Processing**: Optimized buffer sizes and frame rates
- **3D Rendering**: Efficient animation loops and resource management
- **Memory Management**: Automatic cleanup of audio resources

## ⚙️ Configuration

### Environment Variables
No environment variables required - all configuration through UI.

### Settings Files
Settings are automatically saved to browser localStorage:
- AI provider configurations
- VRM positioning and animation settings  
- Voice and audio preferences
- Twitch integration settings

### API Keys Required
- **Google Gemini**: Get from [Google AI Studio](https://makersuite.google.com/)
- **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/)
- **Azure TTS**: Get from [Azure Portal](https://portal.azure.com/) (optional)

## 📁 Project Structure

```
webwaifu/
├── index.html              # Main application file
├── script.js               # Core JavaScript functionality
├── style.css               # Styling and animations
├── README.md              # This file
├── assets/                # Demo images and documentation
└── [VRM files]            # Your uploaded VRM models
```

## 🔧 Troubleshooting

### Common Issues

**Speech Recognition Not Working**
- Check microphone permissions in browser
- Verify microphone is selected in settings
- Try refreshing the page to reload Whisper model

**VRM Model Not Loading**
- Ensure file is valid VRM format (.vrm extension)
- Check browser console for error messages
- Try a different VRM model to isolate the issue

**AI Not Responding**
- Verify API key is entered correctly
- Check network connection
- Try switching to a different AI provider

**TTS Not Playing**
- Check browser audio permissions
- Verify TTS is enabled in settings
- Try browser TTS if Azure TTS fails

### Performance Issues
- Close other browser tabs using audio/video
- Lower VRM model complexity if possible
- Disable unnecessary browser extensions
- Use Chrome/Edge for best performance

### Audio Problems
- Check system audio levels and output device
- Verify microphone is working in other applications
- Try different microphone if available
- Restart browser if audio becomes unresponsive

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Make changes directly to the files
3. Test in multiple browsers
4. Submit pull request with description

### Code Style
- Use modern JavaScript (ES6+)
- Comment complex algorithms
- Follow existing naming conventions
- Test audio features thoroughly

## 📄 License

This project is open source. Please respect the original VU-VRM project attribution.

## 🙏 Acknowledgments

- **VU-VRM**: Based on the original VU-VRM project by itsTallulahhh
- **Three.js**: 3D rendering and VRM support
- **Xenova/transformers**: Client-side AI model execution
- **Pixiv VRM**: VRM specification and three-vrm library

## 🔗 Links

- [VRM Specification](https://vrm.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Xenova Transformers](https://huggingface.co/docs/transformers.js/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Made with 💖 for the VTuber community**

*Transform your AI interactions with lifelike avatars and natural conversation!*