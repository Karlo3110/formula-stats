import { Injectable } from '@nestjs/common';
import type { F1Event, F1SessionResult, F1TrackMap } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

interface EventInput {
  roundNumber: number;
  eventName: string;
  country: string;
  location: string;
  eventDate: Date | null;
}

interface ResultInput {
  position: number | null;
  driverNumber: string;
  abbreviation: string;
  fullName: string;
  teamName: string;
  points: number;
  status: string;
  gridPosition: number | null;
  laps: number | null;
  timeSeconds: number | null;
  teamColor: string | null;
  headshotUrl: string | null;
  countryCode: string | null;
}

@Injectable()
export class F1Repository {
  constructor(private readonly prisma: PrismaService) {}

  findEventsBySeason(season: number): Promise<F1Event[]> {
    return this.prisma.f1Event.findMany({
      where: { season },
      orderBy: { roundNumber: 'asc' },
    });
  }

  async replaceEvents(season: number, events: EventInput[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.f1Event.deleteMany({ where: { season } }),
      this.prisma.f1Event.createMany({
        data: events.map((event) => ({ season, ...event })),
      }),
    ]);
  }

  findResults(
    season: number,
    roundNumber: number,
    session: string,
  ): Promise<F1SessionResult[]> {
    return this.prisma.f1SessionResult.findMany({
      where: { season, roundNumber, session },
      orderBy: { position: 'asc' },
    });
  }

  async replaceResults(
    season: number,
    roundNumber: number,
    session: string,
    results: ResultInput[],
    detailVersion: number,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.f1SessionResult.deleteMany({
        where: { season, roundNumber, session },
      }),
      this.prisma.f1SessionResult.createMany({
        data: results.map((result) => ({
          season,
          roundNumber,
          session,
          detailVersion,
          ...result,
        })),
      }),
    ]);
  }

  findTrackMap(
    season: number,
    roundNumber: number,
    session: string,
  ): Promise<F1TrackMap | null> {
    return this.prisma.f1TrackMap.findFirst({
      where: { season, roundNumber, session },
    });
  }

  async replaceTrackMap(
    season: number,
    roundNumber: number,
    session: string,
    points: number[][],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.f1TrackMap.deleteMany({
        where: { season, roundNumber, session },
      }),
      this.prisma.f1TrackMap.create({
        data: { season, roundNumber, session, points },
      }),
    ]);
  }
}
