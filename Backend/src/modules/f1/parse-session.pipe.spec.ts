import { BadRequestException } from '@nestjs/common';

import { ParseSessionPipe } from './parse-session.pipe';

describe('ParseSessionPipe', () => {
  const pipe = new ParseSessionPipe();

  it('accepts practice, qualifying, sprint and race codes', () => {
    expect(
      ['FP1', 'FP3', 'Q', 'SQ', 'S', 'R'].map((code) => pipe.transform(code)),
    ).toEqual(['FP1', 'FP3', 'Q', 'SQ', 'S', 'R']);
  });

  it('rejects unknown or differently cased codes', () => {
    expect(() => pipe.transform('fp1')).toThrow(BadRequestException);
  });
});
