/**
 * Script to create comprehensive test posts for all hashtag categories
 * Underground music community forum content
 */

const testPosts = [
  // Production Posts
  {
    title: "New acid track feedback needed - 303 squelch perfection?",
    content: "Been working on this acid banger for weeks. The 303 line is sitting pretty nasty but wondering if the filter sweep needs more bite. Looking for ears from fellow producers. Link in comments. #production #303 #acidhouse",
    hashtags: ["production", "303", "acidhouse"],
    userId: "user_f744a20301a93c41"
  },
  {
    title: "Kick drums sitting muddy in the mix - Need production tips",
    content: "My kicks are getting lost when I layer the bassline. EQing around 60Hz but still feels weak. Anyone got secret sauce for that punchy underground sound? Using Ableton with some analog outboard. #production #mixing #techno",
    hashtags: ["production", "mixing", "techno"],
    userId: "user_75bd6d54328509f8"
  },

  // Troubleshooting Posts  
  {
    title: "CDJ-3000 USB issues - tracks not loading properly",
    content: "Having nightmare with my CDJs tonight. USB sticks formatted correctly but tracks keep hanging on load. Anyone experienced this? Gig tomorrow and stress levels through the roof. #troubleshooting #cdj #pioneer",
    hashtags: ["troubleshooting", "cdj", "pioneer"],
    userId: "user_bf92fe243b2fcf5b"
  },
  {
    title: "Ableton crashing during live sets - CPU spikes",
    content: "Live 12 keeps crashing mid-set when using heavy Operator patches. Buffer size at 256, still getting dropouts. Thinking it's the reverb sends but not sure. Anyone found solid workarounds? #troubleshooting #ableton #live",
    hashtags: ["troubleshooting", "ableton", "live"],
    userId: "user_f744a20301a93c41"
  },

  // Memes Posts
  {
    title: "When the 303 filter sweep hits just right...",
    content: "That moment when you dial in the perfect acid line and suddenly understand why Roland discontinued the TB-303. *chef's kiss* Who else gets emotional over analog squelch? #memes #303 #acidhouse #analog",
    hashtags: ["memes", "303", "acidhouse"],
    userId: "user_75bd6d54328509f8"
  },
  {
    title: "POV: You're explaining why you need another synthesizer",
    content: "Wife: 'Don't you already have enough synths?'\nMe: 'But this one has a different filter...' *shows Moog Matriarch*\nWife: *sigh*\nMe: *orders anyway* #memes #synth #gearacquisition",
    hashtags: ["memes", "synth", "gear"],
    userId: "user_bf92fe243b2fcf5b"
  },

  // Techno Posts
  {
    title: "Berlin warehouse vibes - Industrial techno session",
    content: "Just finished a 6-hour session working on some proper Berlin-style industrial techno. Heavy kicks, metallic percussion, and that underground warehouse atmosphere. Anyone else feeling the return to harder sounds? #techno #industrial #berlin",
    hashtags: ["techno", "industrial", "berlin"],
    userId: "user_f744a20301a93c41"
  },
  {
    title: "Minimal techno is making a comeback - thoughts?",
    content: "Hearing more stripped-down minimal sets lately. The micro-house influence is strong but keeping that techno edge. Ricardo Villalobos was ahead of his time. What's everyone's take on the minimal resurgence? #techno #minimal #microhouse",
    hashtags: ["techno", "minimal", "microhouse"],
    userId: "user_75bd6d54328509f8"
  },

  // House Posts
  {
    title: "Deep house chord progressions - classic vs modern",
    content: "Been studying those classic Chicago house chord progressions. Modern deep house seems to have lost some of that soulful quality. Anyone else miss the raw emotion of early Frankie Knuckles tracks? #house #deephouse #chicago",
    hashtags: ["house", "deephouse", "chicago"],
    userId: "user_bf92fe243b2fcf5b"
  },
  {
    title: "UK garage influence on house music evolution",
    content: "Notice how UK garage elements are creeping into house productions? The syncopated rhythms and skippy hi-hats are giving house a fresh perspective. Speed garage revival incoming? #house #ukgarage #evolution",
    hashtags: ["house", "ukgarage", "evolution"],
    userId: "user_f744a20301a93c41"
  },

  // Ableton Posts
  {
    title: "Live 12 new features for electronic music production",
    content: "The new MIDI transformation tools in Live 12 are game-changers for techno production. The arpeggiator improvements and scale modes are perfect for acid sequences. Anyone diving deep into the update? #ableton #live12 #production",
    hashtags: ["ableton", "live12", "production"],
    userId: "user_75bd6d54328509f8"
  },
  {
    title: "Max for Live techno devices - hidden gems",
    content: "Found some incredible Max for Live devices for techno production. The TB-303 emulation and acid sequencer are spot-on. Sharing a list of must-have M4L devices for underground producers. #ableton #maxforlive #techno",
    hashtags: ["ableton", "maxforlive", "techno"],
    userId: "user_bf92fe243b2fcf5b"
  },

  // FL Studio Posts
  {
    title: "FL Studio 21 lifetime updates worth it for electronic music?",
    content: "Considering switching from Ableton to FL for the lifetime updates. The step sequencer looks perfect for techno patterns. Anyone made the switch recently? How's the workflow for underground electronic music? #flstudio #production #workflow",
    hashtags: ["flstudio", "production", "workflow"],
    userId: "user_f744a20301a93c41"
  },

  // Electronic Equipment Posts
  {
    title: "Analog vs digital debate - 2024 perspective",
    content: "Still hearing producers argue analog superiority. Modern digital processing is incredible but there's something about analog saturation and drift. Using both in hybrid setups seems optimal. Thoughts? #electronicequipments #analog #digital",
    hashtags: ["electronicequipments", "analog", "digital"],
    userId: "user_75bd6d54328509f8"
  },
  {
    title: "Eurorack modular setup for techno - beginner advice",
    content: "Looking to start a modular setup focused on techno production. Thinking VCO, filter, sequencer, and effects as basics. Budget around ₹1,50,000. What modules would you prioritize for underground sounds? #electronicequipments #modular #eurorack",
    hashtags: ["electronicequipments", "modular", "eurorack"],
    userId: "user_bf92fe243b2fcf5b"
  },

  // Pioneer Posts
  {
    title: "CDJ-3000 vs XDJ-RX3 for underground gigs",
    content: "Venue has CDJ-3000s but considering bringing XDJ-RX3 for backup. The standalone capability is clutch but CDJ workflow is industry standard. What's everyone using for underground warehouse parties? #pioneer #cdj #xdj",
    hashtags: ["pioneer", "cdj", "xdj"],
    userId: "user_f744a20301a93c41"
  },

  // Native Instruments Posts
  {
    title: "Maschine+ for live techno performances",
    content: "Been using Maschine+ for live sets and the workflow is incredible. The sampling capabilities for live remix work are unmatched. Anyone else performing live techno with Maschine? Tips for crowd interaction? #ni #maschine #liveperformance",
    hashtags: ["ni", "maschine", "liveperformance"],
    userId: "user_75bd6d54328509f8"
  },

  // Elektron Digitakt Posts
  {
    title: "Digitakt sampling workflow for techno production",
    content: "The Digitakt's sampling engine is perfect for chopping breaks and creating techno percussion. The filter and overdrive add that gritty underground character. Sharing my sampling workflow and pattern organization. #digitakt #elektron #sampling",
    hashtags: ["digitakt", "elektron", "sampling"],
    userId: "user_bf92fe243b2fcf5b"
  },

  // Controller Posts
  {
    title: "DJ Controller vs CDJs - skills transfer debate",
    content: "Started on controller but moving to CDJs for club gigs. The muscle memory is different but mixing fundamentals transfer. Anyone else made this transition? How long did adaptation take? #controller #cdj #djing",
    hashtags: ["controller", "cdj", "djing"],
    userId: "user_f744a20301a93c41"
  },

  // Synthesizer Posts
  {
    title: "TB-303 vs modern acid machines comparison",
    content: "Got hands on original TB-303 and comparing to Behringer TD-3 and Roland SH-01. The 303 has that unstable magic but modern clones are surprisingly close. Is the vintage premium worth it? #synth #303 #acid",
    hashtags: ["synth", "303", "acid"],
    userId: "user_75bd6d54328509f8"
  },

  // Drum Machine Posts
  {
    title: "TR-909 samples vs hardware - can you hear difference?",
    content: "Blind tested TR-909 hardware against high-quality samples. In mix context, surprisingly hard to distinguish. But the workflow and hands-on control of hardware is irreplaceable. Thoughts on samples vs hardware? #drummachine #tr909 #hardware",
    hashtags: ["drummachine", "tr909", "hardware"],
    userId: "user_bf92fe243b2fcf5b"
  ],

  // Sequencer Posts
  {
    title: "Euclidean rhythms for techno - mathematical groove",
    content: "Been experimenting with Euclidean rhythm generators for techno patterns. The mathematical distribution creates interesting polyrhythms. Using Pamela's NEW Workout in modular setup. Anyone else into algorithmic sequencing? #sequencer #euclidean #modular",
    hashtags: ["sequencer", "euclidean", "modular"],
    userId: "user_f744a20301a93c41"
  },

  // Bassline Posts
  {
    title: "Sub-bass in club systems - frequency management",
    content: "Learning to produce for massive club systems. The sub-bass translation is tricky - sounds huge in studio but gets lost on big rigs. EQ techniques for club-ready basslines? Mono below 80Hz? #bassline #clubsystem #mixing",
    hashtags: ["bassline", "clubsystem", "mixing"],
    userId: "user_75bd6d54328509f8"
  },

  // Tips Posts
  {
    title: "Sidechain compression techniques for pumping techno",
    content: "Sidechain isn't just about pumping - it's about creating space and groove. Using longer release times for subtle breathing effect vs short for aggressive pump. Ghost kick triggers work wonders. What's your sidechain philosophy? #tip #sidechain #techno",
    hashtags: ["tip", "sidechain", "techno"],
    userId: "user_bf92fe243b2fcf5b"
  },
  {
    title: "Building energy in 8-minute techno tracks",
    content: "Extended techno tracks need careful energy management. Starting minimal and layering elements every 32-64 bars works well. The breakdown at 5-6 minutes is crucial for second wind. Structure tips for long-form underground tracks? #tip #arrangement #techno",
    hashtags: ["tip", "arrangement", "techno"],
    userId: "user_f744a20301a93c41"
  }
];

console.log(`Generated ${testPosts.length} test posts for hashtag categories`);
console.log('Hashtags covered:', [...new Set(testPosts.flatMap(p => p.hashtags))].sort());

module.exports = testPosts;