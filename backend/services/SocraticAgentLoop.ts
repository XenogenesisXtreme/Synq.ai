import { MPSModelRouter } from './MPSModelRouter';
export interface SocraticResult { message: string; updatedGaps: string[]; }

export class SocraticAgentLoop {
  private router = new MPSModelRouter();
  public async processUserInteraction(currentGaps: string[], chatHistory: any[]): Promise<SocraticResult> {
    const payload = {
      messages: [
        { role: 'system' as const, content: 'You are a sub-500ms real-time Socratic tutor. Address student gaps: [' + currentGaps.join(', ') + ']. Keep messages under 2 short sentences. Append exactly this parsing block to the absolute end of your response text: |GAPS: gap1, gap2|' },
        ...chatHistory
      ],
      temperature: 0.4
    };
    const res = await this.router.executeTask('interactivity', payload);
    const raw = res.choices[0].message.content || '';
    if (!raw.includes('|GAPS:')) return { message: raw.trim(), updatedGaps: currentGaps };
    const parts = raw.split('|GAPS:');
    return {
      message: parts[0].trim(),
      updatedGaps: parts[1] ? parts[1].replace('|', '').split(',').map(s => s.trim()).filter(Boolean) : currentGaps
    };
  }
}
