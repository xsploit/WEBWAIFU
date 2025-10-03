# Ollama System-Level Optimization Guide

## Environment Variables for Performance

These are set at the **system level** when you start Ollama server - NOT per-request!

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### 1. Flash Attention (MOST IMPORTANT)
**Reduces memory usage dramatically, especially for long contexts**

```bash
# Windows PowerShell
$env:OLLAMA_FLASH_ATTENTION="1"
ollama serve

# Windows CMD
set OLLAMA_FLASH_ATTENTION=1
ollama serve

# Linux/Mac
export OLLAMA_FLASH_ATTENTION=1
ollama serve
```

**What it does:**
- Massively reduces VRAM usage for long contexts
- Faster inference
- Required for KV cache quantization

**Compatibility:**
- Works on most modern GPUs (NVIDIA 30xx/40xx, AMD RDNA2+)
- Falls back gracefully if not supported

---

### 2. KV Cache Type (Memory Optimization)
**Controls precision of key-value cache in memory**

```bash
# Windows PowerShell
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
$env:OLLAMA_FLASH_ATTENTION="1"  # Required!
ollama serve

# Windows CMD
set OLLAMA_KV_CACHE_TYPE=q8_0
set OLLAMA_FLASH_ATTENTION=1
ollama serve

# Linux/Mac
export OLLAMA_KV_CACHE_TYPE="q8_0"
export OLLAMA_FLASH_ATTENTION=1
ollama serve
```

**Options:**
- `f16` (default) - Full precision, most VRAM usage
- `q8_0` - 8-bit quantization, **50% less VRAM**, minimal quality loss ⭐ RECOMMENDED
- `q4_0` - 4-bit quantization, **75% less VRAM**, noticeable quality loss at long contexts

**⚠️ REQUIREMENT:** Must set `OLLAMA_FLASH_ATTENTION=1` first!

---

### 3. Context Length
**Maximum context window size**

```bash
# Windows PowerShell
$env:OLLAMA_CONTEXT_LENGTH="4096"
ollama serve

# Linux/Mac
export OLLAMA_CONTEXT_LENGTH=4096
ollama serve
```

**Default:** 2048 tokens

**Recommendations:**
- 2048 = Default, lowest VRAM
- 4096 = Good balance
- 8192 = High VRAM usage, use with q8_0 KV cache
- 16384+ = Requires q8_0 or q4_0 KV cache

---

### 4. Keep Alive (Memory Management)
**How long models stay in VRAM after last use**

```bash
# Windows PowerShell
$env:OLLAMA_KEEP_ALIVE="5m"  # 5 minutes
ollama serve

# Linux/Mac
export OLLAMA_KEEP_ALIVE=5m
ollama serve
```

**Options:**
- `5m` - 5 minutes (default)
- `10m` - 10 minutes
- `30s` - 30 seconds (aggressive unloading)
- `0` - Unload immediately after response
- `-1` - Keep loaded forever

---

### 5. Max Loaded Models
**Concurrent models in memory**

```bash
# Windows PowerShell
$env:OLLAMA_MAX_LOADED_MODELS="1"
ollama serve

# Linux/Mac
export OLLAMA_MAX_LOADED_MODELS=1
ollama serve
```

**Default:** 3 × (number of GPUs) or 3 for CPU

**Recommendations:**
- `1` - Save VRAM, slower model switching
- `2-3` - Balance (default)
- Higher - Only if you have tons of VRAM

---

### 6. Parallel Requests
**Simultaneous requests per model**

```bash
# Windows PowerShell
$env:OLLAMA_NUM_PARALLEL="2"
ollama serve

# Linux/Mac
export OLLAMA_NUM_PARALLEL=2
ollama serve
```

**Default:** Auto-detected based on VRAM

**Recommendations:**
- `1` - Sequential processing, most stable
- `2-4` - Parallel processing, requires more VRAM

---

## 🎯 RECOMMENDED CONFIGURATIONS

### Low VRAM Setup (6-8GB)
```bash
# Windows PowerShell
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
$env:OLLAMA_CONTEXT_LENGTH="2048"
$env:OLLAMA_MAX_LOADED_MODELS="1"
$env:OLLAMA_KEEP_ALIVE="5m"
ollama serve

# Linux/Mac
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE="q8_0"
export OLLAMA_CONTEXT_LENGTH=2048
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE=5m
ollama serve
```

### Medium VRAM Setup (12-16GB)
```bash
# Windows PowerShell
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
$env:OLLAMA_CONTEXT_LENGTH="4096"
$env:OLLAMA_MAX_LOADED_MODELS="2"
$env:OLLAMA_KEEP_ALIVE="10m"
ollama serve

# Linux/Mac
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE="q8_0"
export OLLAMA_CONTEXT_LENGTH=4096
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_KEEP_ALIVE=10m
ollama serve
```

