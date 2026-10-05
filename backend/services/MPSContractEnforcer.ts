import { MPSModelRouter } from './MPSModelRouter';
export interface MPSBlock { type: 'definition' | 'explanation' | 'misconception' | 'knowledge_check' | 'summary'; concept: string; content: string; metadata?: { source_timestamp?: string; trap_warning?: string; question_options?: string[]; }; }

export class MPSContractEnforcer {
  private router = new MPSModelRouter();
  public async transformMaterial(rawText: string): Promise<MPSBlock[]> {
    if (!rawText?.trim()) throw new Error('Input missing');
    const payload = {
      messages: [
        { role: 'system' as const, content: 'You are the core Master Pedagogy Skill (MPS) compiler for Synq.ai. Convert input into a strictly verified JSON object matching this schema exactly: { "blocks": Array<{ "type": "definition" | "explanation" | "misconception" | "knowledge_check" | "summary", "concept": string, "content": string, "metadata": { "source_timestamp": string, "trap_warning": string, "question_options": string[] } }> } Answer inside pure JSON format only.' },
        { role: 'user' as const, content: 'Deconstruct this text: ' + rawText }
      ],
      response_format: { type: 'json_object' as const },
      temperature: 0.1
    };
    const res = await this.router.executeTask('reasoning', payload);
    try {
      const parsed = JSON.parse(res.choices[0].message.content || '{}');
      for (const b of parsed.blocks) {
        if (!['definition', 'explanation', 'misconception', 'knowledge_check', 'summary'].includes(b.type) || !b.concept || !b.content) throw new Error('Field mismatch');
      }
      return parsed.blocks as MPSBlock[];
    } catch (e: any) { throw new Error('Validation Contract Failure: ' + e.message); }
  }
}
