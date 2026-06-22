import type { LearnTopic } from '@/lib/learn/types';

export const flags: LearnTopic = {
  slug: 'flags',
  title: 'Race Flags',
  tagline: 'The language marshals use to talk to drivers',
  description:
    'Long before radios, flags were how a race spoke to its drivers — and they remain the official signals today, mirrored on each car’s dashboard. This course explains what each flag means and how the race is neutralised when something goes wrong, ending with a one-glance summary of every signal.',
  accent: 'primary',
  level: 'Beginner',
  chapters: [
    {
      slug: 'yellow-and-green',
      title: 'Yellow & Green',
      summary: 'The core danger and all-clear signals.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Yellow is the language of danger, and it comes in two strengths. A **single waved yellow** means there is a hazard ahead — slow down, be ready to change direction, and absolutely no overtaking. A **double waved yellow** is far more serious: be prepared to stop, because something is partly or fully blocking the track.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'No overtaking under yellow',
          text: 'Passing under yellow flags is one of the most heavily punished offences, because it puts a car at speed right where marshals or a stranded car may be. Drivers must visibly lift.',
        },
        {
          type: 'paragraph',
          text: 'The **green flag** is the all-clear: the hazard is gone and normal racing resumes. It is shown at the end of the yellow zone so a driver knows the exact point where they can race — and overtake — again.',
        },
      ],
      takeaways: [
        'Single yellow: danger ahead, slow down, no overtaking.',
        'Double yellow: be ready to stop, track is blocked.',
        'Green: hazard cleared, racing resumes.',
      ],
    },
    {
      slug: 'safety-car-vsc',
      title: 'Safety Car & VSC',
      summary: 'Two ways to neutralise the whole field.',
      blocks: [
        {
          type: 'paragraph',
          text: 'When a hazard is too big for local yellows, the whole race is neutralised. There are two tools for this, and the difference between them shapes strategy enormously.',
        },
        {
          type: 'terms',
          items: [
            {
              term: 'Safety Car (SC)',
              definition: 'A real car takes to the track and leads the field at a controlled pace, physically bunching everyone together into a queue.',
            },
            {
              term: 'Virtual Safety Car (VSC)',
              definition: 'No physical car — instead every driver must hold a set delta time, slowing the whole field while keeping the gaps between them.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Why the Safety Car shakes up races',
          text: 'Because the Safety Car bunches the field, a pit stop taken behind it costs far less time than usual — the leaders cannot drive away while you stop. A well-timed Safety Car can rescue a race; a badly timed one can ruin a perfect strategy.',
        },
      ],
      takeaways: [
        'The Safety Car physically leads and bunches the field at reduced speed.',
        'The VSC slows everyone via a delta time without closing the gaps.',
        'Stopping under a Safety Car is cheap, so it can transform strategy.',
      ],
    },
    {
      slug: 'red-flag',
      title: 'The Red Flag',
      summary: 'Stopping the session entirely.',
      blocks: [
        {
          type: 'paragraph',
          text: 'A **red flag** stops the session altogether — shown for a serious crash, dangerous debris, or conditions (usually heavy rain) too dangerous to continue. Cars slow immediately and return to the pit lane, and the clock may be paused.',
        },
        {
          type: 'paragraph',
          text: 'A red-flagged race can later be restarted, sometimes from a standing start on the grid and sometimes rolling behind the Safety Car. A red flag also hands teams a free opportunity to work on the cars — including, often, fitting fresh tyres without losing track position, which can completely reset the strategic picture.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'A red flag can rewrite a race',
          text: 'Because teams can change tyres during the stoppage, a driver who already pitted can be leapfrogged by rivals who hadn’t — a quirk that has decided several major races.',
        },
      ],
      takeaways: [
        'A red flag halts the session for serious danger.',
        'Cars return to the pits; the race may restart standing or rolling.',
        'Free tyre changes during a stoppage can upend the strategic order.',
      ],
    },
    {
      slug: 'blue-flag',
      title: 'The Blue Flag',
      summary: 'Telling a slower car to move aside.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The **blue flag** is shown to a driver who is about to be **lapped** — that is, caught by the race leaders who are a full lap ahead. It tells them to let the faster car through at the first safe opportunity.',
        },
        {
          type: 'paragraph',
          text: 'Back-markers are expected not to interfere with the cars fighting for position at the front. Ignore the blue flags — typically three in a row — and the lapped driver risks a penalty for holding up the leaders.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Being lapped vs being overtaken',
          text: 'A blue flag is not about position in your own battle — it is purely about getting out of the way of cars a whole lap quicker. You keep your own position; you just don’t obstruct the leaders.',
        },
      ],
      takeaways: [
        'The blue flag warns a driver they are about to be lapped.',
        'They must let the faster, leading car past safely.',
        'Repeatedly ignoring blue flags brings a penalty.',
      ],
    },
    {
      slug: 'special-flags',
      title: 'Black, White & Special Flags',
      summary: 'Warnings, disqualifications and the chequered flag.',
      blocks: [
        {
          type: 'paragraph',
          text: 'A handful of less-common flags carry specific, pointed messages — from a warning about driving standards to an order to come straight to the pits.',
        },
        {
          type: 'list',
          items: [
            '**Black-and-white flag:** a warning, usually for unsportsmanlike driving — the equivalent of a yellow card.',
            '**Black flag:** a disqualification; the car must return to the pits and its race is over (very rare).',
            '**Black with orange circle (“meatball”):** a car has a mechanical problem or dangerous damage and must pit to fix it.',
            '**Chequered flag:** the session is over — the moment everyone is racing toward.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'On the dashboard too',
          text: 'Every flag is mirrored by lights on the car’s steering-wheel display and around the circuit, so a driver never has to rely on spotting a marshal at 300 km/h.',
        },
      ],
      takeaways: [
        'Black-and-white = warning; black = disqualification.',
        'The “meatball” flag orders a damaged car to pit.',
        'The chequered flag ends the session.',
      ],
    },
    {
      slug: 'flag-summary',
      title: 'Flag Summary',
      summary: 'Every flag and its meaning, at a glance.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Here is the whole flag vocabulary in one place — a quick reference you can scan before or during any race.',
        },
        {
          type: 'table',
          caption: 'The complete F1 flag reference',
          columns: ['Flag', 'Meaning'],
          rows: [
            ['Green', 'All clear — racing resumes'],
            ['Single yellow', 'Danger ahead, slow, no overtaking'],
            ['Double yellow', 'Be ready to stop, track blocked'],
            ['Red', 'Session stopped'],
            ['Blue', 'Let the lapping car past'],
            ['Yellow & red stripes', 'Slippery surface (oil, water, debris)'],
            ['White', 'Slow vehicle on track ahead'],
            ['Black & white', 'Warning for conduct'],
            ['Black/orange circle', 'Mechanical problem — pit now'],
            ['Black', 'Disqualified'],
            ['Chequered', 'Session over'],
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'The two you’ll see most',
          text: 'In a typical race the flags you’ll actually notice are yellows (an incident somewhere on track) and blue (leaders lapping back-markers). The rest are the exceptions — and now you know them all.',
        },
      ],
      takeaways: [
        'Yellows and blue are the everyday flags; the rest are exceptions.',
        'Yellow-and-red stripes warn of a slippery surface; white warns of a slow vehicle.',
        'Keep this table handy as a one-glance reference.',
      ],
    },
  ],
};
