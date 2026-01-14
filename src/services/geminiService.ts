import OpenAI from 'openai';

// 不同提供商的默认配置
const PROVIDER_CONFIGS = {
  siliconflow: {
    baseURL: 'https://api.siliconflow.cn/v1',
    defaultModel: 'Pro/Qwen/Qwen2-VL-72B-Instruct',
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3-haiku:beta',
  },
  tongyi: {
    baseURL: '/api/tongyi',
    defaultModel: 'qwen-image-edit-plus',
  },
};

export async function processIDPhoto(
  base64Image: string,
  backgroundColor: string,
  beautify: boolean = true,
  apiConfig: { provider: string; apiKey: string; baseURL: string; model: string }
): Promise<string | null> {
  try {
    // 通义千问特殊处理
    if (apiConfig.provider === 'tongyi') {
      const promptText = `Professional ID photo transformation task:
         1. Remove the current background and replace it with a perfectly flat, solid ${backgroundColor} color.
         2. ${beautify ? "Apply professional portrait retouching: smooth the skin naturally, enhance eyes, adjust lighting to be even across the face, and fix minor stray hairs." : ""}
         3. Ensure the person is centered and the lighting is professional studio quality.
         4. Return the modified image in base64 format.`;

      // 在开发环境中使用代理，在生产环境中直接调用阿里云API
      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment
        ? '/api/tongyi/api/v1/services/aigc/multimodal-generation/generation'
        : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-image-edit-plus',
          input: {
            messages: [
              {
                role: "user",
                content: [
                  {
                    image: base64Image,
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
          },
          parameters: {
            n: 1,
            negative_prompt: "低质量",
            prompt_extend: true,
            watermark: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;

        // 提供更友好的错误信息
        if (response.status === 0) {
          errorMessage = '网络连接失败。可能是CORS策略阻止了请求。在生产环境中，您可能需要部署一个后端代理服务器。';
        } else if (response.status === 401) {
          errorMessage = 'API密钥无效或已过期。请检查您的通义千问API密钥。';
        } else if (response.status === 429) {
          errorMessage = 'API调用频率过高，请稍后再试。';
        } else if (response.status >= 500) {
          errorMessage = '服务器错误，请稍后再试。';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // 解析通义千问的响应格式
      if (data.output && data.output.choices && data.output.choices.length > 0) {
        const choice = data.output.choices[0];
        if (choice.message && choice.message.content && choice.message.content.length > 0) {
          const content = choice.message.content[0];
          if (content.image) {
            const imageUrl = content.image;
            // 如果返回的是URL，需要下载图片并转换为base64
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(imageBlob);
            });
          }
        }
      }

      return null;
    }

    // 其他提供商使用OpenAI兼容接口
    const client = new OpenAI({
      apiKey: apiConfig.apiKey,
      baseURL: apiConfig.baseURL,
      dangerouslyAllowBrowser: true, // 允许在浏览器中使用
    });

    // 根据提供商调整提示词
    const promptText = apiConfig.provider === 'openrouter'
      ? `Please transform this photo into a professional ID photo with the following requirements:
         1. Change the background to a solid ${backgroundColor} color.
         2. ${beautify ? "Apply professional photo retouching: smooth skin naturally, enhance eyes, adjust lighting evenly, and fix any stray hairs." : ""}
         3. Center the person and ensure studio-quality lighting.
         4. Return ONLY the modified image as a base64 data URL, no additional text or explanations.`
      : `Professional ID photo transformation task:
         1. Remove the current background and replace it with a perfectly flat, solid ${backgroundColor} color.
         2. ${beautify ? "Apply professional portrait retouching: smooth the skin naturally, enhance eyes, adjust lighting to be even across the face, and fix minor stray hairs." : ""}
         3. Ensure the person is centered and the lighting is professional studio quality.
         4. The output must be ONLY the modified image in base64 format without any additional text or explanations.`;

    const response = await client.chat.completions.create({
      model: apiConfig.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
            {
              type: "text",
              text: promptText,
            },
          ],
        },
      ],
      max_tokens: apiConfig.provider === 'openrouter' ? 4096 : 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (content && content.includes('data:image')) {
      // 如果AI返回的是base64图片数据
      return content;
    } else if (content) {
      // 尝试从响应中提取base64数据
      const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
      if (base64Match) {
        return base64Match[0];
      }
    }

    return null;
  } catch (error) {
    console.error(`${apiConfig.provider} processing failed:`, error);
    throw error;
  }
}

// 获取提供商的可用模型列表
export function getProviderModels(provider: string) {
  const models = {
    siliconflow: [
      { value: 'Pro/Qwen/Qwen2-VL-72B-Instruct', label: 'Qwen2-VL-72B (推荐)' },
      { value: 'Pro/Qwen/Qwen2-VL-7B-Instruct', label: 'Qwen2-VL-7B (快速)' },
      { value: 'stabilityai/stable-diffusion-3-medium', label: 'Stable Diffusion 3' },
      { value: 'blackforestlabs/FLUX.1-schnell', label: 'FLUX.1-schnell' },
    ],
    openrouter: [
      { value: 'anthropic/claude-3-haiku:beta', label: 'Claude 3 Haiku (推荐)' },
      { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
      { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'openai/gpt-4o', label: 'GPT-4o' },
      { value: 'google/gemini-pro-vision', label: 'Gemini Pro Vision' },
      { value: 'meta-llama/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 Vision' },
    ],
    tongyi: [
      { value: 'qwen-image-edit-plus', label: 'Qwen-Image-Edit-Plus (推荐)' },
    ],
  };
  return models[provider as keyof typeof models] || [];
}

// 获取提供商的默认配置
export function getProviderConfig(provider: string) {
  return PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS] || PROVIDER_CONFIGS.siliconflow;
}