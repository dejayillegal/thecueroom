/**
 * Populate comprehensive test posts for all hashtag categories via API
 */

const API_BASE = 'http://localhost:5000';

const comprehensiveHashtagPosts = [
  // Multiple #production posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Advanced Sound Design Techniques for Underground Music",
    content: "Diving deep into granular synthesis and spectral processing. The possibilities for creating unique textures are endless when you combine Max4Live devices with custom sample manipulation. Been working on this new approach for months.",
    tags: "production,sounddesign,max4live"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Mixing in Mono - Complete Game Changer",
    content: "Started mixing my tracks in mono and the improvement is incredible. Forces you to focus on the core elements and ensures your track translates well on any system. This technique changed everything for me.",
    tags: "production,mixing,tip"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Hardware Integration in Digital Workflow",
    content: "Successfully integrated my analog synths into a mostly digital workflow. The key is using DC-coupled audio interfaces and proper gain staging. The warmth is real!",
    tags: "production,hardware,analog"
  },

  // Multiple #troubleshooting posts
  {
    userId: "user_f744a20301a93c41",
    title: "CPU Optimization for Live Performance Setup",
    content: "Been getting crackling during live sets. Fixed it by freezing tracks, using external hardware for effects, and optimizing buffer settings. Here are my optimization tricks that saved my performances.",
    tags: "troubleshooting,performance,livesets"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Solving Phase Issues in Kick Drums",
    content: "Had serious phase cancellation issues with my kick drums in the club. Solution: checking mono compatibility and using linear phase EQ for surgical cuts. Game changer for club systems.",
    tags: "troubleshooting,mixing,kicks"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "MIDI Sync Issues Between DAW and Hardware",
    content: "Spent hours debugging MIDI sync drift between Ableton and my hardware sequencer. The solution was using a dedicated MIDI clock interface. No more timing issues!",
    tags: "troubleshooting,midi,sync"
  },

  // Multiple #memes posts
  {
    userId: "user_75bd6d54328509f8",
    title: "When Your Track Finally Drops After Months",
    content: "That moment when you've been teasing a track for months and it finally releases... but Spotify pays you 0.003 cents per stream. The underground struggle is real! 😅",
    tags: "memes,producer,streaming"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Producer Problems: Never Finished Syndrome",
    content: "Me: This track is finished! Also me: *adds 47 more layers and changes the entire arrangement* Why can't we just call it done? 🎹",
    tags: "memes,producer,studio"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "When Non-Producers Ask About Your Music",
    content: "Them: 'So you make beats?' Me: *proceeds to explain the difference between techno, house, and electronic music for 20 minutes* 🤦‍♂️",
    tags: "memes,explanation,genres"
  },

  // Multiple #techno posts
  {
    userId: "user_f744a20301a93c41",
    title: "Detroit Techno Influence on Modern Underground Production",
    content: "Studying classic Plastikman and Underground Resistance tracks. The minimalism and space in these productions is something modern techno desperately needs to remember. Less is more.",
    tags: "techno,detroit,minimalism"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Berlin Techno Scene Evolution and Impact",
    content: "Berlin's techno scene keeps evolving from hard industrial sounds to more experimental territories. The underground venues there are pushing boundaries constantly. Respect to the scene!",
    tags: "techno,berlin,underground"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Industrial Techno Production Techniques",
    content: "Working on some proper industrial techno. Heavy use of distortion, metallic percussion samples, and that warehouse reverb. The key is controlled chaos in the arrangement.",
    tags: "techno,industrial,production"
  },

  // Multiple #house posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Classic Chicago House Chord Progressions Deep Dive",
    content: "Breaking down those iconic Chicago house progressions from the 80s. The way they used 7th and 9th chords to create that soulful feeling is pure magic. This is the foundation of house music.",
    tags: "house,chicago,chords"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "UK Garage Influence on Modern Deep House",
    content: "Experimenting with UK garage rhythms in deep house contexts. The syncopated patterns add incredible groove to traditional 4/4 house structures. The fusion works perfectly.",
    tags: "house,ukgarage,deephouse"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Vocal House Production: Finding the Perfect Balance",
    content: "Working with vocalists on house tracks. The challenge is balancing the vocal with the instrumental without losing the groove. Side-chain compression is your friend here.",
    tags: "house,vocals,production"
  },

  // Multiple #ableton posts
  {
    userId: "user_f744a20301a93c41",
    title: "Ableton Live 12 New Features Review",
    content: "The new MIDI tools in Live 12 are game-changing. The chord generator and scale awareness features are speeding up my workflow significantly. Worth the upgrade!",
    tags: "ableton,live12,workflow"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Essential Max4Live Devices for Techno",
    content: "My go-to Max4Live devices: LFO Tool, Envelope Follower, and CV Instrument. These three devices alone open up endless modulation possibilities for underground techno production.",
    tags: "ableton,max4live,modulation"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Ableton Push 3 Live Performance Setup",
    content: "Using Push 3 for live techno performances. The standalone mode is perfect for underground venues where laptop setups are risky. The workflow is incredibly intuitive.",
    tags: "ableton,push,liveperformance"
  },

  // Multiple #flstudio posts
  {
    userId: "user_75bd6d54328509f8",
    title: "FL Studio vs Ableton: Workflow Comparison",
    content: "Switched from FL to Ableton for live performance but still love FL's piano roll for composition. The pattern-based workflow in FL is unmatched for certain types of house production.",
    tags: "flstudio,workflow,comparison"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "FL Studio Lifetime Updates: Still Worth It",
    content: "FL Studio's lifetime free updates policy is incredible. Been using it for 8 years and still getting major feature updates. The value proposition is unmatched in the industry.",
    tags: "flstudio,updates,value"
  },

  // Multiple #daw posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Multi-DAW Production Approach Strategy",
    content: "Using different DAWs for different stages: Logic for recording, Ableton for arrangement, Pro Tools for mixing. Each DAW has its strengths when used properly.",
    tags: "daw,workflow,mixing"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "DAW Choice Doesn't Matter (Mostly)",
    content: "Spent years switching between DAWs. Truth is, once you know your tools well, the DAW becomes transparent. Focus on the music, not the software.",
    tags: "daw,philosophy,focus"
  },

  // Additional hashtag categories
  {
    userId: "user_75bd6d54328509f8",
    title: "Essential Studio Monitor Setup Guide",
    content: "Upgraded to Focal Alpha 80s and the difference is night and day. But proper monitor positioning and acoustic treatment made an even bigger difference than the monitors themselves.",
    tags: "electronicequipments,monitors,acoustics"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Pioneer CDJ-3000 Performance Features Deep Dive",
    content: "The new Pioneer CDJ-3000s are incredible for live techno sets. The beat jump and loop features let you create live remixes on the fly. The touch screen is responsive even in dark clubs.",
    tags: "pioneer,cdj,performance"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Native Instruments Kontrol S88 Review",
    content: "The NI Kontrol S88 integration with Ableton is seamless. The weighted keys make playing bass lines and leads feel like a real instrument. Perfect for studio and live use.",
    tags: "ni,kontrol,keyboard"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Elektron Digitakt in Live Performance",
    content: "Using the Digitakt as the brain of my live setup. The sampling capabilities and sequencer make it perfect for creating evolving techno arrangements on the fly.",
    tags: "digitak,elektron,liveperformance"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "MIDI Controller Setup for Production",
    content: "My production setup: Push 2 for Ableton, Keystep Pro for hardware sequencing, and a custom MIDI fighter for effects control. Hardware workflow is essential.",
    tags: "controller,midi,hardware"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Eurorack Modular in Electronic Music",
    content: "Added a small Eurorack system to my setup. The unpredictability and happy accidents from modular synthesis bring life to digital productions.",
    tags: "modular,eurorack,synthesis"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Analog Synth vs Software Comparison",
    content: "A/B tested my Moog Sub 37 against Serum. While software is incredibly flexible, there's something about analog saturation and filter behavior that's irreplaceable.",
    tags: "synth,analog,software"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Roland TR-8S Drum Machine Review",
    content: "The TR-8S brings classic Roland drum sounds into modern production. The individual outputs and effects make it perfect for live techno performances.",
    tags: "drummachine,roland,tr8s"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Hardware Sequencer Workflow Benefits",
    content: "Using hardware sequencers changed my creative process. The limitations force you to be more intentional with your musical choices.",
    tags: "sequencer,hardware,workflow"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "TB-303 Acid Bassline Techniques",
    content: "The secret to great 303 lines: start simple, use slides sparingly, and let the filter do the talking. Less is more with the acid sound.",
    tags: "303,acid,bassline"
  },
  {
    userId: "user_75bd6d54328509f8",
    title: "Sub Bass Production Techniques",
    content: "For powerful sub bass: high-pass everything else, use parallel compression, and always check mono compatibility. The low end is where tracks live or die.",
    tags: "bassline,subbass,mixing"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Essential Production Tips for Beginners",
    content: "Top tips for new producers: 1) Learn your DAW inside out, 2) Reference tracks constantly, 3) Mix at low volumes, 4) Don't over-process, 5) Finish tracks even if they're not perfect.",
    tags: "tip,beginners,production"
  }
];

async function createPosts() {
  console.log('Creating comprehensive hashtag posts...');
  
  const sessionCookie = 'connect.sid=s%3AcOZgcqIcbFKaWN3K9DXr7vVJdNBGWEJx.Y2%2BFsjN6QWCwfrQnM5cEYgPHGJrjMVnqHc9jqsHgLHQ'; // Admin session
  
  for (let i = 0; i < comprehensiveHashtagPosts.length; i++) {
    const post = comprehensiveHashtagPosts[i];
    
    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify(post)
      });
      
      if (response.ok) {
        console.log(`✓ Created post ${i + 1}/${comprehensiveHashtagPosts.length}: "${post.title}"`);
      } else {
        console.log(`✗ Failed to create post: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`✗ Error creating post: ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Comprehensive hashtag posts creation complete!');
}

// Run the creation
createPosts().catch(console.error);