export interface DummyUser {
  id: number;
  name: string;
  avatar?: string;
}

export interface DummyComment {
  id: number;
  content: string;
  user: DummyUser;
  created_at: string;
}

export interface DummyPost {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  images?: string[];
  created_at: string;
  user: DummyUser;
  comments: DummyComment[];
  likes: number;
  institution: string;
  category: 'physical' | 'verbal' | 'psychological' | 'other';
}

// Dummy images for posts from unsplash
const dummyImageSets = {
  firstDay: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
  ],
  verbalAbuse: [
    'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
  ],
  hostel: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  ],
  classroom: [
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?w=800',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
  ],
  orientation: [
    'https://images.unsplash.com/photo-1610483778814-70468201824c?w=800',
  ],
  dressCode: [
    'https://images.unsplash.com/photo-1604342427523-21eafb29675c?w=800',
    'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?w=800',
    'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800',
  ],
};

export const dummyUsers: DummyUser[] = [
  {
    id: 1,
    name: 'Amal Perera',
    avatar: 'https://via.placeholder.com/200?text=AP'
  },
  {
    id: 2,
    name: 'Kamala Silva',
    avatar: 'https://via.placeholder.com/200?text=KS'
  },
  {
    id: 3,
    name: 'Nimal Fernando',
    avatar: 'https://via.placeholder.com/200?text=NF'
  },
  {
    id: 4,
    name: 'Sanjana Rathnayake',
    avatar: 'https://via.placeholder.com/200?text=SR'
  },
  {
    id: 5,
    name: 'Dinesh Rajapaksa',
    avatar: 'https://via.placeholder.com/200?text=DR'
  }
];

export const dummyPosts: DummyPost[] = [
  {
    id: 1,
    title: 'My First Day Experience at University',
    content: 'On my first day, senior students surrounded us and forced us to sing and dance in front of everyone. It was humiliating and made me feel anxious about coming to campus again. What should have been an exciting start to my university life turned into a nightmare. We need to put an end to these practices that harm students\' mental wellbeing.',
    images: dummyImageSets.firstDay,
    created_at: '2023-12-10T10:30:00',
    user: dummyUsers[0],
    comments: [
      {
        id: 1,
        content: 'I had a similar experience. Stay strong and report this to the administration.',
        user: dummyUsers[1],
        created_at: '2023-12-10T14:20:00'
      },
      {
        id: 2,
        content: 'This is unacceptable behavior. Have you reported this to the student counselor?',
        user: dummyUsers[2],
        created_at: '2023-12-11T09:15:00'
      }
    ],
    likes: 24,
    institution: 'University of Colombo',
    category: 'psychological'
  },
  {
    id: 2,
    title: 'Verbal Abuse in Engineering Faculty',
    content: 'Senior students constantly use derogatory language and offensive nicknames. They belittle freshers for their clothing, accents, and backgrounds. This toxic environment is affecting our studies and mental health. Many students are skipping classes to avoid confrontation. University should be a place for learning, not fear.',
    images: dummyImageSets.verbalAbuse,
    created_at: '2023-11-25T16:45:00',
    user: dummyUsers[3],
    comments: [
      {
        id: 3,
        content: 'The faculty needs to take this more seriously. Have you tried speaking with your department head?',
        user: dummyUsers[4],
        created_at: '2023-11-26T08:30:00'
      }
    ],
    likes: 42,
    institution: 'University of Moratuwa',
    category: 'verbal'
  },
  {
    id: 3,
    title: 'Forced to Stay Late at Hostel',
    content: 'Senior students come to our hostel rooms after midnight and force us to participate in "traditions" that involve memorizing nonsensical rules and reciting them perfectly. If we make mistakes, we face punishments like standing in uncomfortable positions for hours. Sleep deprivation is affecting our academic performance significantly.',
    images: dummyImageSets.hostel,
    created_at: '2023-10-15T20:10:00',
    user: dummyUsers[2],
    comments: [
      {
        id: 4,
        content: 'This is a common practice in many hostels and needs to stop. Document everything.',
        user: dummyUsers[0],
        created_at: '2023-10-16T10:25:00'
      },
      {
        id: 5,
        content: 'Have you tried contacting the warden? This is clearly against university regulations.',
        user: dummyUsers[1],
        created_at: '2023-10-16T13:40:00'
      },
      {
        id: 6,
        content: 'I experienced the same last year. The administration knows but doesn\'t take action.',
        user: dummyUsers[4],
        created_at: '2023-10-17T09:05:00'
      }
    ],
    likes: 67,
    institution: 'University of Peradeniya',
    category: 'physical'
  },
  {
    id: 4,
    title: 'Boycotting Classes Due to Ragging',
    content: 'It\'s been two weeks since I attended a lecture because senior students wait outside classrooms to target first-year students. They force us to perform embarrassing acts in front of our peers and professors. I\'m falling behind in my studies but feel helpless to change the situation. Several other students are in the same position.',
    images: dummyImageSets.classroom,
    created_at: '2023-09-28T11:20:00',
    user: dummyUsers[1],
    comments: [
      {
        id: 7,
        content: 'This is happening in our faculty too. We need to unite and stand against this.',
        user: dummyUsers[3],
        created_at: '2023-09-29T14:15:00'
      }
    ],
    likes: 38,
    institution: 'University of Kelaniya',
    category: 'psychological'
  },
  {
    id: 5,
    title: 'Physical Harassment During Orientation Week',
    content: 'What should have been an introduction to university life turned into a nightmare. Senior students made us do physical exercises until exhaustion, slapped those who couldn\'t keep up, and denied water breaks. One student fainted and had to be taken to the hospital. Despite this incident, the "orientation" continued the next day.',
    images: dummyImageSets.orientation,
    created_at: '2023-09-05T09:30:00',
    user: dummyUsers[4],
    comments: [
      {
        id: 8,
        content: 'This is assault and should be reported to the police, not just university authorities.',
        user: dummyUsers[2],
        created_at: '2023-09-05T12:45:00'
      },
      {
        id: 9,
        content: 'I hope the student who fainted is okay now. Was there any faculty supervision during orientation?',
        user: dummyUsers[0],
        created_at: '2023-09-06T08:20:00'
      }
    ],
    likes: 89,
    institution: 'University of Sri Jayewardenepura',
    category: 'physical'
  },
  {
    id: 6,
    title: 'Forced to Follow Dress Code by Seniors',
    content: 'Senior students have enforced an unofficial "dress code" on first-years. We\'re not allowed to wear anything colorful, no t-shirts with logos, and girls can\'t wear makeup or accessories. Those who don\'t comply are publicly humiliated. This infringes on our personal freedom and self-expression.',
    images: dummyImageSets.dressCode,
    created_at: '2023-08-20T15:50:00',
    user: dummyUsers[3],
    comments: [
      {
        id: 10,
        content: 'This happened to my batch too. It\'s a power play that needs to be addressed by the administration.',
        user: dummyUsers[1],
        created_at: '2023-08-21T10:10:00'
      }
    ],
    likes: 56,
    institution: 'Eastern University',
    category: 'psychological'
  }
];

export const getRecentPosts = (count: number = 3): DummyPost[] => {
  return [...dummyPosts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count);
};

export const getMostLikedPosts = (count: number = 3): DummyPost[] => {
  return [...dummyPosts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, count);
}; 