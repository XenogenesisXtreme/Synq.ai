import { OpenAI } from 'openai';
export type TierType = 'ingestion' | 'reasoning' | 'interactivity';
export interface RouterConfig { apiKey: string; baseURL: string; model: string; }
export interface PayloadConfig { messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>; response_format?: { type: 'text' | 'json_object' }; temperature?: number; }

export class MPSModelRouter {
  private providers: Record<TierType, RouterConfig[]>;
  constructor() {
    this.providers = {
      ingestion: [{ apiKey: process.env.GEMINI_API_KEY || 'mock-key', baseURL: 'https://googleapis.com', model: 'gemini-1.5-flash' }],
      reasoning: [
        { apiKey: process.env.OPENROUTER_API_KEY || 'mock-key', baseURL: 'https://openrouter.ai', model: 'deepseek/deepseek-r1:free' },
        { apiKey: process.env.GROQ_API_KEY || 'mock-key', baseURL: 'https://groq.com', model: 'llama-3.3-70b-specdec' }
      ],
      interactivity: [{ apiKey: process.env.GROQ_API_KEY || 'mock-key', baseURL: 'https://groq.com', model: 'llama-3.3-70b-versatile' }]
    };
  }
  public async executeTask(tier: TierType, payload: PayloadConfig, retryCount = 0): Promise<any> {
    const configList = this.providers[tier];
    const config = retryCount < configList.length ? configList[retryCount] : configList[0];
    const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, dangerouslyAllowBrowser: false });
    try {
      const response = await client.chat.completions.create({ model: config.model, messages: payload.messages, response_format: payload.response_format, temperature: payload.temperature ?? 0.2 });
      if (!response.choices?.length) throw new Error('Empty response');
      return response;
    } catch (error: any) {
      if (retryCount + 1 < configList.length) {
        await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
        return this.executeTask(tier, payload, retryCount + 1);
      }
      throw new Error(`[Circuit Breaker Failure] Exhausted tier: ${tier}. Error: ${error.message}`);
    }
  }
}
