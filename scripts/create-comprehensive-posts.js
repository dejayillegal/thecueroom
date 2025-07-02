/**
 * Create comprehensive test posts for all hashtag categories
 * Direct database insertion for reliable test data
 */

import { db } from '../server/db.js';
import { posts } from '../shared/schema.js';

const comprehensiveTestPosts = [
  // #production posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Advanced Sound Design Techniques for Underground Music",
    content: "Diving deep into granular synthesis and spectral processing. The possibilities for creating unique textures are endless when you combine Max4Live devices with custom sample manipulation. Been working on this new approach for months.",
    tags: ["production", "sounddesign", "max4live"],
    likesCount: 23,
    commentsCount: 5
  },
  {
    userId: "user_f744a20301a93c41", 
    title: "Mixing in Mono - Complete Game Changer",
    content: "Started mixing my tracks in mono and the improvement is incredible. Forces you to focus on the core elements and ensures your track translates well on any system. This technique changed everything for me.",
    tags: ["production", "mixing", "tip"],
    likesCount: 31,
    commentsCount: 8
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "Hardware Integration in Digital Workflow", 
    content: "Successfully integrated my analog synths into a mostly digital workflow. The key is using DC-coupled audio interfaces and proper gain staging. The warmth is real!",
    tags: ["production", "hardware", "analog"],
    likesCount: 18,
    commentsCount: 3
  },
  
  // #troubleshooting posts
  {
    userId: "user_f744a20301a93c41",
    title: "CPU Optimization for Live Performance Setup",
    content: "Been getting crackling during live sets. Fixed it by freezing tracks, using external hardware for effects, and optimizing buffer settings. Here are my optimization tricks that saved my performances.",
    tags: ["troubleshooting", "performance", "livesets"],
    likesCount: 27,
    commentsCount: 12
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Solving Phase Issues in Kick Drums",
    content: "Had serious phase cancellation issues with my kick drums in the club. Solution: checking mono compatibility and using linear phase EQ for surgical cuts. Game changer for club systems.",
    tags: ["troubleshooting", "mixing", "kicks"],
    likesCount: 22,
    commentsCount: 7
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "MIDI Sync Issues Between DAW and Hardware",
    content: "Spent hours debugging MIDI sync drift between Ableton and my hardware sequencer. The solution was using a dedicated MIDI clock interface. No more timing issues!",
    tags: ["troubleshooting", "midi", "sync"],
    likesCount: 19,
    commentsCount: 4
  },

  // #memes posts
  {
    userId: "user_75bd6d54328509f8",
    title: "When Your Track Finally Drops After Months",
    content: "That moment when you've been teasing a track for months and it finally releases... but Spotify pays you 0.003 cents per stream. The underground struggle is real!",
    tags: ["memes", "producer", "streaming"],
    likesCount: 45,
    commentsCount: 15
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Producer Problems: Never Finished Syndrome", 
    content: "Me: This track is finished! Also me: *adds 47 more layers and changes the entire arrangement* Why can't we just call it done?",
    tags: ["memes", "producer", "studio"],
    likesCount: 38,
    commentsCount: 11
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "When Non-Producers Ask About Your Music",
    content: "Them: 'So you make beats?' Me: *proceeds to explain the difference between techno, house, and electronic music for 20 minutes*",
    tags: ["memes", "explanation", "genres"],
    likesCount: 33,
    commentsCount: 9
  },

  // #techno posts
  {
    userId: "user_f744a20301a93c41",
    title: "Detroit Techno Influence on Modern Underground Production",
    content: "Studying classic Plastikman and Underground Resistance tracks. The minimalism and space in these productions is something modern techno desperately needs to remember. Less is more.",
    tags: ["techno", "detroit", "minimalism"],
    likesCount: 34,
    commentsCount: 13
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Berlin Techno Scene Evolution and Impact",
    content: "Berlin's techno scene keeps evolving from hard industrial sounds to more experimental territories. The underground venues there are pushing boundaries constantly. Respect to the scene!",
    tags: ["techno", "berlin", "underground"],
    likesCount: 29,
    commentsCount: 8
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "Industrial Techno Production Techniques",
    content: "Working on some proper industrial techno. Heavy use of distortion, metallic percussion samples, and that warehouse reverb. The key is controlled chaos in the arrangement.",
    tags: ["techno", "industrial", "production"],
    likesCount: 26,
    commentsCount: 6
  },

  // #house posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Classic Chicago House Chord Progressions Deep Dive",
    content: "Breaking down those iconic Chicago house progressions from the 80s. The way they used 7th and 9th chords to create that soulful feeling is pure magic. This is the foundation of house music.",
    tags: ["house", "chicago", "chords"],
    likesCount: 41,
    commentsCount: 14
  },
  {
    userId: "user_f744a20301a93c41",
    title: "UK Garage Influence on Modern Deep House",
    content: "Experimenting with UK garage rhythms in deep house contexts. The syncopated patterns add incredible groove to traditional 4/4 house structures. The fusion works perfectly.",
    tags: ["house", "ukgarage", "deephouse"],
    likesCount: 33,
    commentsCount: 10
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "Vocal House Production: Finding the Perfect Balance",
    content: "Working with vocalists on house tracks. The challenge is balancing the vocal with the instrumental without losing the groove. Side-chain compression is your friend here.",
    tags: ["house", "vocals", "production"],
    likesCount: 28,
    commentsCount: 7
  },

  // Additional hashtag categories
  {
    userId: "user_f744a20301a93c41",
    title: "Ableton Live 12 New Features Review",
    content: "The new MIDI tools in Live 12 are game-changing. The chord generator and scale awareness features are speeding up my workflow significantly. Worth the upgrade!",
    tags: ["ableton", "live12", "workflow"],
    likesCount: 36,
    commentsCount: 9
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "FL Studio vs Ableton: Workflow Comparison",
    content: "Switched from FL to Ableton for live performance but still love FL's piano roll for composition. The pattern-based workflow in FL is unmatched for certain types of house production.",
    tags: ["flstudio", "workflow", "comparison"],
    likesCount: 24,
    commentsCount: 6
  },
  {
    userId: "user_bf92fe243b2fcf5b",
    title: "Multi-DAW Production Approach Strategy",
    content: "Using different DAWs for different stages: Logic for recording, Ableton for arrangement, Pro Tools for mixing. Each DAW has its strengths when used properly.",
    tags: ["daw", "workflow", "mixing"],
    likesCount: 32,
    commentsCount: 8
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Pioneer CDJ-3000 Performance Features Deep Dive",
    content: "The new Pioneer CDJ-3000s are incredible for live techno sets. The beat jump and loop features let you create live remixes on the fly. The touch screen is responsive even in dark clubs.",
    tags: ["pioneer", "cdj", "performance"],
    likesCount: 29,
    commentsCount: 5
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Native Instruments Kontrol S88 Review",
    content: "The NI Kontrol S88 integration with Ableton is seamless. The weighted keys make playing bass lines and leads feel like a real instrument. Perfect for studio and live use.",
    tags: ["ni", "kontrol", "keyboard"],
    likesCount: 21,
    commentsCount: 4
  }
];

async function createComprehensivePosts() {
  try {
    console.log('Creating comprehensive test posts for all hashtag categories...');
    
    for (const postData of comprehensiveTestPosts) {
      const createdPost = await db.insert(posts).values({
        ...postData,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
      }).returning();
      
      console.log(`✓ Created: "${postData.title}"`);
    }
    
    console.log(`\n✅ Successfully created ${comprehensiveTestPosts.length} comprehensive test posts!`);
    console.log('📊 Categories covered: production, troubleshooting, memes, techno, house, ableton, flstudio, daw, pioneer, ni, and more');
    
  } catch (error) {
    console.error('❌ Error creating comprehensive posts:', error);
  }
}

createComprehensivePosts().then(() => {
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});