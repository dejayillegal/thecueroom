/**
 * Populate comprehensive test data directly to database
 */

import { storage } from '../server/storage.js';

const comprehensiveTestPosts = [
  // #Techno Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Underground Techno Session at Warehouse",
    content: "Just finished an incredible 4-hour techno set at the underground warehouse. The energy was electric! Dark techno mixed with some acid elements. The crowd was absolutely mental. Can't wait to share the recordings soon.",
    tags: ["#Techno", "#Underground", "#Warehouse"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41", 
    title: "New Industrial Techno Track Preview",
    content: "Been working on this industrial techno banger for months. 130 BPM of pure underground madness. Drop coming next week on Beatport. What do you think of this snippet?",
    tags: ["#Techno", "#NewMusic", "#Industrial"],
    author: "ACID_REIGN"
  },

  // #House Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Deep House Vibes for Sunday Sessions",
    content: "Sunday sessions call for deep house therapy. Smooth basslines, jazz samples, and soulful vocals. Perfect for those lazy afternoon sets. Anyone else feeling these deep vibes today?",
    tags: ["#House", "#DeepHouse", "#SundayVibes"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Tech House Set from Last Night",
    content: "Last night's tech house set was fire! Groovy basslines, crisp percussion, and the dance floor was packed all night. Mixing some classic house with modern tech elements.",
    tags: ["#House", "#TechHouse", "#Groovy"],
    author: "ACID_REIGN"
  },

  // #Collaboration Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Looking for Vocalist Collaboration",
    content: "Working on a progressive house track and need a talented vocalist. The track has emotional breakdowns and uplifting drops. Looking for someone with experience in electronic music vocals.",
    tags: ["#Collaboration", "#House", "#Vocalist"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Studio Session Collaboration Available",
    content: "My studio is available for collaboration sessions. Professional setup with Ableton, analog synths, and quality monitors. Open to working with producers on techno and house projects.",
    tags: ["#Collaboration", "#Studio", "#Production"],
    author: "ACID_REIGN"
  },

  // #Gigs Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Upcoming Gig at Bangalore Underground Club",
    content: "Excited to announce my upcoming gig at Underground Club Bangalore this Saturday! Playing a 3-hour techno set starting at midnight. Expect dark, driving beats and some unreleased tracks.",
    tags: ["#Gigs", "#Bangalore", "#Techno"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Electronic Music Festival Lineup",
    content: "Thrilled to be part of the Electronic Music Festival lineup next month! Sharing the stage with some incredible artists. This will be a house music showcase to remember.",
    tags: ["#Gigs", "#Festival", "#House"],
    author: "ACID_REIGN"
  },

  // #Production Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Analog vs Digital Production Discussion",
    content: "Been experimenting with analog gear lately. There's something magical about the warmth of analog synths that digital can't replicate. But digital gives you unlimited possibilities. What's your preference?",
    tags: ["#Production", "#Analog", "#Digital"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Mixing Techniques for Techno Production",
    content: "Sharing some mixing tips for techno production: High-pass everything except kick and bass, use parallel compression on drums, and don't forget the importance of stereo imaging. What are your go-to techniques?",
    tags: ["#Production", "#Mixing", "#Techno"],
    author: "ACID_REIGN"
  },

  // #Events Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Secret Underground Event This Weekend",
    content: "Secret location event this weekend featuring the best underground techno artists in the city. Limited capacity, BYOB, and pure underground vibes. DM for location details.",
    tags: ["#Events", "#Underground", "#SecretLocation"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Warehouse Party Planning Marathon",
    content: "Planning a massive warehouse party for next month. Looking for artists who want to showcase their sound. 12-hour marathon with multiple rooms: techno, house, and experimental.",
    tags: ["#Events", "#Warehouse", "#Marathon"],
    author: "ACID_REIGN"
  },

  // #Gear Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Vintage Roland TB-303 Acquisition",
    content: "Just got my hands on a vintage Roland TB-303! The acid house sound is unmatched. Already working on some acid techno tracks. This little machine is pure magic for underground productions.",
    tags: ["#Gear", "#Roland", "#TB303"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Pioneer DJ Setup Upgrade Complete",
    content: "Upgraded my DJ setup with new Pioneer CDJs and a DJM mixer. The sound quality and features are incredible. Perfect for those long techno sets with seamless transitions.",
    tags: ["#Gear", "#Pioneer", "#DJSetup"],
    author: "ACID_REIGN"
  },

  // #NewMusic Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Underground Sessions EP Release",
    content: "Excited to announce my debut EP 'Underground Sessions' dropping next week! Four tracks of pure underground house music. Pre-order available on all platforms.",
    tags: ["#NewMusic", "#EP", "#Underground"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Classic House Remix Project Complete",
    content: "Just finished a remix of a classic house track. Gave it a modern techno twist while respecting the original's essence. Can't wait to test it on the dance floor!",
    tags: ["#NewMusic", "#Remix", "#Classic"],
    author: "ACID_REIGN"
  },

  // #Vinyl Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Rare Detroit Techno Vinyl Collection",
    content: "My vinyl collection keeps growing! Latest addition includes some rare Detroit techno pressings and classic house records. Nothing beats the warmth of vinyl in a live set.",
    tags: ["#Vinyl", "#Detroit", "#Collection"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Vinyl vs Digital DJing Debate",
    content: "There's an ongoing debate about vinyl vs digital. Both have their place, but vinyl forces you to be more creative with your track selection and mixing. What's your take on this?",
    tags: ["#Vinyl", "#Digital", "#DJing"],
    author: "ACID_REIGN"
  },

  // #Underground Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Keeping the Underground Scene Alive",
    content: "The underground scene is what keeps electronic music authentic. No commercial pressure, just pure artistic expression. Let's keep supporting underground artists and venues.",
    tags: ["#Underground", "#Authentic", "#Scene"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Underground Venue Spotlight Support",
    content: "Shoutout to all the underground venues keeping the scene alive! These spaces provide artists with the freedom to experiment and push boundaries. Support your local underground spots.",
    tags: ["#Underground", "#Venues", "#Support"],
    author: "ACID_REIGN"
  },

  // #Community Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Building Our TheCueRoom Community",
    content: "TheCueRoom has become such an incredible platform for connecting with fellow artists. The collaborations and friendships formed here are invaluable. Let's keep growing this community!",
    tags: ["#Community", "#TheCueRoom", "#Connection"],
    author: "BASS_OVERLORD"
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Welcome New Artists to TheCueRoom",
    content: "Welcome to all the new artists joining TheCueRoom! Don't hesitate to share your music, ask questions, and connect with others. This community is here to support each other.",
    tags: ["#Community", "#Welcome", "#Support"],
    author: "ACID_REIGN"
  }
];

async function populateTestData() {
  console.log("Populating comprehensive test data...");
  
  // Add test posts directly to storage
  for (let i = 0; i < comprehensiveTestPosts.length; i++) {
    try {
      const post = comprehensiveTestPosts[i];
      await storage.createPost({
        userId: post.userId,
        title: post.title,
        content: post.content,
        tags: post.tags,
        author: post.author,
        likesCount: Math.floor(Math.random() * 25) + 5, // Random likes 5-30
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
      });
      console.log(`✓ Created post: "${post.title}"`);
    } catch (error) {
      console.log(`✗ Failed to create post: ${error.message}`);
    }
  }
  
  console.log("Test data population complete!");
}

// Export for use
export { populateTestData, comprehensiveTestPosts };