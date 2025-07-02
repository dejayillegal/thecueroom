/**
 * Add comprehensive test posts for all hashtag categories
 */

import { storage } from '../server/storage.js';

const hashtagPosts = [
  // #production posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Advanced Sound Design Techniques",
    content: "Diving deep into granular synthesis and spectral processing. The possibilities for creating unique textures are endless when you combine Max4Live devices with custom sample manipulation.",
    tags: ["production", "sounddesign", "max4live"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Mixing in Mono - Game Changer",
    content: "Started mixing my tracks in mono and the improvement is incredible. Forces you to focus on the core elements and ensures your track translates well on any system.",
    tags: ["production", "mixing", "tip"],
    author: "ACID_REIGN"
  },

  // #troubleshooting posts
  {
    userId: "user_75bd6d54328509f8", 
    title: "CPU Optimization for Live Performance",
    content: "Been getting crackling during live sets. Fixed it by freezing tracks, using external hardware for effects, and optimizing buffer settings. What are your CPU optimization tricks?",
    tags: ["troubleshooting", "performance", "tip"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Solving Phase Issues in Kicks",
    content: "Had phase cancellation issues with my kick drums. Solution: checking mono compatibility and using linear phase EQ for surgical cuts. Game changer for club systems.",
    tags: ["troubleshooting", "mixing", "kicks"],
    author: "ACID_REIGN"
  },

  // #memes posts
  {
    userId: "user_75bd6d54328509f8",
    title: "When Your Track Finally Drops",
    content: "That moment when you've been teasing a track for months and it finally releases... but Spotify pays you 0.003 cents per stream 😅",
    tags: ["memes", "producer", "spotify"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Producer Problems Meme",
    content: "Me: This track is finished! Also me: *adds 47 more layers and changes the entire arrangement* 🎹",
    tags: ["memes", "producer", "studio"],
    author: "ACID_REIGN"
  },

  // #techno posts  
  {
    userId: "user_75bd6d54328509f8",
    title: "Detroit Techno Influence on Modern Production",
    content: "Studying classic Plastikman and Underground Resistance tracks. The minimalism and space in these productions is something modern techno needs to remember.",
    tags: ["techno", "detroit", "minimalism"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Berlin Techno Scene Evolution",
    content: "Berlin's techno scene keeps evolving. From hard industrial sounds to more experimental territories. The underground venues there are pushing boundaries constantly.",
    tags: ["techno", "berlin", "underground"],
    author: "ACID_REIGN"
  },

  // #house posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Classic Chicago House Chord Progressions",
    content: "Breaking down those iconic Chicago house progressions. The way they used 7th and 9th chords to create that soulful feeling is pure magic.",
    tags: ["house", "chicago", "chords"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "UK Garage Meets Deep House",
    content: "Experimenting with UK garage rhythms in deep house contexts. The syncopated patterns add so much groove to traditional 4/4 house structures.",
    tags: ["house", "ukgarage", "deephouse"],
    author: "ACID_REIGN"
  },

  // #ableton posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Ableton Live 12 New Features",
    content: "The new MIDI tools in Live 12 are incredible. The chord generator and scale awareness features are speeding up my workflow significantly.",
    tags: ["ableton", "live12", "workflow"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Max4Live Device Recommendations",
    content: "Essential Max4Live devices for techno production: LFO, Envelope Follower, and CV Instrument. These three devices alone open up endless modulation possibilities.",
    tags: ["ableton", "max4live", "modulation"],
    author: "ACID_REIGN"
  },

  // #flstudio posts
  {
    userId: "user_75bd6d54328509f8",
    title: "FL Studio vs Ableton Workflow",
    content: "Switched from FL to Ableton for live performance but still love FL's piano roll. The pattern-based workflow in FL is unmatched for certain types of production.",
    tags: ["flstudio", "workflow", "comparison"],
    author: "BASS_OVERLORD"
  },

  // #daw posts  
  {
    userId: "user_f744a20301a93c41",
    title: "Multi-DAW Production Approach",
    content: "Using different DAWs for different stages: Logic for recording, Ableton for arrangement, Pro Tools for mixing. Each DAW has its strengths.",
    tags: ["daw", "workflow", "mixing"],
    author: "ACID_REIGN"
  },

  // #electronicequipments posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Essential Studio Monitor Setup",
    content: "Upgraded to Focal Alpha 80s and the difference is night and day. Proper monitor positioning and acoustic treatment made an even bigger difference though.",
    tags: ["electronicequipments", "monitors", "studio"],
    author: "BASS_OVERLORD"
  },

  // #pioneer posts
  {
    userId: "user_f744a20301a93c41",
    title: "Pioneer CDJ-3000 Performance Features",
    content: "The new Pioneer CDJ-3000s are incredible for live techno sets. The beat jump and loop features let you create live remixes on the fly.",
    tags: ["pioneer", "cdj", "performance"],
    author: "ACID_REIGN"
  },

  // #ni posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Native Instruments Kontrol S88",
    content: "The NI Kontrol S88 integration with Ableton is seamless. The weighted keys make playing bass lines and leads feel like a real instrument.",
    tags: ["ni", "kontrol", "keyboard"],
    author: "BASS_OVERLORD"
  },

  // #digitak posts
  {
    userId: "user_f744a20301a93c41",
    title: "Elektron Digitakt in Live Set",
    content: "Using the Digitakt as the brain of my live setup. The sampling capabilities and sequencer make it perfect for creating evolving techno arrangements.",
    tags: ["digitak", "elektron", "liveperformance"],
    author: "ACID_REIGN"
  },

  // #controller posts
  {
    userId: "user_75bd6d54328509f8",
    title: "MIDI Controller Setup for Production",
    content: "My production setup: Push 2 for Ableton, Keystep Pro for hardware sequencing, and a custom MIDI fighter for effects control. Hardware workflow is essential.",
    tags: ["controller", "midi", "hardware"],
    author: "BASS_OVERLORD"
  },

  // #modular posts
  {
    userId: "user_f744a20301a93c41",
    title: "Eurorack Modular in Electronic Music",
    content: "Added a small Eurorack system to my setup. The unpredictability and happy accidents from modular synthesis bring life to digital productions.",
    tags: ["modular", "eurorack", "synthesis"],
    author: "ACID_REIGN"
  },

  // #synth posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Analog Synth vs Software Comparison",
    content: "A/B tested my Moog Sub 37 against Serum. While software is incredibly flexible, there's something about analog saturation and filter behavior that's irreplaceable.",
    tags: ["synth", "analog", "software"],
    author: "BASS_OVERLORD"
  },

  // #drummachine posts  
  {
    userId: "user_f744a20301a93c41",
    title: "Roland TR-8S Drum Machine Review",
    content: "The TR-8S brings classic Roland drum sounds into modern production. The individual outputs and effects make it perfect for live techno performances.",
    tags: ["drummachine", "roland", "tr8s"],
    author: "ACID_REIGN"
  },

  // #sequencer posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Hardware Sequencer Workflow Benefits",
    content: "Using hardware sequencers changed my creative process. The limitations force you to be more intentional with your musical choices.",
    tags: ["sequencer", "hardware", "workflow"],
    author: "BASS_OVERLORD"
  },

  // #303 posts
  {
    userId: "user_f744a20301a93c41",
    title: "TB-303 Acid Bassline Techniques",
    content: "The secret to great 303 lines: start simple, use slides sparingly, and let the filter do the talking. Less is more with the acid sound.",
    tags: ["303", "acid", "bassline"],
    author: "ACID_REIGN"
  },

  // #bassline posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Sub Bass Production Techniques",
    content: "For powerful sub bass: high-pass everything else, use parallel compression, and always check mono compatibility. The low end is where tracks live or die.",
    tags: ["bassline", "subbass", "mixing"],
    author: "BASS_OVERLORD"
  }
];

async function addHashtagPosts() {
  console.log("Adding comprehensive hashtag posts...");
  
  for (const post of hashtagPosts) {
    try {
      await storage.createPost({
        userId: post.userId,
        title: post.title,
        content: post.content,
        tags: post.tags,
        author: post.author,
        likesCount: Math.floor(Math.random() * 30) + 10,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      });
      console.log(`✓ Created: "${post.title}"`);
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
    }
  }
  
  console.log("Hashtag posts creation complete!");
}

export { addHashtagPosts };