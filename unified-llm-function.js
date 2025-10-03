// UNIFIED LLM FUNCTION - Works for ALL OpenAI-compatible providers
async function callLLM(message, streaming = false, onChunk = null) {
    const provider = LLM_PROVIDERS[llmConfig.provider];

    if (!provider) {
        throw new Error(`Unknown provider: ${llmConfig.provider}`);
    }

    if (!llmConfig.model) {
        throw new Error(`No model selected for ${provider.name}`);
    }

    // Build messages array
    const systemMessage = llmConfig.systemMessage ||
                         document.getElementById('globalSystemMessage')?.value ||
                         'You are a helpful AI assistant.';

    const messages = [
        { role: 'system', content: systemMessage },
        ...conversationHistory,
        { role: 'user', content: message }
    ];

    // Build request body (OpenAI-compatible format)
    const requestBody = {
        model: llmConfig.model,
        messages: messages,
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.maxTokens,
        top_p: llmConfig.topP,
        frequency_penalty: llmConfig.frequencyPenalty,
        presence_penalty: llmConfig.presencePenalty,
        stream: streaming
    };

    // Build headers
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add API key if required
    if (provider.apiKeyRequired && llmConfig.apiKey) {
        if (llmConfig.provider === 'gemini') {
            // Gemini uses query param for some endpoints, but OpenAI-compatible uses header
            headers['x-goog-api-key'] = llmConfig.apiKey;
        } else {
            headers['Authorization'] = `Bearer ${llmConfig.apiKey}`;
        }
    }

    // OpenRouter specific headers
    if (llmConfig.provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'WEBWAIFU';
    }

    const endpoint = `${provider.baseUrl}/chat/completions`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${provider.name} API error (${response.status}): ${errorText}`);
        }

        // STREAMING RESPONSE
        if (streaming) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';
            let currentSentence = '';

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || line.trim() === 'data: [DONE]') continue;

                    const jsonStr = line.replace(/^data: /, '');
                    if (!jsonStr.trim()) continue;

                    try {
                        const data = JSON.parse(jsonStr);
                        const content = data.choices?.[0]?.delta?.content || '';

                        if (content) {
                            fullResponse += content;
                            currentSentence += content;

                            // Sentence boundary detection
                            const sentenceEnders = /[.!?]\s/g;
                            let match;
                            let lastIndex = 0;

                            while ((match = sentenceEnders.exec(currentSentence)) !== null) {
                                const sentence = currentSentence.substring(lastIndex, match.index + 1).trim();
                                if (sentence && onChunk) {
                                    onChunk(sentence);
                                }
                                lastIndex = match.index + match[0].length;
                            }

                            currentSentence = currentSentence.substring(lastIndex);
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse streaming chunk:', parseError);
                    }
                }
            }

            // Send any remaining text
            if (currentSentence.trim() && onChunk) {
                onChunk(currentSentence.trim());
            }

            return fullResponse.trim();
        }
        // NON-STREAMING RESPONSE
        else {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            return content.trim();
        }
    } catch (error) {
        console.error(`${provider.name} API error:`, error);
        throw error;
    }
}

// Wrapper functions for backwards compatibility
async function getOllamaResponseStreaming(message, onSentence) {
    return await callLLM(message, true, onSentence);
}

async function getOllamaResponse(message) {
    return await callLLM(message, false);
}

async function getOpenAIResponseStreaming(message, onSentence) {
    return await callLLM(message, true, onSentence);
}

async function getOpenAIResponse(message) {
    return await callLLM(message, false);
}

async function getGeminiResponseStreaming(message, onSentence) {
    return await callLLM(message, true, onSentence);
}

async function getGeminiResponse(message) {
    return await callLLM(message, false);
}
