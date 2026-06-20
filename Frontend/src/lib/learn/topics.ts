export type TopicAccent = 'primary' | 'accent';

export interface LearnSection {
  heading: string;
  body: string;
}

export interface LearnTopic {
  slug: string;
  title: string;
  tagline: string;
  accent: TopicAccent;
  sections: LearnSection[];
}

export const LEARN_TOPICS: ReadonlyArray<LearnTopic> = [
  {
    slug: 'rulebook',
    title: 'Rulebook',
    tagline: 'How a Grand Prix weekend actually works',
    accent: 'primary',
    sections: [
      {
        heading: 'The weekend format',
        body: 'A conventional Grand Prix runs over three days. Friday has two one-hour free-practice sessions (FP1 and FP2), Saturday adds a final practice (FP3) followed by qualifying, and Sunday is the race. Teams use practice to tune the car to the circuit — ride height, wing levels, brake cooling, differential and suspension — and to gather tyre-degradation data that shapes their Sunday strategy.',
      },
      {
        heading: 'Sprint weekends',
        body: 'On a handful of rounds the format changes. FP2 and FP3 are replaced by a Sprint Qualifying (SQ1/SQ2/SQ3) and a short ~100 km Sprint race. The Sprint sets nothing for the Grand Prix grid — that still comes from normal qualifying — but it pays points to the top eight and gives teams only a single hour of practice before everything counts.',
      },
      {
        heading: 'Qualifying explained',
        body: 'Qualifying is three knockout segments. In Q1 (18 minutes) the five slowest cars are eliminated and fill the back of the grid. Q2 (15 minutes) eliminates another five. The remaining ten contest Q3 (12 minutes) for pole position. Only your single fastest lap counts, so drivers balance fuel load, tyre temperature and traffic to nail one perfect lap.',
      },
      {
        heading: 'How points are scored',
        body: 'The top ten finishers score 25-18-15-12-10-8-6-4-2-1. A single bonus point goes to the driver who sets the fastest lap, provided they finish in the top ten. Points feed two championships at once: the Drivers’ title and the Constructors’ title, where both cars from a team contribute.',
      },
      {
        heading: 'Pit stops & the two-compound rule',
        body: 'In a dry race every car must use at least two of the three nominated slick compounds, which forces a minimum of one pit stop. A full stop — four wheels changed — takes around two seconds. Speeding in the pit lane or an unsafe release into another car’s path earns a time penalty.',
      },
      {
        heading: 'Parc fermé',
        body: 'From the start of qualifying the cars enter “parc fermé”, a state in which teams may only make a short list of permitted changes. Touch anything else — a different wing, a setup change to suit the weather — and the driver must start from the pit lane. It exists to stop teams running a low-downforce qualifying car and a different race car.',
      },
    ],
  },
  {
    slug: 'aerodynamics',
    title: 'Aerodynamics',
    tagline: 'Why an F1 car could (almost) drive on the ceiling',
    accent: 'accent',
    sections: [
      {
        heading: 'Downforce',
        body: 'Wings and the floor turn airflow into downward force that presses the tyres into the track, multiplying grip far beyond what rubber alone could give. At high speed a modern car generates more downforce than its own weight — which is where the “drive on the ceiling” idea comes from. More grip means later braking, higher cornering speed and faster lap times.',
      },
      {
        heading: 'Drag — the trade-off',
        body: 'Every surface that makes downforce also creates drag, the force that resists forward motion and costs top speed. Setup is a constant compromise: Monaco runs maximum wing for its corners, while Monza strips wing away for the long straights. Engineers chase the most downforce for the least drag — “aero efficiency.”',
      },
      {
        heading: 'Ground effect',
        body: 'The current cars are “ground-effect” cars. Shaped tunnels under the floor (a Venturi) accelerate air beneath the car, dropping its pressure and sucking the car toward the track. Because it works under the car rather than on big wings, ground effect produces grip with far less drag — and it’s why the floor is the single most important aerodynamic part today.',
      },
      {
        heading: 'DRS',
        body: 'The Drag Reduction System opens a flap in the rear wing on straights to cut drag and add roughly 10–15 km/h. A driver may use it only in marked DRS zones and only when within one second of the car ahead (measured at a detection point), which makes overtaking possible without removing the challenge.',
      },
      {
        heading: 'Dirty air & the 2022 rules',
        body: 'A car following closely sits in the turbulent wake — “dirty air” — of the car ahead, losing downforce and grip and making it hard to stay close enough to attack. The 2022 ground-effect regulations were designed specifically to push that wake upward and let cars follow more closely, improving racing.',
      },
      {
        heading: 'Cooling & the unseen aero',
        body: 'Aerodynamics isn’t only about speed: air must be fed to the radiators, brakes and power unit. Bodywork is sculpted to swallow exactly enough cooling air and no more, because every opening adds drag. Get it wrong and the car overheats; over-cool it and you give away lap time.',
      },
    ],
  },
  {
    slug: 'tyres',
    title: 'Tyres & Strategy',
    tagline: 'The black art that decides most races',
    accent: 'primary',
    sections: [
      {
        heading: 'The compounds',
        body: 'Pirelli has a range of dry compounds from C0 (hardest) to C6 (softest) and brings three of them to each event, badged for the weekend as Hard, Medium and Soft. Softer rubber grips better and is faster over one lap, but it overheats and wears out sooner — the central trade-off of every strategy.',
      },
      {
        heading: 'Working range & warm-up',
        body: 'A tyre only performs inside a temperature window. Too cold and it has no grip (a problem on out-laps and in qualifying); too hot and it “grains” or “blisters” and falls away. Getting tyres into their window quickly — and keeping them there — is one of the biggest differences between drivers and teams.',
      },
      {
        heading: 'Degradation',
        body: 'As a tyre wears and overheats it loses grip and lap times climb — “deg.” Teams model deg in practice to decide how many stops to make and when. A car nursing its tyres can run longer and pit later; a car that destroys them must stop more often, trading track position for fresh grip.',
      },
      {
        heading: 'The undercut & the overcut',
        body: 'The undercut: pit before a rival, and your fresh tyres set fast laps while they’re still on worn ones, so you emerge ahead after they stop. The overcut is the opposite — stay out while a rival pits onto cold tyres, bank fast laps, and leapfrog them at your own stop. Which works depends on track temperature and how the tyres behave.',
      },
      {
        heading: 'One stop vs two',
        body: 'A one-stop keeps a car on track but on older, slower tyres; a two-stop is faster on fresh rubber but loses ~20+ seconds in the extra stop and can drop a driver into traffic. The optimum shifts with deg, the chance of a Safety Car, and how easy overtaking is at that circuit.',
      },
      {
        heading: 'Wet weather',
        body: 'In the rain teams switch to grooved tyres: intermediates for a damp or drying track, full wets for standing water. Slicks have no grooves and aquaplane instantly in the wet. Judging the exact lap to swap between slicks and inters — often a few seconds either way — regularly decides wet races.',
      },
    ],
  },
  {
    slug: 'power-unit',
    title: 'Power Unit',
    tagline: 'A 1,000 hp hybrid that sips fuel',
    accent: 'accent',
    sections: [
      {
        heading: 'More than an engine',
        body: 'An F1 “power unit” is a hybrid system: a 1.6-litre turbocharged V6 internal-combustion engine plus electric motors and an energy store. Together they make around 1,000 horsepower while being among the most thermally efficient engines ever built — converting over 50% of the fuel’s energy into motion, far beyond a road car.',
      },
      {
        heading: 'MGU-K and MGU-H',
        body: 'Two motor-generator units recover energy. The MGU-K harvests energy under braking and redeploys it for acceleration. The MGU-H recovers heat energy from the turbocharger’s exhaust, which also eliminates “turbo lag.” The recovered energy is stored in a battery and deployed by the driver and software for extra power.',
      },
      {
        heading: 'Component limits & grid penalties',
        body: 'To control costs, each driver may use only a fixed number of each power-unit element per season (engine, turbo, MGU-K, MGU-H, energy store, control electronics). Exceed the allocation and you take a grid penalty — often dropping places or starting from the back when a fresh engine is fitted.',
      },
      {
        heading: 'Energy management',
        body: 'A lap is a constant negotiation between deploying electrical energy and harvesting it back. Drivers follow delta targets and “modes” to make sure they have a boost available where it matters — defending into a braking zone or attacking onto a straight — without running the battery flat.',
      },
      {
        heading: 'Fuel & flow',
        body: 'Cars run on tightly regulated fuel with a maximum fuel-flow rate, so teams can’t simply pour in more for more power. Saving fuel (“lift and coast”) is sometimes part of the race plan, trading a little lap time for finishing the distance within the allowance.',
      },
    ],
  },
  {
    slug: 'flags',
    title: 'Race Flags',
    tagline: 'The language marshals use to talk to drivers',
    accent: 'primary',
    sections: [
      {
        heading: 'Yellow & green',
        body: 'A single waved yellow means danger ahead — slow down, be ready to change direction, and no overtaking. Double yellow means be prepared to stop; there is a hazard partly or fully blocking the track. A green flag signals the hazard is cleared and racing resumes.',
      },
      {
        heading: 'Safety Car & Virtual Safety Car',
        body: 'When a hazard needs neutralising, the Safety Car leads the field at a controlled pace and bunches them up, often shaking up strategy as cars dive into the pits. The Virtual Safety Car (VSC) instead makes every driver hold a delta time, slowing the whole field without physically gathering them.',
      },
      {
        heading: 'Red flag',
        body: 'A red flag stops the session — usually for a serious crash, debris, or conditions too dangerous to continue. Cars return to the pit lane and the clock may be paused; the race can later be restarted, sometimes from a standing or rolling start.',
      },
      {
        heading: 'Blue flag',
        body: 'Shown to a driver about to be lapped, the blue flag tells them to let the faster, leading car through. Ignore three blue flags and you risk a penalty — back-markers are expected not to hold up the leaders.',
      },
      {
        heading: 'Black, white and chequered',
        body: 'A black-and-white flag is a warning for unsportsmanlike conduct; a black flag (rare) disqualifies a car. The black-with-orange-circle “meatball” flag orders a car with a mechanical problem to pit. And the chequered flag, of course, ends the session — the moment everyone is racing toward.',
      },
    ],
  },
  {
    slug: 'penalties',
    title: 'Penalties & Stewards',
    tagline: 'Who polices the racing, and how',
    accent: 'accent',
    sections: [
      {
        heading: 'The stewards',
        body: 'A panel of stewards — including an experienced ex-driver — reviews incidents during and after each session. They weigh telemetry, video, radio and team representations to decide who, if anyone, was “predominantly to blame,” and what penalty fits.',
      },
      {
        heading: 'In-race penalties',
        body: 'Common penalties are 5- or 10-second time penalties (served at the next stop or added to the final time), drive-through and stop-go penalties served in the pit lane, and penalty points on the licence. Twelve penalty points in a 12-month window triggers a one-race ban.',
      },
      {
        heading: 'Track limits',
        body: 'Drivers must keep at least part of the car within the white lines. Running wide and gaining an advantage gets a lap time deleted in qualifying or a warning, then a penalty, in the race. Modern circuits use sensors and cameras at the most-abused corners to police it automatically.',
      },
      {
        heading: 'Starts and grid',
        body: 'At the start, a car must be stationary in its box; moving before the lights go out is a jump start and brings a penalty. Being out of position, crossing the pit-exit line, or failing to follow the formation-lap rules can all be punished — the opening seconds are heavily scrutinised.',
      },
    ],
  },
];

export function getTopic(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.slug === slug);
}
