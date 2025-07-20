# Ollama Setup Guide for WEBWAIFU

**Note:** These instructions are for connecting a remotely hosted version of WEBWAIFU (e.g., from a site like `webwaifu.tiiny.site`) to your local Ollama server. If you are running WEBWAIFU locally, you can simply use `http://localhost:11434` as your Ollama URL.

This guide will walk you through the process of setting up Ollama for use with WEBWAIFU.

## 1. Download and Install Ollama

First, you need to download and install Ollama on your system. You can find the download link on the official Ollama website:

[https://ollama.com/](https://ollama.com/)

Follow the installation instructions for your operating system.

## 2. Expose Ollama to the Network

For WEBWAIFU to communicate with your local Ollama instance, you need to expose it to your network.

1.  **Open Ollama Settings:** Right-click on the Ollama icon in your system tray and select "Settings".
2.  **Allow Network Access:** In the settings, make sure to enable the option that allows Ollama to be exposed to the network. This might be labeled as "Expose on network" or something similar.

## 3. Expose Ollama with VS Code Port Forwarding

The easiest and most secure way to expose your local Ollama instance to a remote WEBWAIFU application is by using VS Code's integrated port forwarding feature. This method doesn't require you to change your firewall settings.

1.  **Open the "Ports" Tab in VS Code:**
    *   In VS Code, open the **"Ports"** tab in the bottom panel.
    *   If you don't see it, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for **"Ports: Focus on Ports View"**.

2.  **Forward a Port:**
    *   In the "Ports" tab, click the **"Forward a Port"** button.
    *   When prompted for the port number, enter `11434` (the default Ollama port) and press Enter.

3.  **Copy the Public URL:**
    *   VS Code will create a secure tunnel and generate a public URL. It will look something like `https://random-name-11434.usw2.devtunnels.ms`.
    *   The "Local Address" should point to `localhost:11434`.
    *   Right-click on the forwarded port entry in the list and select **"Copy Local Address"**. This is the URL you will use in WEBWAIFU.

4.  **Set Port Visibility:**
    *   By default, the forwarded port is **"Private"**. This is more secure, but may require an extra step.
    *   To make it simpler, you can right-click the port in VS Code, select **"Port Visibility"**, and change it to **"Public"**. Public tunnels are easier to connect to but are accessible to anyone with the link.
    *   **If you use a "Private" tunnel**, you may need to open the tunnel URL in your browser first and click a "Continue" button to grant access. WEBWAIFU might appear to hang or not connect until you do this.
    *   **"Public" tunnels** should connect without any extra steps.

## 4. Configure WEBWAIFU

Now, you can configure the WEBWAIFU application to use your newly forwarded Ollama URL.

1.  **Go to AI Configuration:** In the WEBWAIFU interface, open the settings panel and navigate to the **"🤖 AI Configuration"** section.
2.  **Select Ollama:** Choose **"🧠 Ollama (Local)"** from the "AI Provider" dropdown.
3.  **Enter the URL:** In the "Ollama URL" field, paste the URL you copied from VS Code.
4.  **Remove Trailing Slash:** **IMPORTANT:** Ensure the URL does not have a trailing slash (`/`) at the end.
    *   **Correct:** `https://random-name-11434.usw2.devtunnels.ms`
    *   **Incorrect:** `https://random-name-11434.usw2.devtunnels.ms/`

## 5. Select a Model and Chat!

You should now be able to select a model from the "Model" dropdown and start chatting with your local AI!
