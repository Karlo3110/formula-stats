import type { LearnTopic } from '@/lib/learn/types';

export const penalties: LearnTopic = {
  slug: 'penalties',
  title: 'Penalties & Stewards',
  tagline: 'Who polices the racing, and how',
  description:
    'Wheel-to-wheel racing needs a referee. In Formula 1 that job falls to the stewards, who judge incidents and hand out a graded set of penalties. This course explains who they are, the tools they use, and the rules — track limits, starts, penalty points — that drivers are judged against.',
  accent: 'accent',
  level: 'Intermediate',
  chapters: [
    {
      slug: 'the-stewards',
      title: 'The Stewards',
      summary: 'Who judges incidents, and how they decide.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Every event is overseen by a panel of **stewards** — the referees of Formula 1. Crucially, the panel includes an experienced ex-driver, so decisions are informed by someone who has actually raced wheel-to-wheel at that level.',
        },
        {
          type: 'paragraph',
          text: 'When an incident happens, the stewards gather evidence — telemetry, onboard and trackside video, team radio, and representations from the teams involved — and decide who, if anyone, was **predominantly to blame**. Their goal is not to punish every touch, but to penalise the driver mainly responsible for an avoidable incident.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: '“Racing incident”',
          text: 'Sometimes the stewards judge that two drivers simply raced hard and neither was mainly at fault. That verdict — a “racing incident” — means no penalty, even after a collision.',
        },
      ],
      takeaways: [
        'Stewards are the referees; the panel includes a former driver.',
        'They weigh telemetry, video, radio and team input.',
        'They penalise the driver “predominantly to blame,” not every contact.',
      ],
    },
    {
      slug: 'in-race-penalties',
      title: 'In-Race Penalties',
      summary: 'The graded menu of punishments, smallest to largest.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Penalties are **graded** to fit the offence, from a few seconds added to a lap all the way to disqualification. Knowing the ladder helps you read a race as it unfolds.',
        },
        {
          type: 'table',
          caption: 'Common penalties, from lightest to heaviest',
          columns: ['Penalty', 'How it is served'],
          rows: [
            ['5-second penalty', 'Added at the next stop, or to the final race time'],
            ['10-second penalty', 'As above, for a more serious offence'],
            ['Drive-through', 'Drive through the pit lane without stopping'],
            ['Stop-go', 'Stop in the pit box for a set time, then go'],
            ['Grid penalty', 'Drop places at the next race’s start'],
            ['Disqualification', 'Removed from the results entirely'],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'A served penalty still costs time',
          text: 'With a 5- or 10-second penalty, the driver’s pit crew may not touch the car until the time has elapsed at their stop — so the clock ticks while everyone waits. It is a real, visible cost, not just an after-the-fact adjustment.',
        },
      ],
      takeaways: [
        'Penalties scale with the offence, up to disqualification.',
        'Time penalties are served at a stop or added to the final time.',
        'Drive-through and stop-go penalties are served live in the pit lane.',
      ],
    },
    {
      slug: 'penalty-points',
      title: 'Penalty Points & Bans',
      summary: 'The licence system that tracks repeat offenders.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Beyond in-race penalties, drivers carry **penalty points** on their superlicence. The stewards add points for incidents they judge a driver responsible for, and those points stick around far longer than a single race.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Twelve points means a ban',
          text: 'Accumulate twelve penalty points within a rolling twelve-month window and you earn an automatic one-race ban. Points drop off exactly twelve months after they were given.',
        },
        {
          type: 'paragraph',
          text: 'The system is designed to catch a pattern rather than a single mistake. A driver sitting on ten points has to race more carefully, knowing one more incident could put them on the sidelines — a quiet but real pressure across a long season.',
        },
      ],
      takeaways: [
        'Penalty points are added to a driver’s licence for incidents they cause.',
        'Twelve points in twelve months triggers an automatic one-race ban.',
        'Points expire a year after they are issued, so the window keeps rolling.',
      ],
    },
    {
      slug: 'track-limits',
      title: 'Track Limits',
      summary: 'The white lines, and why they are policed so strictly.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The edge of the track is defined by the **white lines**, and a driver must keep at least part of the car within them. Putting **all four wheels** beyond the line is exceeding track limits — and at corners where running wide is faster, it is policed strictly.',
        },
        {
          type: 'list',
          items: [
            'In qualifying, a lap with a track-limits breach is simply deleted.',
            'In the race, repeated breaches earn a warning, then a time penalty.',
            'At the worst-offending corners, sensors and cameras flag breaches automatically.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why it feels fussy',
          text: 'Wide asphalt run-off (instead of old-fashioned grass or gravel) means going off no longer costs lap time naturally — so the rule has to do the job the scenery used to. It is the price of safer run-off areas.',
        },
      ],
      takeaways: [
        'All four wheels beyond the white line exceeds track limits.',
        'Qualifying laps are deleted; race breaches escalate to penalties.',
        'Modern asphalt run-off is why the rule has to be enforced so tightly.',
      ],
    },
    {
      slug: 'starts-and-procedure',
      title: 'Starts & Procedure',
      summary: 'The heavily-scrutinised rules around the grid.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The opening seconds of a race are among the most scrutinised. At the start, a car must be **stationary** in its grid box; move before the five red lights go out and it is a **jump start**, which brings a penalty.',
        },
        {
          type: 'paragraph',
          text: 'There is a web of procedural rules around the grid and the **formation lap**: being out of position, crossing the pit-exit line on the way out, weaving excessively, or failing to follow the start procedure can all be punished. Even small infringements here are caught, because the consequences of a chaotic start are so severe.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'The formation lap matters',
          text: 'On the lap to the grid, drivers warm tyres and brakes by weaving and braking hard — but they must keep position and reach their box in time. Stall or arrive out of place and a penalty, or a start from the back, can follow.',
        },
      ],
      takeaways: [
        'Moving before the lights go out is a jump start and is penalised.',
        'Grid and formation-lap procedure is tightly enforced.',
        'Small start-procedure errors are caught because the stakes are so high.',
      ],
    },
  ],
};
