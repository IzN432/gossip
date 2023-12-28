export const SampleTags = [
	{ id: 1, description: "fire" },
	{ id: 2, description: "water" },
	{ id: 3, description: "earth" },
	{ id: 4, description: "air" },
	{ id: 5, description: "nature" },
	{ id: 6, description: "energy" },
	{ id: 7, description: "light" },
	{ id: 8, description: "darkness" },
	{ id: 9, description: "ice" },
	{ id: 10, description: "thunder" },
];

export const SampleUsers = [
	{ id: 1, username: "wowzees", role: "superuser" },
	{ id: 1, username: "xerio", role: "admin" },
	{ id: 1, username: "naaaan", role: "user" },
];

export const SamplePosts = [
	{
		id: 1,
		title: "How to train a phoenix",
		content:
			"Training a phoenix is no easy feat. The key is to establish a deep connection with the mythical creature. Begin by understanding its fiery nature and responding with patience and care. Building a bond with a phoenix involves spending countless hours in meditation, absorbing its essence, and learning to communicate through the subtle language of flames. As you embark on this extraordinary journey, keep in mind that the phoenix is a symbol of rebirth and transformation. Embrace the challenge, and you may unlock the secrets of this majestic creature that transcends the ordinary boundaries of the magical realm.",
		tags: [
			SampleTags[0],
			SampleTags[1],
			SampleTags[2],
			SampleTags[6],
			SampleTags[9],
		],
		owner: SampleUsers[0],
		replies: [],
	},
	{
		id: 2,
		title: "Navigating the seas of Neptune",
		content:
			"Sailing through the seas of Neptune requires advanced celestial navigation skills. Learn to read the stars, harness the power of water, and beware of the mysterious creatures lurking in the depths. The journey through Neptune's realm is not merely a physical one; it's a spiritual odyssey that demands a profound connection with the cosmic forces at play. As you navigate the celestial waters, consider the ancient myths and legends that surround Neptune, the god of the sea. These tales may offer insights into the challenges and rewards that await those brave enough to embark on this mystical voyage.",
		tags: [SampleTags[1], SampleTags[3]],
		owner: SampleUsers[1],
		replies: [],
	},
	{
		id: 3,
		title: "Exploring the enchanted forests",
		content:
			"Delve into the heart of enchanted forests where ancient trees whisper secrets. Harness the magic within and befriend mystical creatures to unveil the hidden wonders of nature. The enchanted forests are not just a realm of fantasy; they hold the key to unlocking the latent magic within yourself. As you wander through the luminescent foliage and converse with sentient beings, you'll discover that every step is a dance with the mystical energies that permeate the air. Open your senses to the symphony of the forest, and you may find yourself on a transformative journey of self-discovery and enlightenment.",
		tags: [SampleTags[2], SampleTags[4]],
		owner: SampleUsers[0],
		replies: [],
	},

	{
		id: 4,
		title: "Unleashing the power of the winds",
		content:
			"Master the art of wind manipulation to soar through the skies like a true airbender. Embrace the freedom of flight and harness the gentle zephyrs to your advantage.",
		tags: [SampleTags[3], SampleTags[4]],
		owner: SampleUsers[1],
		replies: [],
	},
	{
		id: 5,
		title: "Summoning the earth's guardians",
		content:
			"Unlock the ancient art of summoning and connect with the mighty guardians of the earth. Gain their wisdom and protection by understanding the harmonious balance of nature.",
		tags: [SampleTags[2]],
		owner: SampleUsers[1],
		replies: [],
	},
	{
		id: 6,
		title: "Dancing under the moonlight",
		content:
			"Experience the magic of moonlit nights by learning the ancient dance rituals. Join the mystical celebration and connect with lunar energies for a night filled with enchantment.",
		tags: [SampleTags[4]],
		owner: SampleUsers[0],
		replies: [],
	},
	{
		id: 7,
		title: "Harnessing the power of the elements",
		content:
			"Embark on a journey to harness the raw power of the elements—earth, fire, water, air, and beyond. Master the ancient arts and become a true elemental adept.",
		tags: [SampleTags[0], SampleTags[1], SampleTags[3]],
		owner: SampleUsers[1],
		replies: [],
	},
	{
		id: 8,
		title: "Inventing spells of illusion",
		content:
			"Delve into the world of illusion magic and craft spells that bend reality. Create mesmerizing illusions and discover the secrets behind the art of magical deception.",
		tags: [SampleTags[3], SampleTags[4]],
		owner: SampleUsers[0],
		replies: [],
	},
	{
		id: 9,
		title: "Conquering the fiery mountains",
		content:
			"Embark on a daring quest to conquer the treacherous fiery mountains. Face mythical creatures, overcome challenges, and emerge victorious as the true master of flames.",
		tags: [SampleTags[0], SampleTags[2]],
		owner: SampleUsers[1],
		replies: [],
	},
	{
		id: 10,
		title: "Navigating the cosmic sea",
		content:
			"Sail through the cosmic sea and explore the celestial wonders that lie beyond. Chart your course among the stars and unravel the mysteries of the vast universe.",
		tags: [SampleTags[1], SampleTags[3]],
		owner: SampleUsers[0],
		replies: [],
	},
];

export const SampleReplies = [
	{
		id: 1,
		content: "This is kinda epic ngl",
		post: SamplePosts[0],
		owner: SampleUsers[0],
	},
	{
		id: 2,
		content:
			"Have you considered that maybe perhaps this is not the way that this should be done?",
		post: SamplePosts[0],
		owner: SampleUsers[1],
	},
	{
		id: 3,
		content:
			"I appreciate the effort, but have you thought about potential drawbacks and how we can address them?",
		post: SamplePosts[0],
		owner: SampleUsers[2],
	},
	{
		id: 4,
		content:
			"Considering different perspectives is crucial. Let's delve deeper into the implications of this approach.",
		post: SamplePosts[0],
		owner: SampleUsers[0],
	},
	{
		id: 5,
		content:
			"Interesting proposition! However, we should be cautious about unintended consequences. What are your thoughts?",
		post: SamplePosts[0],
		owner: SampleUsers[1],
	},
	{
		id: 6,
		content:
			"I'm intrigued by the unconventional approach. What potential challenges do you foresee, and how might we overcome them?",
		post: SamplePosts[0],
		owner: SampleUsers[0],
	},
	{
		id: 7,
		content:
			"Your point raises valid concerns. Let's discuss practical solutions to mitigate any potential issues.",
		post: SamplePosts[0],
		owner: SampleUsers[1],
	},
	{
		id: 8,
		content:
			"Interesting perspective! How about we explore a hybrid approach that combines the best of both worlds?",
		post: SamplePosts[0],
		owner: SampleUsers[2],
	},
	{
		id: 9,
		content:
			"I appreciate the critical thinking involved. Let's delve deeper into the nuances for a more comprehensive understanding.",
		post: SamplePosts[0],
		owner: SampleUsers[0],
	},
];
