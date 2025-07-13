// src/data/mockContests.js

// Mock Contest Data
export const allContests = [
    // Live Contest Example
    {
        id: 'live-sprint-5',
        title: 'CodeCrack Sprint #5',
        slug: 'live-sprint-5',
        description: 'A fast-paced challenge with 4 problems to test your speed and accuracy. The problems range from easy to medium difficulty.',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // Started 1 hour ago
        duration: '2 hours',
        type: 'Rated',
        participants: 850,
        problems: [
            { id: 'p1', title: 'Array Rotation', difficulty: 'easy', points: 100 },
            { id: 'p2', title: 'Find the Duplicate Number', difficulty: 'medium', points: 250 },
            { id: 'p3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', points: 300 },
            { id: 'p4', title: 'Binary Tree Maximum Path Sum', difficulty: 'hard', points: 500 },
        ]
    },
    // Upcoming Contests
    {
        id: 'weekly-301',
        title: 'Weekly Contest 301',
        slug: 'weekly-301',
        description: 'The classic weekly contest. Four problems in 90 minutes. Sharpen your skills and climb the weekly leaderboard!',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Starts in 2 days
        duration: '1.5 hours',
        type: 'Rated',
        participants: 0,
    },
    // Past Contests
    {
        id: 'weekly-300',
        title: 'Weekly Contest 300',
        slug: 'weekly-300',
        description: 'A look back at our 300th weekly contest. See the problems and the final standings.',
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        duration: '1.5 hours',
        type: 'Rated',
        participants: 2345,
        problems: [
            { id: 'p1a', title: 'Decode the Message', difficulty: 'easy', points: 100 },
            { id: 'p2a', title: 'Number of People Aware of a Secret', difficulty: 'medium', points: 250 },
            { id: 'p3a', title: 'Spiral Matrix IV', difficulty: 'medium', points: 300 },
            { id: 'p4a', title: 'Count Number of Good Paths', difficulty: 'hard', points: 500 },
        ],
        rankings: [
            { rank: 1, user: 'alpha_coder', score: 1150, time: '0:58:12' },
            { rank: 2, user: 'jane_dev', score: 1150, time: '1:05:34' },
            { rank: 3, user: 'bit_master', score: 950, time: '1:10:02' },
            { rank: 4, user: 'py_wizard', score: 650, time: '1:15:22' },
            { rank: 5, user: 'user123', score: 650, time: '1:20:45' },
        ]
    },
];

// Helper function to determine contest status
export const getContestStatusInfo = (startTime, durationString) => {
    const now = new Date();
    const start = new Date(startTime);

    let durationMillis = 0;
    if (durationString) {
        const parts = durationString.split(' ');
        const value = parseFloat(parts[0]);
        if (parts[1].startsWith('hour')) {
            durationMillis = value * 60 * 60 * 1000;
        } else if (parts[1].startsWith('minute')) {
            durationMillis = value * 60 * 1000;
        }
    }
    const end = new Date(start.getTime() + durationMillis);

    if (now < start) return { status: 'Upcoming', timeReference: start, endReference: end };
    if (now >= start && now <= end) return { status: 'Live', timeReference: end, endReference: start };
    return { status: 'Ended', timeReference: end, endReference: start };
};