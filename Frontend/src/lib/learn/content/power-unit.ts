import type { LearnTopic } from '@/lib/learn/types';

export const powerUnit: LearnTopic = {
  slug: 'power-unit',
  title: 'Power Unit',
  tagline: 'A 1,000 hp hybrid that runs on sustainable fuel',
  description:
    'A Formula 1 “engine” is really a hybrid power unit — a small turbocharged engine working hand-in-hand with a powerful electric system. This course unpacks how the two halves combine, how the energy is recovered and deployed, and the rules on fuel and components that constrain it all.',
  accent: 'accent',
  level: 'Advanced',
  chapters: [
    {
      slug: 'more-than-an-engine',
      title: 'More Than an Engine',
      summary: 'Why it is called a power unit, not an engine.',
      blocks: [
        {
          type: 'paragraph',
          text: 'F1 deliberately uses the term **power unit** (PU) rather than “engine,” because it is a combined system: a small **internal-combustion engine** plus a substantial **electric** system, working together. Together they produce around 1,000 horsepower while being among the most efficient engines ever built.',
        },
        {
          type: 'terms',
          items: [
            {
              term: 'Internal-combustion engine (ICE)',
              definition: 'A 1.6-litre turbocharged V6 that burns fuel — the traditional half of the power unit.',
            },
            {
              term: 'Electric power',
              definition: 'Energy recovered during the lap, stored in a battery, and deployed for a large share of the total output.',
            },
            {
              term: 'Sustainable fuel',
              definition: 'A fully sustainable fuel — made from non-fossil sources — that the cars now run on.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Roughly half the power is now electric',
          text: 'The modern regulations push the electrical contribution dramatically upward, toward an even split with the combustion engine. The electric motor is no longer a small boost — it is half the story.',
        },
        {
          type: 'paragraph',
          text: 'The reason for the hybrid is efficiency. A 1.6-litre V6 sounds modest — smaller than many family-car engines — yet it produces enormous power because it is turbocharged, revs far higher than any road engine, and is paired with an electric system that reclaims energy a normal car simply throws away. That blend of small capacity and huge output is exactly the engineering challenge the rules set out to provoke, and it is why the technology is meant to be relevant to road cars, not just the track.',
        },
      ],
      takeaways: [
        'A power unit = a 1.6L turbo V6 plus a powerful electric system.',
        'Combined output is around 1,000 hp, at remarkable efficiency.',
        'The small turbo engine revs high and is paired with energy recovery.',
        'The cars run on fully sustainable fuel, with electric power near half the total.',
      ],
    },
    {
      slug: 'the-hybrid-system',
      title: 'The Hybrid System',
      summary: 'How braking energy becomes acceleration.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The clever part of the power unit is that it **recovers** energy that would otherwise be wasted, stores it, and uses it again. The component at the heart of this is the **MGU-K** — a motor-generator linked to the engine.',
        },
        {
          type: 'steps',
          items: [
            {
              title: 'Harvest under braking',
              text: 'As the driver brakes, the MGU-K acts as a generator, turning the car’s momentum into electrical energy instead of wasting it all as heat.',
            },
            {
              title: 'Store in the battery',
              text: 'That energy is banked in the Energy Store — the battery pack.',
            },
            {
              title: 'Deploy for acceleration',
              text: 'On the next straight the MGU-K runs as a motor, pouring that stored energy back in as extra power.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'A simpler, more powerful hybrid',
          text: 'Earlier power units also had an MGU-H that recovered heat from the turbo. The modern rules drop that component to cut cost and complexity, and instead make the MGU-K far more powerful — so the electric system is simpler but punches much harder.',
        },
        {
          type: 'paragraph',
          text: 'Because the MGU-K does much of its harvesting *through* the rear brakes, the braking system is **brake-by-wire**: a computer blends the driver’s pedal pressure with the electrical harvesting so the car slows smoothly and predictably. Get that blend wrong and the brake feel changes from corner to corner — one reason braking consistency is such a prized driver skill in the hybrid era.',
        },
      ],
      takeaways: [
        'The MGU-K harvests braking energy and redeploys it for acceleration.',
        'Recovered energy is stored in the battery (Energy Store).',
        'Rear braking is blended electronically (brake-by-wire) with harvesting.',
        'The heat-recovery MGU-H has been dropped; the MGU-K is now much more powerful.',
      ],
    },
    {
      slug: 'energy-deployment',
      title: 'Energy Deployment & Override',
      summary: 'Managing a limited battery across a lap.',
      blocks: [
        {
          type: 'paragraph',
          text: 'There is only so much electrical energy to go around each lap, so a driver cannot simply hold the boost down everywhere. Every lap is a negotiation: harvest energy in some places, deploy it in others, and make sure there is a charge available exactly where it counts — defending into a braking zone or attacking onto a straight.',
        },
        {
          type: 'paragraph',
          text: 'The car follows energy **modes** and delta targets set by the team, and the deployment is mapped corner by corner. Run the battery flat too early and the car is left slow and exposed on the next straight; hoard it and you give away lap time you could have used.',
        },
        {
          type: 'paragraph',
          text: 'This is why the same car can feel like two different machines. In **qualifying** the engineers unlock the most aggressive deployment for one explosive lap; in the **race** they manage the energy conservatively to last the distance, sometimes spending a lap deliberately under-deploying to bank charge — a “charging lap” — so the boost is there for an attack or a defence a few corners later.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Override: the overtaking boost',
          text: 'The rules give a chasing driver access to an extra slug of deployable energy — an override — to help complete a pass. It is the modern replacement for DRS: a temporary, driver-triggered boost rather than an automatic advantage.',
        },
      ],
      takeaways: [
        'Electrical energy per lap is limited and must be managed corner by corner.',
        'Teams set energy modes and delta targets to place the boost where it matters.',
        'Qualifying unlocks aggressive deployment; the race is managed to last.',
        'A chasing car can deploy extra “override” energy to help overtake.',
      ],
    },
    {
      slug: 'component-limits',
      title: 'Component Limits & Penalties',
      summary: 'Why a fresh engine can cost grid positions.',
      blocks: [
        {
          type: 'paragraph',
          text: 'To keep costs under control, each driver is allowed only a **fixed number** of each power-unit element across the whole season. The PU is not one part but several — and each has its own seasonal allowance.',
        },
        {
          type: 'list',
          items: [
            'Internal-combustion engine (ICE)',
            'Turbocharger',
            'MGU-K (the energy recovery motor-generator)',
            'Energy Store (battery) and Control Electronics',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Exceed the allowance, take a grid penalty',
          text: 'Fit more than your allotted number of a component — usually because of failures or a strategic fresh engine — and you take a grid penalty, often dropping several places or starting from the back.',
        },
        {
          type: 'paragraph',
          text: 'Because each element is counted separately, the penalties can stack: take a fresh ICE *and* a fresh turbo at the same race and the drops add up, which is why a driver who needs new parts will often take several at once and accept a single back-of-grid start rather than bleeding places over multiple weekends. Teams also nurse their hardware with conservative **engine modes** in practice and lower-stakes races, saving the most stressful settings for when points are truly on the line.',
        },
        {
          type: 'paragraph',
          text: 'This turns reliability into a strategic resource. A team nursing a fragile engine has to weigh protecting it (and driving more conservatively) against the near-certainty of a back-of-grid start later in the year when they finally need a fresh one.',
        },
      ],
      takeaways: [
        'Each PU element has a fixed seasonal allowance per driver.',
        'Going over the allowance brings grid penalties, sometimes a back-row start.',
        'Penalties stack, so teams often take several fresh parts in one weekend.',
        'Reliability becomes a strategic resource to be managed across the season.',
      ],
    },
    {
      slug: 'fuel-and-flow',
      title: 'Fuel, Flow & Efficiency',
      summary: 'Why you cannot just pour in more power.',
      blocks: [
        {
          type: 'paragraph',
          text: 'You might assume more fuel means more power, but the rules cap the **fuel-flow rate** — the maximum amount of fuel that can reach the engine each second. That limit is precisely why the sport pushes so hard on **efficiency**: with flow fixed, the only way to make more power is to extract more from every drop.',
        },
        {
          type: 'paragraph',
          text: 'There is also a limit on how much fuel a car may use in the race, so fuel becomes part of strategy. Drivers are sometimes told to **lift and coast** — ease off the throttle before a braking point — to save fuel or cool the PU, trading a sliver of lap time for finishing the race within the allowance.',
        },
        {
          type: 'paragraph',
          text: 'The fuel itself is now a performance and sustainability frontier. Running a fully **sustainable fuel** — made from non-fossil sources rather than crude oil — the manufacturers must wring the same energy from a “greener” blend, and the lessons feed directly into road-car fuels that work in ordinary engines. A dedicated fuel-flow sensor polices the flow limit continuously, so there is no hiding a few extra grams per second.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Among the most efficient engines on Earth',
          text: 'Thanks to the fuel-flow cap and the hybrid system, F1 engines convert an exceptionally high share of their fuel’s energy into motion — far more than a road car — which is exactly the engineering challenge the rules are designed to provoke.',
        },
      ],
      takeaways: [
        'A fuel-flow limit caps power, forcing engineers to chase efficiency.',
        'A total fuel allowance makes fuel-saving (“lift and coast”) part of strategy.',
        'Cars run a fully sustainable fuel, with the gains relevant to road cars.',
        'The result is one of the most thermally efficient engines ever built.',
      ],
    },
  ],
};
