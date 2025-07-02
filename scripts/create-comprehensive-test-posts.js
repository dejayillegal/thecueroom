/**
 * TheCueRoom - Comprehensive Test Posts Generator
 * Creates realistic test posts for all hashtag categories with verified users
 */

const testPosts = [
  // #Techno Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Underground Techno Session at Warehouse",
    content: "Just finished an incredible 4-hour techno set at the underground warehouse. The energy was electric! Dark techno mixed with some acid elements. The crowd was absolutely mental. Can't wait to share the recordings soon.",
    tags: ["#Techno", "#Underground", "#Warehouse"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "New Techno Track Preview",
    content: "Been working on this industrial techno banger for months. 130 BPM of pure underground madness. Drop coming next week on Beatport. What do you think of this snippet?",
    tags: ["#Techno", "#NewMusic", "#Industrial"]
  },

  // #House Posts
  {
    userId: "user_a1b2c3d4e5f6g7h8",
    title: "Deep House Vibes for Sunday",
    content: "Sunday sessions call for deep house therapy. Smooth basslines, jazz samples, and soulful vocals. Perfect for those lazy afternoon sets. Anyone else feeling these deep vibes today?",
    tags: ["#House", "#DeepHouse", "#SundayVibes"]
  },
  {
    userId: "user_x9y8z7w6v5u4t3s2",
    title: "Tech House Set from Last Night",
    content: "Last night's tech house set was fire! Groovy basslines, crisp percussion, and the dance floor was packed all night. Mixing some classic house with modern tech elements.",
    tags: ["#House", "#TechHouse", "#Groovy"]
  },

  // #Collaboration Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Looking for Vocalist Collaboration",
    content: "Working on a progressive house track and need a talented vocalist. The track has emotional breakdowns and uplifting drops. Looking for someone with experience in electronic music vocals.",
    tags: ["#Collaboration", "#House", "#Vocalist"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Studio Session Collaboration",
    content: "My studio is available for collaboration sessions. Professional setup with Ableton, analog synths, and quality monitors. Open to working with producers on techno and house projects.",
    tags: ["#Collaboration", "#Studio", "#Production"]
  },

  // #Gigs Posts
  {
    userId: "user_a1b2c3d4e5f6g7h8",
    title: "Upcoming Gig at Bangalore Club",
    content: "Excited to announce my upcoming gig at Underground Club Bangalore this Saturday! Playing a 3-hour techno set starting at midnight. Expect dark, driving beats and some unreleased tracks.",
    tags: ["#Gigs", "#Bangalore", "#Techno"]
  },
  {
    userId: "user_x9y8z7w6v5u4t3s2",
    title: "Festival Lineup Announcement",
    content: "Thrilled to be part of the Electronic Music Festival lineup next month! Sharing the stage with some incredible artists. This will be a house music showcase to remember.",
    tags: ["#Gigs", "#Festival", "#House"]
  },

  // #Production Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Analog vs Digital Production",
    content: "Been experimenting with analog gear lately. There's something magical about the warmth of analog synths that digital can't replicate. But digital gives you unlimited possibilities. What's your preference?",
    tags: ["#Production", "#Analog", "#Digital"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Mixing Techniques for Techno",
    content: "Sharing some mixing tips for techno production: High-pass everything except kick and bass, use parallel compression on drums, and don't forget the importance of stereo imaging. What are your go-to techniques?",
    tags: ["#Production", "#Mixing", "#Techno"]
  },

  // #Events Posts
  {
    userId: "user_a1b2c3d4e5f6g7h8",
    title: "Underground Event This Weekend",
    content: "Secret location event this weekend featuring the best underground techno artists in the city. Limited capacity, BYOB, and pure underground vibes. DM for location details.",
    tags: ["#Events", "#Underground", "#SecretLocation"]
  },
  {
    userId: "user_x9y8z7w6v5u4t3s2",
    title: "Warehouse Party Planning",
    content: "Planning a massive warehouse party for next month. Looking for artists who want to showcase their sound. 12-hour marathon with multiple rooms: techno, house, and experimental.",
    tags: ["#Events", "#Warehouse", "#Marathon"]
  },

  // #Gear Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "New Synthesizer Acquisition",
    content: "Just got my hands on a vintage Roland TB-303! The acid house sound is unmatched. Already working on some acid techno tracks. This little machine is pure magic.",
    tags: ["#Gear", "#Roland", "#TB303"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "DJ Setup Upgrade",
    content: "Upgraded my DJ setup with new Pioneer CDJs and a DJM mixer. The sound quality and features are incredible. Perfect for those long techno sets with seamless transitions.",
    tags: ["#Gear", "#Pioneer", "#DJSetup"]
  },

  // #NewMusic Posts
  {
    userId: "user_a1b2c3d4e5f6g7h8",
    title: "EP Release Announcement",
    content: "Excited to announce my debut EP 'Underground Sessions' dropping next week! Four tracks of pure underground house music. Pre-order available on all platforms.",
    tags: ["#NewMusic", "#EP", "#Underground"]
  },
  {
    userId: "user_x9y8z7w6v5u4t3s2",
    title: "Remix Project Complete",
    content: "Just finished a remix of a classic house track. Gave it a modern techno twist while respecting the original's essence. Can't wait to test it on the dance floor!",
    tags: ["#NewMusic", "#Remix", "#Classic"]
  },

  // #Vinyl Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Vinyl Collection Showcase",
    content: "My vinyl collection keeps growing! Latest addition includes some rare Detroit techno pressings and classic house records. Nothing beats the warmth of vinyl in a live set.",
    tags: ["#Vinyl", "#Detroit", "#Collection"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Vinyl vs Digital DJing",
    content: "There's an ongoing debate about vinyl vs digital. Both have their place, but vinyl forces you to be more creative with your track selection and mixing. What's your take?",
    tags: ["#Vinyl", "#Digital", "#DJing"]
  },

  // #Underground Posts
  {
    userId: "user_a1b2c3d4e5f6g7h8",
    title: "Keeping the Underground Alive",
    content: "The underground scene is what keeps electronic music authentic. No commercial pressure, just pure artistic expression. Let's keep supporting underground artists and venues.",
    tags: ["#Underground", "#Authentic", "#Scene"]
  },
  {
    userId: "user_x9y8z7w6v5u4t3s2",
    title: "Underground Venue Spotlight",
    content: "Shoutout to all the underground venues keeping the scene alive! These spaces provide artists with the freedom to experiment and push boundaries. Support your local underground spots.",
    tags: ["#Underground", "#Venues", "#Support"]
  },

  // #Community Posts
  {
    userId: "user_75bd6d54328509f8",
    title: "Building Our Music Community",
    content: "TheCueRoom has become such an incredible platform for connecting with fellow artists. The collaborations and friendships formed here are invaluable. Let's keep growing this community!",
    tags: ["#Community", "#TheCueRoom", "#Connection"]
  },
  {
    userId: "user_f744a20301a93c41",
    title: "Newcomer Welcome Thread",
    content: "Welcome to all the new artists joining TheCueRoom! Don't hesitate to share your music, ask questions, and connect with others. This community is here to support each other.",
    tags: ["#Community", "#Welcome", "#Support"]
  }
];

const users = [
  {
    id: "user_75bd6d54328509f8",
    stageName: "BASS_OVERLORD",
    username: "bass_overlord_mumbai",
    isVerified: true
  },
  {
    id: "user_f744a20301a93c41",
    stageName: "ACID_REIGN",
    username: "acid_reign_303",
    isVerified: true
  },
  {
    id: "user_a1b2c3d4e5f6g7h8",
    stageName: "DEEP_PULSE",
    username: "deep_pulse_bangalore",
    isVerified: true
  },
  {
    id: "user_x9y8z7w6v5u4t3s2",
    stageName: "TECH_PROPHET",
    username: "tech_prophet_delhi",
    isVerified: true
  }
];

console.log("Creating comprehensive test posts for all hashtag categories...");
console.log(`Total posts to create: ${testPosts.length}`);
console.log("Hashtags covered:", [...new Set(testPosts.flatMap(post => post.tags))]);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPosts, users };
}