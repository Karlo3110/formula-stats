import type { LearnTopic } from '@/lib/learn/types';

export const aerodynamics: LearnTopic = {
  slug: 'aerodynamics',
  title: 'Aerodynamics',
  tagline: 'Why an F1 car could almost drive on the ceiling',
  description:
    'Aerodynamics is the single biggest performance differentiator in Formula 1. This course explains how a car turns moving air into grip, why every gain costs something in drag, and how the modern rules use airflow to make racing closer — including the active-aero system that replaced DRS.',
  accent: 'accent',
  level: 'Intermediate',
  chapters: [
    {
      slug: 'downforce',
      title: 'Downforce',
      summary: 'How airflow is turned into grip that beats gravity.',
      blocks: [
        {
          type: 'paragraph',
          text: 'An F1 car’s wings and floor are shaped to push air **upward**, and by Newton’s third law the air pushes the car **down** in return. This **downforce** presses the tyres into the track, multiplying their grip far beyond what the rubber could manage on its own.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'More than its own weight',
          text: 'At high speed a modern F1 car generates more downforce than it weighs — in theory, enough that it could stick to an upside-down road. That is the origin of the famous “drive on the ceiling” claim.',
        },
        {
          type: 'paragraph',
          text: 'More grip translates directly into lap time: the driver can brake later, carry more speed through corners, and get on the throttle earlier. In a high-speed corner the car can pull several **g** of lateral force — enough that drivers train their necks specifically to hold their heads up. Crucially, downforce **grows with speed** — there is very little of it at 60 km/h and a huge amount at 300 km/h — which is why these cars feel glued through fast corners but slippery through slow ones.',
        },
        {
          type: 'subheading',
          text: 'Where the downforce comes from',
        },
        {
          type: 'paragraph',
          text: 'Three areas do most of the work: the **front wing** (which also points the airflow down the rest of the car), the **rear wing**, and the **floor and diffuser** underneath. Their balance front-to-rear sets the car’s handling: too much at the front and the rear goes light and slides (**oversteer**); too little and the nose washes out (**understeer**). Engineers chase not just *more* downforce but downforce that stays balanced as the car brakes, turns and accelerates.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The aero platform',
          text: 'Because downforce is so sensitive to the car’s attitude — how it pitches under braking and rolls in corners — teams obsess over keeping a stable **platform**. Stiff suspension holds the floor at a consistent height so the aerodynamics behave predictably; the trade-off is a car that rides kerbs and bumps harshly. A car whose balance shifts unpredictably with speed is exhausting to drive and slow, even if its peak downforce is high.',
        },
      ],
      takeaways: [
        'Wings and the floor deflect air up, pushing the car down.',
        'Downforce multiplies tyre grip, enabling later braking and faster corners.',
        'It scales with speed: lots in fast corners, little in slow ones.',
        'Front-to-rear balance of downforce sets understeer vs oversteer.',
        'A stable, predictable aero platform matters as much as peak downforce.',
      ],
    },
    {
      slug: 'drag',
      title: 'Drag — the Trade-off',
      summary: 'Why every bit of downforce has a price in top speed.',
      blocks: [
        {
          type: 'paragraph',
          text: 'There is no free downforce. Every surface that bends air to create grip also creates **drag** — the force that resists the car punching through the air and caps its top speed. The whole craft of aerodynamic setup is finding the best grip for the least drag, a quality engineers call **aero efficiency**.',
        },
        {
          type: 'subheading',
          text: 'A different car for every track',
        },
        {
          type: 'table',
          caption: 'Wing level is tuned to the circuit',
          columns: ['Circuit type', 'Wing level', 'Why'],
          rows: [
            ['Street / twisty (Monaco)', 'Maximum', 'Endless slow corners, no long straights'],
            ['Balanced (Silverstone)', 'Medium', 'A mix of fast corners and straights'],
            ['Power track (Monza)', 'Minimum', 'Long straights reward low drag'],
          ],
        },
        {
          type: 'paragraph',
          text: 'At Monza the teams strip wing away to be fast on the straights and simply accept less cornering grip; at Monaco they run maximum wing because there is no straight long enough for drag to matter. Most circuits sit somewhere in between, and getting that compromise right is worth tenths of a second a lap.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'The slipstream is drag working for you',
          text: 'Because drag is the car fighting the air, a car tucked into the **wake** of the one ahead meets less resistance and can run faster on the straight for the same effort. That “tow” is how a chasing car closes up before a braking zone — drag turned briefly into an advantage.',
        },
        {
          type: 'paragraph',
          text: 'Drag is why a car’s top speed eventually stops climbing: it accelerates until the engine’s push exactly equals the air’s resistance, the **terminal speed** for that wing level. Trimming wing raises that ceiling but costs cornering grip — the central compromise of every setup sheet.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aero development is rationed',
          text: 'Teams refine these shapes in **wind tunnels** and in **CFD** (computer airflow simulation), but the rules now ration how much of each a team may do — and they hand *more* tunnel and computing time to teams lower in the championship. It is a deliberate brake on the richest teams simply out-developing everyone, and it makes every hour of aero work precious.',
        },
      ],
      takeaways: [
        'Downforce always comes with drag, which limits top speed.',
        '“Aero efficiency” is maximising grip per unit of drag.',
        'Wing levels are tuned per circuit, from low-drag Monza to high-grip Monaco.',
        'A slipstream cuts drag for a following car, helping it close up.',
        'Wind-tunnel and CFD time is capped, with more given to lower-placed teams.',
      ],
    },
    {
      slug: 'ground-effect',
      title: 'Ground Effect & the Floor',
      summary: 'How the underside of the car makes grip with little drag.',
      blocks: [
        {
          type: 'paragraph',
          text: 'The most powerful aerodynamic part of a modern F1 car is the one you cannot see: the **floor**. Today’s cars are **ground-effect** cars, using shaped tunnels underneath to generate the bulk of their downforce.',
        },
        {
          type: 'terms',
          items: [
            {
              term: 'Venturi tunnels',
              definition: 'Channels under the floor that narrow then widen, accelerating the air flowing beneath the car.',
            },
            {
              term: 'Low pressure',
              definition: 'Faster-moving air has lower pressure (the Bernoulli principle), so the underside is sucked toward the road.',
            },
            {
              term: 'Ground effect',
              definition: 'The resulting downforce generated under the car rather than on top of it.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Why teams obsess over the floor',
          text: 'Because ground effect works under the car, it produces grip with far less drag than a big wing. A team that finds floor downforce gains lap time almost everywhere at once — which is why floor development dominates the modern era.',
        },
        {
          type: 'paragraph',
          text: 'Ground effect is fierce but fussy: it strengthens the closer the floor runs to the road, so teams want to run the car as low as they dare. Run it too low and the airflow under the floor can stall and reconnect over and over, making the car bounce violently on the straights — the phenomenon nicknamed **porpoising**. There is also a hard limit: a wooden **plank** under the floor must not wear past a set thickness, proof the car was not run illegally low, and a worn plank means **disqualification**.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'A second time around',
          text: 'Ground effect is not new. It first transformed F1 in the late 1970s, was **banned** in the early 1980s when the cornering speeds grew alarming, and was deliberately brought back in the 2022 rules — this time tightly controlled — specifically because under-car downforce disturbs a following car less than big wings do. The whole point of its return was better racing.',
        },
      ],
      takeaways: [
        'The floor is the dominant aerodynamic surface today.',
        'Venturi tunnels speed up underbody air, dropping pressure and sucking the car down.',
        'Ground effect makes grip with little drag, so floor gains help everywhere.',
        'Running too low risks porpoising and illegal plank wear (a disqualification).',
        'Ground effect was used in the 1970s, banned, then reintroduced for closer racing.',
      ],
    },
    {
      slug: 'active-aero',
      title: 'Active Aero & Overtaking',
      summary: 'Movable wings and the boost that replaced DRS.',
      blocks: [
        {
          type: 'paragraph',
          text: 'For over a decade, overtaking was helped by **DRS** — a flap that opened in the rear wing on straights to shed drag and add speed, usable only when within one second of the car ahead. The modern rules go much further with **active aerodynamics**: the wings themselves change shape to suit the moment.',
        },
        {
          type: 'subheading',
          text: 'Two modes, front and rear',
        },
        {
          type: 'list',
          items: [
            'A low-drag mode flattens the front and rear wings on the straights for maximum speed.',
            'A high-downforce mode steepens them again for braking and cornering grip.',
            'The car switches between the two automatically as it moves from straight to corner.',
          ],
        },
        {
          type: 'paragraph',
          text: 'The leap from DRS is in two directions at once. DRS moved only the rear wing; active aero moves the **front as well**, so the car keeps its aerodynamic balance when it trims for the straight rather than going nose-heavy. And where DRS could only be used in marked zones when chasing, the new system flattens the wings for *everyone* on the straights as a matter of course — it is a normal part of every lap, not just an overtaking tool.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'The overtaking aid is now a power boost',
          text: 'Instead of only opening a wing, a chasing driver within range can deploy a burst of extra electrical energy — an “override” — to help complete a pass. The advantage shifts from pure aero to a deployable boost.',
        },
        {
          type: 'paragraph',
          text: 'There is a hard safety rule beneath all of it: the wings must snap back to their high-downforce shape the instant the driver brakes or lifts, so the car can never arrive at a corner stuck in low-downforce, low-grip mode. The principle is unchanged from the DRS era: give the following car a temporary edge so overtaking is *possible*, without making it automatic. A pass still has to be earned.',
        },
      ],
      takeaways: [
        'Active aero lets the wings change shape between low-drag and high-downforce modes.',
        'Unlike DRS, both the front and rear wings move, preserving balance.',
        'The car switches modes automatically between straights and corners.',
        'Wings must revert to high-downforce the moment the driver brakes, for safety.',
        'The overtaking aid is now an electrical power boost for the chasing car.',
      ],
    },
    {
      slug: 'dirty-air',
      title: 'Dirty Air & Following',
      summary: 'Why it is so hard to chase another car closely.',
      blocks: [
        {
          type: 'paragraph',
          text: 'A car leaves a wake of churned-up, turbulent air behind it — **dirty air**. A car following closely runs straight into that wake, where its wings and floor cannot work properly, so it loses downforce and grip exactly when it is trying to stay close enough to attack.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Rules designed around the wake',
          text: 'The ground-effect regulations were chosen specifically because they throw the disturbed air **upward and over** the following car, instead of spilling it sideways into the chaser’s path. The aim was to let cars follow more closely and race harder.',
        },
        {
          type: 'paragraph',
          text: 'The effect is dramatic: a car running right behind another can lose a large share of its downforce, and the closer it gets, the worse it becomes — a vicious circle right in the braking zone where a move is launched. Because the floor relies on clean air feeding the tunnels, ground-effect cars are less sensitive to this than the wing-dominated cars that came before, but the penalty never disappears entirely.',
        },
        {
          type: 'callout',
          tone: 'key',
          title: 'Two opposite effects on one straight',
          text: 'Air does two contradictory things to a chasing car. In the corners the dirty-air **turbulence** robs it of downforce and grip; on the straight that follows, the **slipstream** cuts its drag and lets it close right up. Racing is the art of surviving the dirty-air corners well enough to be close at the exit, then using the tow down the straight to pounce.',
        },
        {
          type: 'paragraph',
          text: 'Following still costs grip, and pushing hard in dirty air also overheats the tyres faster. That is why a driver who is visibly quicker can sometimes sit stuck behind a slower car: staying close burns the tyres and erodes the grip needed to make the move.',
        },
      ],
      takeaways: [
        'Dirty air is the turbulent wake that robs a following car of downforce.',
        'The loss grows the closer you follow — worst exactly where you attack.',
        'In corners turbulence hurts; on the straight the slipstream helps — racing exploits both.',
        'Modern rules push that wake upward to make following easier.',
        'Chasing in dirty air also overheats tyres, compounding the difficulty.',
      ],
    },
    {
      slug: 'cooling',
      title: 'Cooling & the Unseen Aero',
      summary: 'Feeding air to the radiators and brakes without wrecking efficiency.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Aerodynamics is not only about making the car fast — it also has to keep it alive. The power unit, the brakes and the gearbox all generate heat, and air must be channelled to cool them. The catch: **every opening in the bodywork adds drag**.',
        },
        {
          type: 'paragraph',
          text: 'So engineers size the cooling apertures as tightly as they dare. Open them too little and the car overheats and has to be driven gently to survive; open them too much and you simply give away lap time to drag. Teams often run bigger openings at hot, slow circuits and seal the car up tight at cool, fast ones, swapping bodywork panels to match the forecast.',
        },
        {
          type: 'paragraph',
          text: 'This is why **sidepod** and engine-cover shaping is such a battleground: a team that can cool the same power unit through smaller inlets gets tighter, more aerodynamic bodywork for free. The hot air still has to leave somewhere, so designers route it out where it does the least aerodynamic harm — and a beautifully packaged car is often a sign the cooling problem was solved elegantly.',
        },
        {
          type: 'paragraph',
          text: 'The brakes are their own cooling challenge. Carbon brake discs glow well past 1,000°C under heavy braking, fed by precisely shaped **brake ducts** — and like everything else, those ducts must be big enough to stop the brakes cooking but small enough not to bleed away lap time. Get brake cooling wrong and a driver faces either fading brakes or, at the other extreme, discs running too cold to bite.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Cooling is a race-day variable',
          text: 'A surprise heatwave, or a Safety Car that slows the airflow, can push temperatures past the limit. Drivers are sometimes told to back off or weave on straights purely to get more air into an overheating car.',
        },
      ],
      takeaways: [
        'Bodywork must feed cooling air to the engine, brakes and gearbox.',
        'Every cooling opening costs drag, so they are sized as small as possible.',
        'Cooling the same power unit through smaller inlets frees up tighter bodywork.',
        'Brake ducts must balance discs that glow past 1,000°C against drag.',
        'Cooling is tuned to ambient conditions and can force drivers to back off.',
      ],
    },
  ],
};
