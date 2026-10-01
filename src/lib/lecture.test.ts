import { describe, expect, it } from 'vitest';
import { fixtureLecture } from './fixture';
import { lectureNoteSchema, parseLectureNote } from './lecture';

describe('LectureNote contract', () => {
  it('accepts the canonical fixture', () => {
    expect(parseLectureNote(fixtureLecture)).toEqual(fixtureLecture);
  });

  it('rejects malformed timestamps and missing required content', () => {
    const invalid = structuredClone(fixtureLecture) as any;
    invalid.sections[0].timeStart = '18 minutes';
    invalid.sections[0].heading = '';
    expect(() => lectureNoteSchema.parse(invalid)).toThrow();
  });

  it('requires stable section and visual identifiers', () => {
    const invalid = structuredClone(fixtureLecture) as any;
    invalid.sections[0].id = '';
    expect(() => parseLectureNote(invalid)).toThrow();
  });
});
