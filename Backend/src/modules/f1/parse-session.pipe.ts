import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

/** FastF1 session identifiers the data service understands. */
export const SESSION_CODES = [
  'FP1',
  'FP2',
  'FP3',
  'Q',
  'SQ',
  'SS',
  'S',
  'R',
] as const;

export type SessionCode = (typeof SESSION_CODES)[number];

function isSessionCode(value: string): value is SessionCode {
  return (SESSION_CODES as ReadonlyArray<string>).includes(value);
}

/** Rejects anything but a known session code before it reaches the cache or upstream. */
@Injectable()
export class ParseSessionPipe implements PipeTransform<string, SessionCode> {
  transform(value: string): SessionCode {
    if (!isSessionCode(value)) {
      throw new BadRequestException(
        `Unknown session "${value}". Expected one of ${SESSION_CODES.join(', ')}.`,
      );
    }
    return value;
  }
}