### High VRAM Setup (24GB+)
```bash
# Windows PowerShell
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="f16"
$env:OLLAMA_CONTEXT_LENGTH="8192"
$env:OLLAMA_MAX_LOADED_MODELS="3"
$env:OLLAMA_NUM_PARALLEL="4"
$env:OLLAMA_KEEP_ALIVE="30m"
ollama serve

# Linux/Mac
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE="f16"
export OLLAMA_CONTEXT_LENGTH=8192
export OLLAMA_MAX_LOADED_MODELS=3
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_KEEP_ALIVE=30m
ollama serve
```

---

## 🪟 WINDOWS - Set Permanently

### Option 1: PowerShell Profile (Recommended)
```powershell
# Edit your PowerShell profile
notepad $PROFILE

# Add these lines:
$env:OLLAMA_FLASH_ATTENTION="1"
$env:OLLAMA_KV_CACHE_TYPE="q8_0"
$env:OLLAMA_CONTEXT_LENGTH="4096"

# Save and reload
. $PROFILE
```

### Option 2: System Environment Variables (GUI)
1. Right-click "This PC" → Properties
2. Advanced System Settings → Environment Variables
3. Under "System variables" click "New"
4. Add each variable:
   - Name: `OLLAMA_FLASH_ATTENTION`
   - Value: `1`
5. Restart Ollama service

### Option 3: Batch Script
Create `start-ollama-optimized.bat`:
```batch
@echo off
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_KV_CACHE_TYPE=q8_0
set OLLAMA_CONTEXT_LENGTH=4096
set OLLAMA_MAX_LOADED_MODELS=1
ollama serve
```

---

## 🐧 LINUX - Set Permanently

### Option 1: Systemd Service (Best for servers)
```bash
# Edit Ollama service
sudo systemctl edit ollama.service

# Add these lines:
[Service]
Environment="OLLAMA_FLASH_ATTENTION=1"
Environment="OLLAMA_KV_CACHE_TYPE=q8_0"
Environment="OLLAMA_CONTEXT_LENGTH=4096"

# Save and restart
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### Option 2: Shell Profile
```bash
# Edit your .bashrc or .zshrc
nano ~/.bashrc

# Add these lines:
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE="q8_0"
export OLLAMA_CONTEXT_LENGTH=4096

# Reload
source ~/.bashrc
```

---

## 🍎 MACOS - Set Permanently

### Using launchd (if Ollama runs as service)
```bash
# Create environment plist
nano ~/Library/LaunchAgents/com.ollama.env.plist

# Add:
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ollama.env</string>
  <key>ProgramArguments</key>
  <array>
    <string>launchctl</string>
    <string>setenv</string>
    <string>OLLAMA_FLASH_ATTENTION</string>
    <string>1</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>

# Load it
launchctl load ~/Library/LaunchAgents/com.ollama.env.plist
```

Or just add to `.zshrc`:
```bash
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE="q8_0"
```

---

## ✅ VERIFY IT'S WORKING

After setting environment variables and restarting Ollama:

```bash
# Check if Ollama is using your settings
ollama ps  # See loaded models and memory usage

# Test with a model
ollama run llama2 "Hello"

# Check logs (if available) for Flash Attention confirmation
```

**You should see:**
- Lower VRAM usage than before
- Same or better performance
- Longer context support (if you increased OLLAMA_CONTEXT_LENGTH)

---

## 📊 PERFORMANCE COMPARISON

| Setting | VRAM Usage | Quality | Speed | Best For |
|---------|-----------|---------|-------|----------|
| **Default (f16)** | 100% | Best | Fast | High VRAM systems |
| **Flash Attn + q8_0** | ~50% | ~99% | Fast | Most users ⭐ |
| **Flash Attn + q4_0** | ~25% | ~95% | Fast | Low VRAM systems |

---

## ⚠️ IMPORTANT NOTES

1. **Flash Attention requires compatible GPU** - Falls back gracefully if not supported
2. **KV cache quantization REQUIRES Flash Attention** - Set both together
3. **Environment variables are set at SERVER START** - Restart Ollama after changes
4. **These settings are GLOBAL** - Affect all models loaded by Ollama
5. **OpenAI-compatible endpoint uses these settings** - No need to pass them per-request

---

## 🔧 TROUBLESHOOTING

**Issue: Flash Attention not working**
- Check GPU compatibility
- Verify environment variable is set: `echo $OLLAMA_FLASH_ATTENTION`
- Restart Ollama server completely

**Issue: High VRAM usage still**
- Set `OLLAMA_KV_CACHE_TYPE=q8_0`
- Reduce `OLLAMA_CONTEXT_LENGTH`
- Set `OLLAMA_MAX_LOADED_MODELS=1`

**Issue: Poor quality with q4_0**
- Switch to `q8_0` instead
- Reduce context length
- Use smaller models

---

## 🎓 SUMMARY

**For WEBWAIFU users:**

1. **Set these environment variables BEFORE starting Ollama**
2. **Restart Ollama server**
3. **Your unified LLM code will automatically use these optimizations**
4. **No need to pass flash_attention/mmap per-request - they're baked in!**

The unified system sends requests to Ollama's OpenAI endpoint, which uses whatever system-level settings you configured!
