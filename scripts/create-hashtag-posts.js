/**
 * Create comprehensive test posts for all hashtag categories
 */

import { storage } from '../server/storage.ts';

const comprehensiveHashtagPosts = [
  // Multiple #production posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Advanced Sound Design Techniques for Underground Music",
    content: "Diving deep into granular synthesis and spectral processing. The possibilities for creating unique textures are endless when you combine Max4Live devices with custom sample manipulation. Been working on this new approach for months.",
    tags: ["production", "sounddesign", "max4live"],
    author: "BASS_OVERLORD",
    likesCount: 23
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Mixing in Mono - Complete Game Changer",
    content: "Started mixing my tracks in mono and the improvement is incredible. Forces you to focus on the core elements and ensures your track translates well on any system. This technique changed everything for me.",
    tags: ["production", "mixing", "tip"],
    author: "ACID_REIGN",
    likesCount: 31
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Hardware Integration in Digital Workflow",
    content: "Successfully integrated my analog synths into a mostly digital workflow. The key is using DC-coupled audio interfaces and proper gain staging. The warmth is real!",
    tags: ["production", "hardware", "analog"],
    author: "BASS_OVERLORD",
    likesCount: 18
  },

  // Multiple #troubleshooting posts
  {
    userId: "user_f744a20301a93c41",
    title: "CPU Optimization for Live Performance Setup",
    content: "Been getting crackling during live sets. Fixed it by freezing tracks, using external hardware for effects, and optimizing buffer settings. Here are my optimization tricks that saved my performances.",
    tags: ["troubleshooting", "performance", "livesets"],
    author: "ACID_REIGN",
    likesCount: 27
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Solving Phase Issues in Kick Drums",
    content: "Had serious phase cancellation issues with my kick drums in the club. Solution: checking mono compatibility and using linear phase EQ for surgical cuts. Game changer for club systems.",
    tags: ["troubleshooting", "mixing", "kicks"],
    author: "BASS_OVERLORD",
    likesCount: 22
  },
  {
    userId: "user_f744a20301a93c41",
    title: "MIDI Sync Issues Between DAW and Hardware",
    content: "Spent hours debugging MIDI sync drift between Ableton and my hardware sequencer. The solution was using a dedicated MIDI clock interface. No more timing issues!",
    tags: ["troubleshooting", "midi", "sync"],
    author: "ACID_REIGN",
    likesCount: 19
  },

  // Multiple #memes posts
  {
    userId: "user_75bd6d54328509f8",
    title: "When Your Track Finally Drops After Months",
    content: "That moment when you've been teasing a track for months and it finally releases... but Spotify pays you 0.003 cents per stream. The underground struggle is real!",
    tags: ["memes", "producer", "streaming"],
    author: "BASS_OVERLORD",
    likesCount: 45
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Producer Problems: Never Finished Syndrome",
    content: "Me: This track is finished! Also me: *adds 47 more layers and changes the entire arrangement* Why can't we just call it done?",
    tags: ["memes", "producer", "studio"],
    author: "ACID_REIGN",
    likesCount: 38
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "When Non-Producers Ask About Your Music",
    content: "Them: 'So you make beats?' Me: *proceeds to explain the difference between techno, house, and electronic music for 20 minutes*",
    tags: ["memes", "explanation", "genres"],
    author: "BASS_OVERLORD",
    likesCount: 52
  },

  // Multiple #techno posts
  {
    userId: "user_f744a20301a93c41",
    title: "Detroit Techno Influence on Modern Underground Production",
    content: "Studying classic Plastikman and Underground Resistance tracks. The minimalism and space in these productions is something modern techno desperately needs to remember. Less is more.",
    tags: ["techno", "detroit", "minimalism"],
    author: "ACID_REIGN",
    likesCount: 34
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Berlin Techno Scene Evolution and Impact",
    content: "Berlin's techno scene keeps evolving from hard industrial sounds to more experimental territories. The underground venues there are pushing boundaries constantly. Respect to the scene!",
    tags: ["techno", "berlin", "underground"],
    author: "BASS_OVERLORD",
    likesCount: 29
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Industrial Techno Production Techniques",
    content: "Working on some proper industrial techno. Heavy use of distortion, metallic percussion samples, and that warehouse reverb. The key is controlled chaos in the arrangement.",
    tags: ["techno", "industrial", "production"],
    author: "ACID_REIGN",
    likesCount: 26
  },

  // Multiple #house posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Classic Chicago House Chord Progressions Deep Dive",
    content: "Breaking down those iconic Chicago house progressions from the 80s. The way they used 7th and 9th chords to create that soulful feeling is pure magic. This is the foundation of house music.",
    tags: ["house", "chicago", "chords"],
    author: "BASS_OVERLORD",
    likesCount: 41
  },
  {
    userId: "user_f744a20301a93c41",
    title: "UK Garage Influence on Modern Deep House",
    content: "Experimenting with UK garage rhythms in deep house contexts. The syncopated patterns add incredible groove to traditional 4/4 house structures. The fusion works perfectly.",
    tags: ["house", "ukgarage", "deephouse"],
    author: "ACID_REIGN",
    likesCount: 33
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Vocal House Production: Finding the Perfect Balance",
    content: "Working with vocalists on house tracks. The challenge is balancing the vocal with the instrumental without losing the groove. Side-chain compression is your friend here.",
    tags: ["house", "vocals", "production"],
    author: "BASS_OVERLORD",
    likesCount: 25
  },

  // Multiple #ableton posts
  {
    userId: "user_f744a20301a93c41",
    title: "Ableton Live 12 New Features Review",
    content: "The new MIDI tools in Live 12 are game-changing. The chord generator and scale awareness features are speeding up my workflow significantly. Worth the upgrade!",
    tags: ["ableton", "live12", "workflow"],
    author: "ACID_REIGN",
    likesCount: 36
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Essential Max4Live Devices for Techno",
    content: "My go-to Max4Live devices: LFO Tool, Envelope Follower, and CV Instrument. These three devices alone open up endless modulation possibilities for underground techno production.",
    tags: ["ableton", "max4live", "modulation"],
    author: "BASS_OVERLORD",
    likesCount: 28
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Ableton Push 3 Live Performance Setup",
    content: "Using Push 3 for live techno performances. The standalone mode is perfect for underground venues where laptop setups are risky. The workflow is incredibly intuitive.",
    tags: ["ableton", "push", "liveperformance"],
    author: "ACID_REIGN",
    likesCount: 31
  },

  // Multiple #flstudio posts
  {
    userId: "user_75bd6d54328509f8",
    title: "FL Studio vs Ableton: Workflow Comparison",
    content: "Switched from FL to Ableton for live performance but still love FL's piano roll for composition. The pattern-based workflow in FL is unmatched for certain types of house production.",
    tags: ["flstudio", "workflow", "comparison"],
    author: "BASS_OVERLORD",
    likesCount: 24
  },
  {
    userId: "user_f744a20301a93c41",
    title: "FL Studio Lifetime Updates: Still Worth It",
    content: "FL Studio's lifetime free updates policy is incredible. Been using it for 8 years and still getting major feature updates. The value proposition is unmatched in the industry.",
    tags: ["flstudio", "updates", "value"],
    author: "ACID_REIGN",
    likesCount: 19
  },

  // Multiple #daw posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Multi-DAW Production Approach Strategy",
    content: "Using different DAWs for different stages: Logic for recording, Ableton for arrangement, Pro Tools for mixing. Each DAW has its strengths when used properly.",
    tags: ["daw", "workflow", "mixing"],
    author: "BASS_OVERLORD",
    likesCount: 32
  },
  {
    userId: "user_f744a20301a93c41",
    title: "DAW Choice Doesn't Matter (Mostly)",
    content: "Spent years switching between DAWs. Truth is, once you know your tools well, the DAW becomes transparent. Focus on the music, not the software.",
    tags: ["daw", "philosophy", "focus"],
    author: "ACID_REIGN",
    likesCount: 27
  },

  // Multiple #gear posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Essential Studio Monitor Setup Guide",
    content: "Upgraded to Focal Alpha 80s and the difference is night and day. But proper monitor positioning and acoustic treatment made an even bigger difference than the monitors themselves.",
    tags: ["electronicequipments", "monitors", "acoustics"],
    author: "BASS_OVERLORD",
    likesCount: 35
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Pioneer CDJ-3000 Performance Features Deep Dive",
    content: "The new Pioneer CDJ-3000s are incredible for live techno sets. The beat jump and loop features let you create live remixes on the fly. The touch screen is responsive even in dark clubs.",
    tags: ["pioneer", "cdj", "performance"],
    author: "ACID_REIGN",
    likesCount: 29
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Native Instruments Kontrol S88 Review",
    content: "The NI Kontrol S88 integration with Ableton is seamless. The weighted keys make playing bass lines and leads feel like a real instrument. Perfect for studio and live use.",
    tags: ["ni", "kontrol", "keyboard"],
    author: "BASS_OVERLORD",
    likesCount: 21
  }
];

async function createHashtagPosts() {
  console.log("Creating comprehensive hashtag posts...");
  
  for (let i = 0; i < comprehensiveHashtagPosts.length; i++) {
    const post = comprehensiveHashtagPosts[i];
    try {
      const createdPost = await storage.createPost({
        userId: post.userId,
        title: post.title,
        content: post.content,
        tags: post.tags,
        author: post.author,
        likesCount: post.likesCount,
        createdAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000) // Random time within last 3 weeks
      });
      console.log(`✓ Created post ${i + 1}/${comprehensiveHashtagPosts.length}: "${post.title}"`);
    } catch (error) {
      console.log(`✗ Failed to create post: ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log("Comprehensive hashtag posts creation complete!");
}

// Run the creation
createHashtagPosts().catch(console.error);