import type { LearnTopic } from '@/lib/learn/types';

export const tyres: LearnTopic = {
  slug: 'tyres',
  title: 'Tyres & Strategy',
  tagline: 'The black art that decides most races',
  description:
    'Four patches of rubber, each the size of a hand, are all that connect a Formula 1 car to the track — and managing them is where races are won and lost. This course covers the compounds, how tyres behave as they heat and wear, and the strategic calls (the undercut, the one-stop, the gamble on rain) that flow from it.',
  accent: 'primary',
  level: 'Intermediate',
  chapters: [
    {
      slug: 'the-compounds',
      title: 'The Compounds',
      summary: 'The trade-off between grip and durability, colour-coded.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Formula 1’s sole tyre supplier, Pirelli, makes a sliding range of dry **slick** compounds, from the very hard to the very soft. For each event it picks three of them and badges them simply as **Hard**, **Medium** and **Soft** so fans can follow along, marked by the colour of the sidewall.',
        },
        {
          type: 'table',
          caption: 'The dry-weekend compounds',
          columns: ['Name', 'Colour', 'Grip', 'Durability'],
          rows: [
            ['Soft', 'Red', 'Highest', 'Lowest'],
            ['Medium', 'Yellow', 'Balanced', 'Balanced'],
            ['Hard', 'White', 'Lowest', 'Highest'],
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'The one trade-off behind every strategy',
          text: 'Softer rubber grips harder and is faster over a single lap, but it overheats and wears out sooner. Harder rubber is slower but lasts. Every strategic decision in this course flows from that one tension.',
        },
        {
          type: 'paragraph',
          text: 'Behind the three weekend labels sits Pirelli’s full numbered range — from the rock-hard **C0/C1** up to the ultra-soft **C6**. Which three numbered compounds get the Hard/Medium/Soft labels changes from track to track, so a “Hard” at one race can be softer than a “Medium” at another.',
        },
      ],
      takeaways: [
        'Three dry compounds per weekend: Soft (red), Medium (yellow), Hard (white).',
        'Softer = more grip but shorter life; harder = less grip but longer life.',
        'The labels map onto Pirelli’s numbered C0–C6 range, chosen per circuit.',
      ],
    },
    {
      slug: 'working-range',
      title: 'Working Range & Warm-up',
      summary: 'Why a tyre only grips inside a temperature window.',
      blocks: [
        {
          type: 'paragraph',
          text: 'A racing tyre only performs inside a **temperature window**. Below it the rubber is hard and slick and offers almost no grip; above it the tyre overheats and the surface degrades. Keeping all four tyres inside that window — at the same time — is one of the hardest parts of driving an F1 car.',
        },
        {
          type: 'terms',
          items: [
            {
              term: 'Out-lap',
              definition: 'The lap spent bringing cold tyres up to temperature before a fast lap; get it wrong and the grip simply is not there.',
            },
            {
              term: 'Graining',
              definition: 'When a too-cold tyre tears and rolls bits of its own rubber across the surface, sharply reducing grip until it cleans up.',
            },
            {
              term: 'Blistering',
              definition: 'When a too-hot tyre overheats internally, bubbling and shedding chunks of the tread.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why qualifying laps are so precise',
          text: 'In qualifying a driver often has one shot with the tyres perfectly in their window. A lap too early (tyres cold) or a corner too aggressive (tyres overheating) and the lap is gone — which is why warm-up procedure is rehearsed obsessively.',
        },
      ],
      takeaways: [
        'Tyres only grip inside a temperature window — too cold or too hot both fail.',
        'Cold tyres can grain; overheated tyres can blister.',
        'Nailing the warm-up is decisive, especially on a one-shot qualifying lap.',
      ],
    },
    {
      slug: 'degradation',
      title: 'Degradation',
      summary: 'How tyres fade — and why teams plan around it.',
      blocks: [
        {
          type: 'paragraph',
          text: 'As a stint goes on, the tyres wear and overheat, grip falls away and lap times climb. This fade is called **degradation**, or **deg** for short, and it is the clock that strategy runs against. A car on fresh tyres is simply faster than the same car twenty laps later.',
        },
        {
          type: 'paragraph',
          text: 'Teams measure deg carefully in Friday practice to predict how each compound will fade on Sunday. The result decides how many stops to make and when. A driver who can **manage** the tyres — being smooth, avoiding wheelspin and lockups — can stretch a stint several laps longer than a driver who attacks every corner, and those extra laps are pure strategic freedom.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Deg is why the fastest car does not always win',
          text: 'A car that is brutal on its tyres may be quick for five laps and slow for the next twenty. Race pace is about the *average* over a stint, not a single hot lap — so tyre management often beats raw speed.',
        },
      ],
      takeaways: [
        'Degradation is the loss of grip and lap time as tyres wear and overheat.',
        'Teams model deg in practice to choose the number and timing of stops.',
        'Smooth tyre management can outweigh raw single-lap speed over a race.',
      ],
    },
    {
      slug: 'undercut-overcut',
      title: 'The Undercut & Overcut',
      summary: 'Two ways to pass a rival in the pits instead of on track.',
      blocks: [
        {
          type: 'paragraph',
          text: 'When overtaking on track is hard, drivers attack in the pits instead. The two classic moves are mirror images of each other, and which one works depends on how the tyres are behaving that day.',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'The undercut',
              text: 'You pit first. On fresh, fast tyres you set blistering laps while your rival is still grinding around on worn ones. When they finally stop, you have banked enough time to emerge ahead.',
            },
            {
              title: 'The overcut',
              text: 'You stay out while your rival pits onto cold tyres. For a couple of laps they are slow warming them up, so you keep hammering in fast laps on your older-but-warm rubber and leapfrog them at your own stop.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Which one works?',
          text: 'The undercut thrives when fresh tyres switch on instantly and deg is high. The overcut works when tyres are slow to warm up or the track is so hot that new rubber overheats. Reading that correctly is the strategist’s craft.',
        },
      ],
      takeaways: [
        'The undercut: pit early and use fresh-tyre pace to jump ahead.',
        'The overcut: stay out while a rival struggles on cold new tyres.',
        'Track temperature and warm-up behaviour decide which one works.',
      ],
    },
    {
      slug: 'one-stop-two-stop',
      title: 'One Stop vs Two',
      summary: 'Balancing track position against fresh-tyre speed.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The headline strategic call is how many times to stop. Each extra stop costs roughly twenty seconds of pit-lane time but buys a set of faster, fresher tyres. The optimum is a genuine gamble made before and during the race.',
        },
        {
          type: 'table',
          caption: 'The core trade-off',
          columns: ['Strategy', 'Upside', 'Downside'],
          rows: [
            ['One stop', 'Keeps track position, fewer risks', 'Older, slower tyres late on'],
            ['Two stop', 'Fresher, faster tyres', 'Loses ~20s + risk of traffic'],
          ],
        },
        {
          type: 'paragraph',
          text: 'The right answer shifts with **degradation** (high deg pushes you toward more stops), the **chance of a Safety Car** (which makes a stop almost free), and how easy **overtaking** is at that circuit (if passing is hard, track position from a one-stop is gold). Teams will often split their two cars onto different strategies to cover both outcomes.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'The Safety Car wildcard',
          text: 'A stop under a Safety Car costs far less time, because the whole field is slowed. A perfectly timed Safety Car can turn a losing strategy into a winning one — and a badly timed one can wreck a perfect race.',
        },
      ],
      takeaways: [
        'Each stop costs ~20s but provides fresher, faster tyres.',
        'Degradation, Safety Car odds, and overtaking difficulty drive the choice.',
        'A well-timed Safety Car can make an extra stop nearly free.',
      ],
    },
    {
      slug: 'wet-weather',
      title: 'Wet Weather',
      summary: 'The grooved tyres and the timing gambles rain creates.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Slick tyres have no grooves, so they aquaplane the instant the track is wet. When rain comes, teams switch to **grooved** wet-weather tyres designed to pump water out from under the contact patch.',
        },
        {
          type: 'table',
          caption: 'Wet-weather tyres',
          columns: ['Tyre', 'Colour', 'Use'],
          rows: [
            ['Intermediate', 'Green', 'Damp or drying track'],
            ['Full wet', 'Blue', 'Standing water, heavy rain'],
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'The crossover is where races are won',
          text: 'The hardest call is *when* to swap — slicks to inters as rain starts, or inters back to slicks as the track dries. Pit a lap too early or too late and you lose a fortune; nail the exact crossover lap and you can win.',
        },
        {
          type: 'paragraph',
          text: 'A drying track is the most treacherous: inters get faster and faster until, suddenly, slicks are quicker — but only if the line is dry enough to risk them. The first driver brave enough to switch can leap up the order, or spin off and lose everything.',
        },
      ],
      takeaways: [
        'Slicks aquaplane in the wet; intermediates handle damp, full wets handle standing water.',
        'Inters are green, full wets are blue.',
        'The crossover timing between wet and dry tyres regularly decides wet races.',
      ],
    },
  ],
};
