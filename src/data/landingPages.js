/**
 * Landing Page Configurations & SEO Content
 * The Caddie's Compass
 *
 * Dedicated, content-rich landing pages around actual Golf Clash player questions.
 */

export const LANDING_PAGES = {
  "/golf-clash-apocalypse-wind-chart": {
    path: "/golf-clash-apocalypse-wind-chart",
    title: "Golf Clash Apocalypse Wind Chart (Lv 1-8) & Ring Adjustments | The Caddie's Compass",
    metaTitle: "Golf Clash Apocalypse Wind Chart (Lv 1-8) – The Caddie's Compass",
    description: "Master The Apocalypse with this free Golf Clash wind chart. Accurate max, mid, and min power-ring adjustments for Apoc levels 1 through 8. Live wind calculator, stats table, and tournament tips.",
    heading: "Golf Clash Apocalypse Wind Chart & Ring Adjustments",
    badge: "Tour 7 Epic Driver",
    type: "club",
    clubName: "The Apocalypse",
    defaultLevel: 8,
    intro: "The Apocalypse is the premier driver in Golf Clash. Unlocked in Tour 7, its massive curl, high power (up to 240 yards), and accuracy reaching 90 at Level 8 make it the undisputed king of long par 4s and par 5s. Use this interactive wind chart to read exact max, mid, and min ring adjustments for any wind condition.",
    proTips: [
      {
        title: "Apoc 8 100% Curl Power",
        text: "At Level 8, The Apocalypse features 100 curl with 240 power. In crosswinds, curling into the wind keeps the ball centered in the fairway while fighting off drift.",
      },
      {
        title: "Max vs Mid Ring Difference",
        text: "Due to the driver's long ball flight, the gap between Max and Mid power is significant. For an 11 mph crosswind with Apoc 8, Max power requires ~5.1 rings while Mid power requires ~4.6 rings.",
      },
      {
        title: "Overpower (OP) Ring Buffering",
        text: "When applying full overpower, add 10% to 15% extra ring adjustment depending on the ball's power coefficient to avoid missing the fairway on the wind side.",
      },
      {
        title: "Elevation Baseline for Driver Tee Shots",
        text: "Most tournament tee shots feature a downhill slope to the fairway landing zone. The standard baseline adjustment is +10% elevation. Add 10% to the displayed wind before pulling rings.",
      },
    ],
    faqs: [
      {
        q: "What is the wind per ring for Apocalypse 8 in Golf Clash?",
        a: "At Level 8 with a Power 0 ball, The Apocalypse has a wind-per-ring value of approximately 2.14 at Max distance, 2.39 at Mid distance, and 2.65 at Min distance. For a 10 mph wind at Max distance, adjust approximately 4.7 rings into the wind.",
      },
      {
        q: "When does The Apocalypse become better than Extra Mile?",
        a: "The Apocalypse typically replaces Extra Mile at Level 4 or Level 5. Apoc 4 matches Extra Mile 8/9 in distance while offering vastly superior curl and a more forgiving accuracy of 66 (compared to Extra Mile's low accuracy).",
      },
      {
        q: "How many rings do you adjust for Apocalypse 7?",
        a: "Apoc 7 has 240 power and 84 accuracy. Its Max wind-per-ring is approximately 2.22 mph/ring. For 10 mph wind at max, adjust approximately 4.5 rings.",
      },
    ],
  },

  "/golf-clash-sniper-wind-chart": {
    path: "/golf-clash-sniper-wind-chart",
    title: "Golf Clash Sniper Wind Chart (Lv 1-10) – 100 Accuracy Ring Adjustments",
    metaTitle: "Golf Clash Sniper Wind Chart (Lv 1-10) – The Caddie's Compass",
    description: "The definitive Golf Clash Sniper wind chart. Precise max, mid, and min ring adjustments for Sniper levels 1 to 10. Learn the famous 1:1 ring adjustment rule and shootout tips.",
    heading: "Golf Clash Sniper Wind Chart & Ring Adjustments",
    badge: "Tour 6 Common Wood",
    type: "club",
    clubName: "The Sniper",
    defaultLevel: 10,
    intro: "The Sniper is the most iconic wood in Golf Clash. Unlocked in Tour 6, its 100 accuracy starting from Level 9, combined with a 4.5 ball guide and 172-yard carry distance at Level 10, makes it the gold standard for tournament shootouts and par-5 second shots. Here is your complete wind-per-ring and rings-per-wind chart.",
    proTips: [
      {
        title: "The Sniper 10 1:1 Rule",
        text: "With a Power 0 ball at absolute maximum distance, Sniper 10 adjusts at almost exactly 1.00 mph per ring (10 mph wind = 10 rings). With Power 3 balls, Max WPR is ~0.94 mph/ring.",
      },
      {
        title: "Shootout Par 3 Elevation",
        text: "Par 3 greens often sit on elevated or depressed plateaus. A +10% or +20% downhill elevation adjustment is common on Tour 8 through Tour 12 shootouts.",
      },
      {
        title: "Secondary Wind Effect (SWE)",
        text: "Because The Sniper has high backspin, high winds cause the ball to bounce and roll along the wind vector after first bounce. In a 10 mph tailwind, reduce backspin by 1-1.5 bars.",
      },
      {
        title: "Mid-Distance Benchmark",
        text: "At Mid power with a Power 3 ball, Sniper 10 is ~1.05 mph per ring. Simply divide the effective wind by 1.05 for your ring pull.",
      },
    ],
    faqs: [
      {
        q: "What is the 1:1 ring rule for Sniper 10 in Golf Clash?",
        a: "At Level 10 with 100 accuracy, The Sniper's wind-per-ring value at maximum distance with a basic (Power 0) ball is exactly 1.00. This means each ring cancels out 1 mph of wind (e.g. 8.5 mph wind = 8.5 rings).",
      },
      {
        q: "How many rings for Sniper 10 with a Power 3 ball?",
        a: "With a Power 3 ball (P3), The Sniper's max distance increases by 7%, which tightens the target rings. At Max distance, the wind-per-ring drops to ~0.94 mph per ring. For a 9.4 mph wind, adjust 10.0 rings.",
      },
      {
        q: "At what level is The Sniper usable in Golf Clash?",
        a: "The Sniper becomes very competitive at Level 7 (88 accuracy, 4.0 ball guide) and becomes the best overall wood in the game at Level 9 and 10 where it reaches 100 accuracy and 4.5 ball guide.",
      },
    ],
  },

  "/golf-clash-thors-hammer-wind-chart": {
    path: "/golf-clash-thors-hammer-wind-chart",
    title: "Golf Clash Thor's Hammer Wind Chart (Lv 1-8) & Ring Adjustments",
    metaTitle: "Golf Clash Thor's Hammer Wind Chart (Lv 1-8) – The Caddie's Compass",
    description: "Accurate Golf Clash Thor's Hammer wind chart for levels 1 through 8. Compare TH8 vs Apoc 8, get exact max/mid/min ring adjustments, and master high-backspin driver shots.",
    heading: "Golf Clash Thor's Hammer Wind Chart & Adjustments",
    badge: "Tour 6 Epic Driver",
    type: "club",
    clubName: "Thor's Hammer",
    defaultLevel: 8,
    intro: "Thor's Hammer is the ultimate control driver in Golf Clash. Unlocked in Tour 6, Thor's Hammer reaches 100 accuracy and a massive 98 backspin with a 4.4 ball guide at Level 8. It excels on short par 4s, narrow island fairways, and driver shootouts where precision and stopping power outperform raw distance.",
    proTips: [
      {
        title: "TH8 vs Apoc 8 Shootouts",
        text: "While Apoc 8 wins on raw distance and curl, Thor's Hammer 8 has 100 accuracy (vs Apoc's 90) and 98 backspin. On driver shootouts, Thor's Hammer is vastly superior.",
      },
      {
        title: "Thor's Hammer 100 Accuracy Math",
        text: "At Level 8, Thor's Hammer reaches 100 accuracy. Its Max wind-per-ring is ~1.02 mph per ring (Power 0), making ring adjustments nearly 1:1 like a high-level Sniper.",
      },
      {
        title: "Fairway Island Drops",
        text: "On holes with disconnected fairways, use Thor's Hammer's backspin to land right next to the water or rough without risk of rolling through into trouble.",
      },
      {
        title: "Headwind Tee Shots",
        text: "In strong headwinds, the ball compresses and stays airborne longer. Add 1-2 extra rings of pull or adjust elevation by +5% to prevent falling short into bunkers.",
      },
    ],
    faqs: [
      {
        q: "What is the wind per ring for Thor's Hammer 8?",
        a: "At Level 8 with 100 accuracy, Thor's Hammer has a wind-per-ring value of approximately 1.02 at Max distance, 1.15 at Mid distance, and 1.30 at Min distance with a basic ball.",
      },
      {
        q: "Which is better: Thor's Hammer 7 or Apocalypse 5?",
        a: "Thor's Hammer 7 is generally superior to Apocalypse 5 on all holes except those requiring severe curl (>80 curl). TH7 has 92 accuracy and 232 power, offering much tighter ring groupings and easier adjustments.",
      },
      {
        q: "How many rings for Thor's Hammer 6?",
        a: "At Level 6 (64 accuracy, 232 power), Max wind-per-ring is approximately 1.78 mph/ring. For 10 mph wind at max, adjust approximately 5.6 rings.",
      },
    ],
  },

  "/golf-clash-grizzly-wind-chart": {
    path: "/golf-clash-grizzly-wind-chart",
    title: "Golf Clash Grizzly Wind Chart (Lv 1-9) & Ring Adjustments",
    metaTitle: "Golf Clash Grizzly Wind Chart (Lv 1-9) – The Caddie's Compass",
    description: "Complete Golf Clash Grizzly wind chart for levels 1 to 9. Precise max, mid, and min ring adjustments for the #1 tournament Long Iron, with shootout guide and accuracy stats.",
    heading: "Golf Clash Grizzly Wind Chart & Ring Adjustments",
    badge: "Tour 6 Rare Long Iron",
    type: "club",
    clubName: "The Grizzly",
    defaultLevel: 9,
    intro: "The Grizzly is the undisputed king of Long Irons in Golf Clash tournament play. With 100 accuracy starting from Level 7, a 4.4 ball guide, and 129 yards of reach at Level 9, The Grizzly provides the tightest ring radius and most dependable roll-outs for long iron approach shots and par-3 shootouts.",
    proTips: [
      {
        title: "100 Accuracy at Levels 7, 8, & 9",
        text: "From Level 7 onward, The Grizzly maintains a perfect 100 accuracy stat. This means ring adjustment formulas stay consistent as the club levels up.",
      },
      {
        title: "Long Iron Rule-Based Correction",
        text: "In Golf Clash notebook math, The Grizzly at Level 5+ receives a 0.9x aerodynamic correction factor. At Level 9 with a Power 0 ball, Max WPR is ~1.00 mph/ring.",
      },
      {
        title: "The Grizzly vs B52 Comparison",
        text: "While B52 reaches 135 yards at Level 7+, The Grizzly 9 has superior backspin (68 vs 55) and ball guide (4.4 vs 4.2), making hole-outs significantly easier on undulating greens.",
      },
      {
        title: "Slider Distance Positioning",
        text: "If your ball lands halfway between the Long Iron minimum and maximum mark, adjust at exactly Mid power (approx 1.15 mph per ring at Lv 9 with P3 ball).",
      },
    ],
    faqs: [
      {
        q: "What is the wind per ring for Grizzly 9 in Golf Clash?",
        a: "At Level 9 with a Power 0 ball, The Grizzly's Max distance wind-per-ring is approximately 1.00 mph per ring. Mid distance is ~1.15 mph per ring, and Min distance is ~1.35 mph per ring.",
      },
      {
        q: "Why is The Grizzly so popular in tournaments?",
        a: "The Grizzly combines 100 accuracy, a long 4.4 ball guide, and balanced spin. Because it adjusts at almost exactly 1:1 at max, tournament players can calculate adjustments rapidly under tournament shot timers.",
      },
      {
        q: "How many rings for Grizzly 8 with 8.0 mph wind?",
        a: "At Max distance with a basic ball, 8.0 mph wind equals approximately 8.0 rings. With a Power 3 ball, 8.0 mph wind at Max equals approximately 8.5 rings.",
      },
    ],
  },

  "/golf-clash-wind-calculator": {
    path: "/golf-clash-wind-calculator",
    title: "Golf Clash Wind Calculator – Live Ring Adjustments & Compass",
    metaTitle: "Golf Clash Wind Calculator – The Caddie's Compass",
    description: "Free interactive Golf Clash wind calculator. Drag the vector compass to set wind speed & direction, adjust elevation and distance, and get instant ring adjustment counts for every club.",
    heading: "Golf Clash Live Wind Calculator & Ring System Tool",
    badge: "Interactive Gameplay Tool",
    type: "calculator",
    intro: "The Caddie's Compass Live Wind Calculator gives you instant, accurate ring adjustments for any Golf Clash shot. Drag the interactive wind compass to set wind angle and speed, dial in distance and elevation, and read the exact number of rings to pull.",
    proTips: [
      {
        title: "Drag-First Wind Compass",
        text: "Drag the vector arrow directly inside the compass circle. The dial is scaled non-linearly: 0 to 8 mph occupies 80% of the radius for fingertip precision in standard tour winds.",
      },
      {
        title: "Target Pull Direction Indicator",
        text: "The red line on the target rings shows your exact counter-adjustment pull direction. Pull your bullseye directly opposite the wind vector.",
      },
      {
        title: "Secondary Wind Effect (SWE) Readout",
        text: "The calculator breaks down crosswind and headwind components, giving you estimated ball guide deflection in grid squares after bounce.",
      },
      {
        title: "Widget Mode for In-Game Play",
        text: "Toggle Widget Mode in the header for a compact, single-screen HUD overlay designed to sit alongside your mobile device or tablet while playing.",
      },
    ],
    faqs: [
      {
        q: "How do you calculate wind in Golf Clash?",
        a: "To calculate wind adjustments: 1) Multiply the wind speed by the elevation multiplier (e.g. 10 mph + 10% elevation = 11 mph effective wind). 2) Find your club's Wind Per Ring (WPR) value for your current distance (Max, Mid, or Min). 3) Divide effective wind by WPR to get rings to adjust (e.g. 11 mph / 2.2 WPR = 5.0 rings).",
      },
      {
        q: "What does the distance slider do?",
        a: "Club power determines ring size. When you hit at maximum distance, the target is largest (canceling more wind). As you pull back towards minimum distance, the target shrinks, requiring more rings for the same wind speed.",
      },
      {
        q: "Is this Golf Clash wind calculator free to use?",
        a: "Yes, The Caddie's Compass is 100% free with no paywalls, accounts, or pop-up ads. You can also install it as a PWA app on your phone or tablet.",
      },
    ],
  },

  "/golf-clash-ring-system": {
    path: "/golf-clash-ring-system",
    title: "Golf Clash Ring System Guide & Ring Method Calculator",
    metaTitle: "Golf Clash Ring System Guide – The Caddie's Compass",
    description: "Master the Golf Clash ring system. Complete guide to target ring colors, accuracy formulas, max/mid/min distances, and ring pulling techniques to land pinpoint shots.",
    heading: "The Complete Golf Clash Ring System Guide",
    badge: "Core Gameplay Mechanic",
    type: "ring-system",
    intro: "The Golf Clash ring system (or ring method) is the mathematical technique used by competitive players to compensate for wind. Every target circle on the course is composed of 5 concentric rings. By knowing how much wind each ring cancels out for your specific club, you can land shots directly on target in any wind condition.",
    proTips: [
      {
        title: "The 5 Concentric Target Rings",
        text: "Yellow Bullseye Center = 1.0 Ring. Orange Inner Ring = 2.0 Rings. Blue Middle Ring = 3.0 Rings. Clear / Translucent Ring = 4.0 Rings. White Outer Ring Edge = 5.0 Rings.",
      },
      {
        title: "Rotate Screen to Pull Straight Down",
        text: "Always rotate your device screen so the wind arrow points directly straight up (12 o'clock). This allows you to pull your target straight down along your device bezel without accidental curl.",
      },
      {
        title: "Takeoff Point Alignment",
        text: "Use the bottom of your ball target circle or the needle release ring as an alignment straightedge against course yardage lines for sub-millimeter precision.",
      },
      {
        title: "Adjusting More Than 5 Rings",
        text: "For high wind shots requiring more than 5 rings (e.g. 8 rings), pull 5 full rings (center to white edge), remember your visual landmark, and pull the remaining 3 rings from that landmark.",
      },
    ],
    faqs: [
      {
        q: "What are the ring values in Golf Clash?",
        a: "From the center bullseye outward: The Yellow center bullseye has a radius of 1 ring. The Orange ring is 2 rings from center. The Blue ring is 3 rings. The Clear/Grey ring is 4 rings. The outer White ring edge is exactly 5 rings from center.",
      },
      {
        q: "What is the Golf Clash ring formula?",
        a: "Rings to Adjust = (Wind Speed × (1 + Elevation % / 100)) / Wind Per Ring. The Wind Per Ring (WPR) is calculated from the club's accuracy and current power distance.",
      },
      {
        q: "How does club accuracy affect ring size?",
        a: "Higher accuracy clubs (like Sniper 10 with 100 accuracy) have much smaller rings, meaning each ring cancels less wind (~1.0 mph/ring). Lower accuracy clubs (like Extra Mile with 45 accuracy) have larger rings that cancel more wind (~2.1 mph/ring).",
      },
    ],
  },

  "/golf-clash-wind-chart": {
    path: "/golf-clash-wind-chart",
    title: "Golf Clash Wind Chart – Printable Bag Charts & Ring Values",
    metaTitle: "Golf Clash Wind Chart Generator – The Caddie's Compass",
    description: "Generate a custom Golf Clash wind chart for your bag loadout. Instant max, mid, and min power-ring adjustments for all 7 club categories. Free 1-click printable PDF.",
    heading: "Golf Clash Wind Chart Generator & Bag Reference",
    badge: "Print & Tournament Tool",
    type: "wind-chart",
    intro: "Create a complete, custom Golf Clash wind adjustment chart tailored to your exact club bag and levels. View max, mid, and min power adjustments in either Wind-per-Ring or Rings-per-Wind format, with instant 1-click printable PDF export formatted for tournament sheets.",
    proTips: [
      {
        title: "Wind per Ring vs Rings per Wind",
        text: "Wind per Ring shows how many mph 1 ring cancels. Rings per Wind is a pre-calculated reference matrix showing exact ring counts for wind speeds from 1.0 to 16.0 mph.",
      },
      {
        title: "Single-Page PDF Sheet",
        text: "Click 'Print / Save PDF' to generate an optimized, single-page tournament reference card showing all 7 clubs in your bag without clutter or page breaks.",
      },
      {
        title: "Ball Power Scaling",
        text: "Changing your ball power (P0 to P5) dynamically recalculates ring adjustment values. Higher power balls increase club carry distance, which slightly increases ring sensitivity.",
      },
      {
        title: "Multi-Bag Profiles",
        text: "Save separate bag profiles for Tour Play, Par 3 Shootouts, and Tournament Master Brackets. Switch bags with a single click.",
      },
    ],
    faqs: [
      {
        q: "How do I make a Golf Clash wind chart?",
        a: "Select your 7 clubs in The Caddie's Compass, dial in their levels, and select your golf ball power. The tool instantly generates a complete wind chart table showing Max, Mid, and Min adjustments for every club.",
      },
      {
        q: "Can I print my Golf Clash wind chart?",
        a: "Yes! Click the 'Print / Save PDF' button at the top of the chart. The app formats your 7-club bag into a clean, one-sided tournament reference sheet suitable for printing or saving to your tablet.",
      },
      {
        q: "What wind step should I use for Rings per Wind?",
        a: "0.5 mph is the standard tournament increment. For extreme high-wind Master tournaments (12+ mph), a 0.2 mph step gives the highest precision.",
      },
    ],
  },

  "/golf-clash-elevation-calculator": {
    path: "/golf-clash-elevation-calculator",
    title: "Golf Clash Elevation Calculator – Downhill & Uphill Wind Adjustments",
    metaTitle: "Golf Clash Elevation Calculator – The Caddie's Compass",
    description: "Accurate Golf Clash elevation calculator. Master downhill (+10%, +20%, +30%) and uphill (-10%) wind adjustments. Learn the elevation formula and tournament rules of thumb.",
    heading: "Golf Clash Elevation Calculator & Adjustment Guide",
    badge: "Advanced Course Strategy",
    type: "elevation",
    intro: "Elevation is the hidden multiplier that turns good Golf Clash shots into perfect drops. Because ball flight duration increases on downhill drops and decreases on uphill rises, wind has more or less time to push your ball. Use this guide and live calculator to master elevation percentages.",
    proTips: [
      {
        title: "The Standard Elevation Formula",
        text: "Effective Wind = Raw Wind × (1 + Elevation % / 100). For example, 10.0 mph wind with +20% downhill elevation behaves like 12.0 mph of wind. Pull rings for 12.0 mph.",
      },
      {
        title: "Tee Shot Downhill Baseline (+10%)",
        text: "Most driver tee shots drop from an elevated tee box down into the fairway valley. Starting with a +10% elevation baseline prevents landing short into fairway bunkers.",
      },
      {
        title: "Island Green Drop Shots (+20% to +35%)",
        text: "Par 3s with island greens or steep cliffs require significant downhill elevation. A shot with 12 mph wind at +30% elevation requires adjusting for 15.6 mph of wind.",
      },
      {
        title: "Uphill Approaching Greens (-10%)",
        text: "When hitting up into an elevated green, the ball hits the ground earlier in its trajectory. Apply -10% elevation to prevent over-adjusting into back rough.",
      },
    ],
    faqs: [
      {
        q: "How does elevation work in Golf Clash?",
        a: "Elevation accounts for vertical elevation changes between your tee/lie and the landing target. Downhill shots give the wind more hangtime to blow the ball, requiring extra ring adjustment (+10% to +35%). Uphill shots hit the ground sooner, requiring fewer rings (-10% to -20%).",
      },
      {
        q: "What is 10% elevation in Golf Clash?",
        a: "+10% elevation means you add 10% to the wind speed before calculating rings. If the wind is 8.0 mph, you calculate for 8.8 mph (8.0 × 1.10 = 8.8 mph).",
      },
      {
        q: "How do you know the elevation of a hole?",
        a: "Tournament text guides and hole walkthroughs document verified elevation baselines. As a rule of thumb, level shots are 0%, gentle drops are +10%, steep fairway drops are +20%, and cliff/island drops are +25% to +35%.",
      },
    ],
  },
};

export const ALL_LANDING_PATHS = Object.keys(LANDING_PAGES);
