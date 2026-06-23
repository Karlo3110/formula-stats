import type { LearnTopic } from '@/lib/learn/types';

export const rulebook: LearnTopic = {
  slug: 'rulebook',
  title: 'Rulebook',
  tagline: 'How a Grand Prix weekend actually works',
  description:
    'Every Formula 1 weekend follows the same rhythm: practice, qualifying, race. This course walks through that rhythm from the first lap of Friday practice to the chequered flag on Sunday — how the running order is decided, how points are won, and the rules that quietly shape every result.',
  accent: 'primary',
  level: 'Beginner',
  chapters: [
    {
      slug: 'the-weekend',
      title: 'The Grand Prix Weekend',
      summary: 'The three-day structure of practice, qualifying and race.',
      blocks: [
        {
          type: 'paragraph',
          text: 'A conventional Grand Prix is spread across three days, and each day has a clear job. Friday is for learning the circuit, Saturday is for finding lap time, and Sunday is for racing. Nothing on Friday or Saturday morning scores a single point — yet those sessions quietly decide most races, because they are where a team turns a generic car into one tuned for this exact track.',
        },
        {
          type: 'subheading',
          text: 'What each session is for',
        },
        {
          type: 'table',
          caption: 'A standard (non-Sprint) Grand Prix weekend',
          columns: ['Day', 'Session', 'Length', 'Purpose'],
          rows: [
            ['Friday', 'Free Practice 1 & 2', '60 min each', 'Baseline setup, first tyre data'],
            ['Saturday', 'Free Practice 3', '60 min', 'Final setup tweaks'],
            ['Saturday', 'Qualifying', '~60 min', 'Sets the grid order'],
            ['Sunday', 'Race', '~90 min / 305 km', 'Points are scored'],
          ],
        },
        {
          type: 'paragraph',
          text: 'In practice the engineers chase the right **setup**: ride height, wing angles, brake cooling, differential and suspension settings. They also run the tyres deliberately hard to measure how quickly they wear — the **degradation** data that shapes Sunday’s strategy. A driver might top a practice session and still be slow on race day, because practice times are run on different fuel loads and tyres.',
        },
        {
          type: 'paragraph',
          text: 'Each session is split into two distinct jobs. A **qualifying simulation** is a low-fuel run on fresh soft tyres to see the car’s outright pace; a **long run** is a heavy-fuel stint that mimics the race to gather degradation data. When pundits say a car “looks strong on the long runs,” they mean its race pace looks better than its single-lap speed — a hint the team may be quicker on Sunday than Saturday suggests.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The track gets faster all weekend',
          text: 'Every car that runs lays down a thin film of rubber, and the racing line gradually “rubbers in,” adding grip. This **track evolution** means lap times tumble across the weekend even if no car changes — so the last runners in qualifying often have the fastest track.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why the race is ~305 km',
          text: 'A Grand Prix runs for the number of laps needed to exceed 305 km (Monaco is the historic exception at ~260 km), or a maximum of two hours of running. That is why lap counts differ from track to track — a short lap simply needs more laps.',
        },
      ],
      takeaways: [
        'A weekend runs Friday practice → Saturday qualifying → Sunday race.',
        'Practice scores nothing but sets up the car and gathers tyre data.',
        'Teams split running into low-fuel qualifying sims and heavy-fuel long runs.',
        'Race distance is the laps needed to pass 305 km, capped at two hours.',
      ],
    },
    {
      slug: 'sprint-weekends',
      title: 'Sprint Weekends',
      summary: 'The compressed format with a short Saturday race for points.',
      blocks: [
        {
          type: 'paragraph',
          text: 'On a handful of rounds each season the format changes to a **Sprint** weekend. The goal is to make every day count: there is only one hour of practice all weekend, and a short race on Saturday pays championship points of its own.',
        },
        {
          type: 'subheading',
          text: 'How the days are rearranged',
        },
        {
          type: 'list',
          items: [
            'Friday: one hour of free practice, then Sprint Qualifying (SQ1, SQ2, SQ3) sets the Sprint grid.',
            'Saturday: the Sprint — a flat-out ~100 km race — followed by normal qualifying for the Grand Prix.',
            'Sunday: the Grand Prix, exactly as on a normal weekend.',
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'The Sprint does not set the Grand Prix grid',
          text: 'A common myth. The Sprint result only orders the Sprint itself. Sunday’s grid still comes from the normal qualifying session held after the Sprint.',
        },
        {
          type: 'paragraph',
          text: 'Sprint points go to the top eight finishers on a reduced scale (8-7-6-5-4-3-2-1). With only a single practice hour, teams have far less time to react to problems, which rewards getting the car right out of the box and punishes anyone chasing a setup all weekend.',
        },
        {
          type: 'paragraph',
          text: 'The compressed format also changes how the Sprint itself is raced. It is short enough to run flat-out on a single set of tyres with no mandatory stop, so it becomes a pure sprint rather than a strategy puzzle. And because the car is locked under **parc fermé** from the start of Sprint Qualifying on Friday, a team that misjudges its setup is stuck with it for the entire weekend.',
        },
      ],
      takeaways: [
        'Sprint weekends have just one practice session.',
        'The Saturday Sprint is a short race that pays points to the top eight.',
        'The Grand Prix grid still comes from normal qualifying, not the Sprint.',
        'The car is locked under parc fermé from Friday, so setup mistakes stick.',
      ],
    },
    {
      slug: 'qualifying',
      title: 'Qualifying Explained',
      summary: 'The three knockout segments that decide the grid.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Qualifying decides the starting order, and it is run as three knockout segments. Only your single fastest lap counts, so the whole hour builds toward one perfect lap with the tyres in their ideal window and a clear stretch of track ahead.',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Q1 — 18 minutes',
              text: 'All twenty cars run. The five slowest are knocked out and fill grid slots 16–20.',
            },
            {
              title: 'Q2 — 15 minutes',
              text: 'The remaining fifteen run again. Another five are eliminated into slots 11–15.',
            },
            {
              title: 'Q3 — 12 minutes',
              text: 'The top ten fight for pole position and the front of the grid.',
            },
          ],
        },
        {
          type: 'paragraph',
          text: 'A qualifying lap is a balancing act. The tyres must be at the right temperature (too cold and there is no grip; too hot and they fall away), the fuel load is as low as the rules allow, and the driver needs a gap to the car ahead so they are not held up or driving in its disturbed air. Get all three right on the same lap and you have pole.',
        },
        {
          type: 'paragraph',
          text: 'Timing the run is its own skill. Because the track rubbers in, the very end of each segment is usually fastest — but waiting too long risks a yellow flag or traffic ruining the lap. On long straights drivers also hunt a **tow**: tucking into the slipstream of a car ahead to cut drag and gain a tenth or two, a favour team-mates sometimes trade deliberately.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Track limits in qualifying',
          text: 'Run even slightly beyond the white lines at the exit of a corner and the lap is deleted instantly. Drivers regularly lose pole to a deleted lap for putting all four wheels off the track.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why pole matters more at some tracks',
          text: 'Where overtaking is hard — Monaco being the extreme — starting position is almost everything, and qualifying effectively decides the race. Where passing is easy, a strong car can recover from a poor grid slot, so qualifying matters less.',
        },
      ],
      takeaways: [
        'Qualifying is three knockout segments: Q1, Q2, Q3.',
        'Five cars drop out after Q1 and Q2; the top ten contest pole in Q3.',
        'Only the single fastest lap counts, and exceeding track limits deletes it.',
        'Timing the run and catching a tow can be worth crucial tenths.',
      ],
    },
    {
      slug: 'points',
      title: 'The Points System',
      summary: 'How finishing positions become two championships.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Only the top ten finishers score in a Grand Prix, on a sliding scale that rewards winning far more than simply finishing. Those same points feed **two** championships at once.',
        },
        {
          type: 'table',
          caption: 'Grand Prix points by finishing position',
          columns: ['Position', 'Points', 'Position', 'Points'],
          rows: [
            ['1st', '25', '6th', '8'],
            ['2nd', '18', '7th', '6'],
            ['3rd', '15', '8th', '4'],
            ['4th', '12', '9th', '2'],
            ['5th', '10', '10th', '1'],
          ],
        },
        {
          type: 'subheading',
          text: 'Two titles from one result',
        },
        {
          type: 'paragraph',
          text: 'The **Drivers’ Championship** goes to the individual with the most points. The **Constructors’ Championship** adds together the points of *both* cars from each team — which is why a team can win the constructors’ title even if neither driver wins the drivers’ title. Prize money is tied largely to the constructors’ standings, so every point from a second car matters enormously.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'How ties are broken',
          text: 'If two drivers or teams finish level on points, the tie is settled by **countback**: whoever has more wins ranks higher, then more second places, then thirds, and so on. A single victory can outweigh a season of consistent podiums.',
        },
        {
          type: 'paragraph',
          text: 'Sprint weekends add a second, smaller pool of points (8 down to 1 for the top eight), so a driver can leave a Sprint round having scored twice. Over a long season those extra points add up, and a title fight has been decided by them before.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The fastest-lap point is gone',
          text: 'For many years a bonus point went to the driver who set the fastest lap (if they finished in the top ten). That bonus was scrapped, so today the only way to score is to finish in the top ten.',
        },
      ],
      takeaways: [
        'Points run 25-18-15-12-10-8-6-4-2-1 for the top ten.',
        'Drivers’ title = best individual; Constructors’ title = both cars combined.',
        'Ties are broken by countback — most wins, then most second places, and so on.',
        'There is no longer a bonus point for fastest lap.',
      ],
    },
    {
      slug: 'pit-stops-and-tyres',
      title: 'Pit Stops & the Tyre Rule',
      summary: 'Why every dry race forces at least one stop.',
      blocks: [
        {
          type: 'paragraph',
          text: 'In a dry race, every car **must** use at least two of the three nominated slick compounds. Because you cannot change compound without stopping, that rule forces a minimum of one pit stop into every dry Grand Prix — the foundation of race strategy.',
        },
        {
          type: 'subheading',
          text: 'Anatomy of a pit stop',
        },
        {
          type: 'paragraph',
          text: 'A full stop changes all four wheels in around **two seconds** — roughly twenty people moving in choreographed unison. Each corner has a three-person crew (one on the gun, one off with the old wheel, one on with the new), with others working the jacks front and rear while a “lollipop” or light system tells the driver when to launch. Modern F1 cars carry enough fuel for the whole race and refuelling is banned, so a stop is purely about tyres.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Where pit stops go wrong',
          text: 'Speeding in the pit lane (the limit is usually 80 km/h) brings a fine or time penalty, and an **unsafe release** — sending a car out into another’s path or with a wheel not properly fitted — earns a penalty too. The lap or two spent driving in and out of the pits is the real cost, which is what makes *when* to stop such a decision.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Wet races change the maths',
          text: 'If the race is declared wet, the two-compound rule is waived — cars can run intermediate or full wet tyres for the whole distance without ever fitting a slick.',
        },
      ],
      takeaways: [
        'A dry race requires at least two different slick compounds, forcing one stop.',
        'A four-wheel pit stop takes around two seconds; refuelling is banned.',
        'Pit-lane speeding and unsafe releases bring penalties.',
        'In a declared-wet race the two-compound rule is waived.',
      ],
    },
    {
      slug: 'parc-ferme',
      title: 'Parc Fermé & Technical Rules',
      summary: 'The locked-down state that stops a car changing between qualifying and the race.',
      blocks: [
        {
          type: 'paragraph',
          text: 'From the moment qualifying starts, each car enters **parc fermé** — a regulated state in which teams may only make a short list of permitted adjustments. The idea is simple: the car you qualify must be, in essence, the car you race.',
        },
        {
          type: 'paragraph',
          text: 'Without this rule a team could bolt on a low-downforce, low-fuel special just for one qualifying lap, then rebuild the car for the race. Parc fermé closes that door. Break it — change a wing setting, swap to a wet setup that is not allowed — and the driver must start from the **pit lane** rather than their earned grid slot.',
        },
        {
          type: 'paragraph',
          text: 'A few changes are still allowed, because they are about safety or conditions rather than performance: teams can adjust the **front-wing flap angle**, change tyres and brakes, top up fluids, and make limited tweaks if the weather turns. Anything beyond that list needs the scrutineers’ sign-off, and doing it without permission is what triggers the pit-lane start.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The cars are scrutineered',
          text: 'Throughout the weekend the FIA’s scrutineers check cars against the technical regulations — dimensions, weight, wing flexibility, fuel sample, plank wear under the floor. A car that fails, even after a points finish, can be **disqualified** from the result entirely.',
        },
      ],
      takeaways: [
        'Parc fermé locks the car’s setup from the start of qualifying.',
        'Only a short list of changes (front-wing flap, tyres, brakes, fluids) is allowed.',
        'Breaking it means starting from the pit lane.',
        'Cars are checked against the technical rules and can be disqualified for failing.',
      ],
    },
  ],
};
