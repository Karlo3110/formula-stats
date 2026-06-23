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
          text: 'Behind the three weekend labels sits Pirelli’s full numbered range — from the rock-hard **C0/C1** up to the ultra-soft **C6**. Which three numbered compounds get the Hard/Medium/Soft labels changes from track to track, so a “Hard” at one race can be softer than a “Medium” at another. Pirelli chooses the trio by studying how abrasive the asphalt is, how fast the corners are, and how much energy the layout puts through the rubber.',
        },
        {
          type: 'paragraph',
          text: 'A driver does not have unlimited rubber to play with. Each one starts the weekend with a fixed **allocation** of sets and has to hand some back after each practice session, so every lap run in practice spends part of a finite budget. That is why teams sometimes sit in the garage while rivals circulate: they are saving a fresh set for when it counts on Sunday.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why you must use two compounds',
          text: 'In a dry race the rules force every car to fit at least two different slick compounds, which guarantees a pit stop and means no single tyre has to do the whole job. Choosing which two — and in which order — is the opening move of race strategy.',
        },
      ],
      takeaways: [
        'Three dry compounds per weekend: Soft (red), Medium (yellow), Hard (white).',
        'Softer = more grip but shorter life; harder = less grip but longer life.',
        'The labels map onto Pirelli’s numbered C0–C6 range, chosen per circuit.',
        'Each driver has a limited allocation of sets, so practice running is a budget.',
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
          type: 'paragraph',
          text: 'The two ends of the car rarely sit in the window together. A circuit that is hard on traction overheats the **rears**, while a series of long, fast corners punishes the **front-left**. A car that is gentle on its tyres but cannot switch them on quickly will struggle in qualifying; one that switches on instantly but overheats will fade in the race. Engineers spend the weekend nudging setup and tyre pressures to balance the two.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why qualifying laps are so precise',
          text: 'In qualifying a driver often has one shot with the tyres perfectly in their window. A lap too early (tyres cold) or a corner too aggressive (tyres overheating) and the lap is gone — which is why warm-up procedure is rehearsed obsessively.',
        },
        {
          type: 'paragraph',
          text: 'Warm-up is not only the driver’s job. Tyres are pre-heated in blankets to the top of their window before they are fitted, and on the out-lap the driver weaves to build heat through friction and brakes hard to warm the rubber from the wheel outward. On a cold, damp track that whole process can take most of a lap; on a baking afternoon the opposite problem appears, and the challenge becomes shedding heat rather than building it.',
        },
      ],
      takeaways: [
        'Tyres only grip inside a temperature window — too cold or too hot both fail.',
        'Cold tyres can grain; overheated tyres can blister.',
        'Front and rear tyres rarely sit in the window together — balancing them is key.',
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
          type: 'subheading',
          text: 'Two kinds of deg',
        },
        {
          type: 'terms',
          items: [
            {
              term: 'Thermal degradation',
              definition: 'The tyre overheats and loses grip even though there is tread left; it can sometimes be recovered by backing off and letting the rubber cool.',
            },
            {
              term: 'Wear degradation',
              definition: 'The tread physically wears away. This is permanent — once the rubber is gone, it is gone.',
            },
          ],
        },
        {
          type: 'paragraph',
          text: 'Teams measure deg carefully in Friday practice to predict how each compound will fade on Sunday. The result decides how many stops to make and when. A driver who can **manage** the tyres — being smooth, avoiding wheelspin and lockups, and using techniques like **lift-and-coast** (easing off before the braking zone to cut temperature) — can stretch a stint several laps longer than a driver who attacks every corner, and those extra laps are pure strategic freedom.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Beware the cliff',
          text: 'Some compounds do not fade gently. They hold up for a stint and then fall off a “cliff” — a sudden, dramatic loss of grip over a lap or two. A driver who pushes one lap too long can drop several seconds a lap almost instantly, handing the place straight back.',
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
        'Thermal deg can be managed by cooling the tyre; wear deg is permanent.',
        'Smooth driving and lift-and-coast can extend a stint by several laps.',
        'Some compounds fall off a sudden “cliff” rather than fading gently.',
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
        {
          type: 'paragraph',
          text: 'The undercut is so powerful that it shapes how drivers race. A leader will often defend not by going faster but by staying close enough to **cover** a rival — pitting the moment the car behind does, so it never gets the clear-air laps an undercut needs. When two team-mates pit on consecutive laps the crew performs a **double-stack**, servicing one car while the next is already on its way in, a stop with almost no margin for error.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'The trap on the way out',
          text: 'An undercut only works if you rejoin into clear track. Pit into a queue of slower cars — “traffic” — and the fresh-tyre advantage is spent stuck behind them, and the move fails before it has begun.',
        },
      ],
      takeaways: [
        'The undercut: pit early and use fresh-tyre pace to jump ahead.',
        'The overcut: stay out while a rival struggles on cold new tyres.',
        'Leaders defend by covering the stop; team-mates may double-stack.',
        'Track temperature, warm-up behaviour, and traffic decide which works.',
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
          text: 'That twenty seconds is the **pit loss** — the time lost driving the pit lane and stopping versus staying on track. An extra stop only pays if the fresher tyres can win back more than the pit loss before the flag. Strategists weigh it as a simple sum: the **time gained per lap** on newer rubber, multiplied by the laps remaining, against the cost of the stop itself.',
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
        'An extra stop only pays if new-tyre pace wins back more than the pit loss.',
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
          text: 'Slick tyres have no grooves, so they aquaplane the instant the track is wet. When rain comes, teams switch to **grooved** wet-weather tyres designed to pump water out from under the contact patch — a full wet can clear tens of litres of water a second at racing speed.',
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
        {
          type: 'paragraph',
          text: 'Rain also brings a second enemy: **spray**. The wall of water thrown up by the cars ahead can blind a following driver completely, and it is often poor visibility — not a lack of grip — that forces officials to neutralise a race behind the Safety Car or stop it with a **red flag** until conditions improve. A wet race is therefore as much about patience and judgement as it is about car control.',
        },
      ],
      takeaways: [
        'Slicks aquaplane in the wet; intermediates handle damp, full wets handle standing water.',
        'Inters are green, full wets are blue.',
        'The crossover timing between wet and dry tyres regularly decides wet races.',
        'Spray and visibility, not just grip, can trigger Safety Cars or red flags.',
      ],
    },
  ],
};
