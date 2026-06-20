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
        body: 'A conventional weekend has three free-practice sessions (FP1–FP3), qualifying, and the race. Sprint weekends replace FP2/FP3 with a Sprint Qualifying and a short Sprint race that also pays points.',
      },
      {
        heading: 'Qualifying',
        body: 'Qualifying is split into Q1, Q2 and Q3. The slowest five drivers are eliminated after Q1 and again after Q2, leaving the top ten to fight for pole position in Q3. Your fastest single lap sets your grid slot.',
      },
      {
        heading: 'Points',
        body: 'The top ten finishers score 25-18-15-12-10-8-6-4-2-1. One bonus point is awarded for the fastest lap if that driver finishes in the top ten. Sprints pay points to the top eight.',
      },
      {
        heading: 'Pit stops & tyres',
        body: 'In a dry race each car must use at least two of the three slick compounds. Pit crews change four wheels in around two seconds; an unsafe release or speeding in the pit lane brings a penalty.',
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
        body: 'Wings and the floor turn airflow into downward force, pressing the tyres into the track for huge cornering grip. At speed a modern car generates far more than its own weight in downforce.',
      },
      {
        heading: 'Ground effect',
        body: 'Current cars use shaped underfloor tunnels (a Venturi) to accelerate air beneath the car, creating a low-pressure zone that sucks it to the track — efficient downforce with less drag than wings alone.',
      },
      {
        heading: 'DRS',
        body: 'The Drag Reduction System opens a flap in the rear wing to cut drag and boost straight-line speed. It can be used in designated zones when a driver is within one second of the car ahead, aiding overtaking.',
      },
      {
        heading: 'Dirty air',
        body: 'A car following closely runs in the turbulent wake of the car ahead, losing downforce and grip. Reducing this "dirty air" sensitivity was a core goal of the ground-effect regulations.',
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
        heading: 'Compounds',
        body: 'Pirelli brings three dry compounds per event from its range (C1 hardest to C5 softest), labelled Hard, Medium and Soft for the weekend. Softer tyres are faster but wear out sooner.',
      },
      {
        heading: 'The undercut & overcut',
        body: 'Pitting earlier than a rival for fresh tyres (the undercut) can leapfrog them as their old tyres fade. Staying out longer on tyres that are still working (the overcut) can do the same in other conditions.',
      },
      {
        heading: 'Degradation',
        body: 'As tyres lose performance, lap times climb. Teams model "deg" to pick the number of stops and when to make them — a one-stop can beat a two-stop if the tyres last.',
      },
      {
        heading: 'Wet weather',
        body: 'Intermediates clear standing water on a damp track; full wets handle heavy rain. Choosing the right moment to switch between slicks and wets often wins or loses a race.',
      },
    ],
  },
  {
    slug: 'flags',
    title: 'Race Flags',
    tagline: 'The language marshals use to talk to drivers',
    accent: 'accent',
    sections: [
      {
        heading: 'Yellow & green',
        body: 'A yellow flag means danger ahead — slow down and no overtaking. Double yellow means be prepared to stop. Green signals the hazard is cleared and racing resumes.',
      },
      {
        heading: 'Red flag',
        body: 'The session is stopped, usually for a serious incident or unsafe conditions. Cars return to the pit lane and the race may later be restarted.',
      },
      {
        heading: 'Blue flag',
        body: 'Shown to a slower car (often being lapped) to let a faster car through. Ignore three blue flags and you risk a penalty.',
      },
      {
        heading: 'Black & white and beyond',
        body: 'A black-and-white flag is a warning for unsportsmanlike behaviour. The chequered flag, of course, signals the end of the session — the moment everyone is racing toward.',
      },
    ],
  },
];

export function getTopic(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.slug === slug);
}
