const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

async function createGitHubInstance() {
    const { GitHub } = await import('arctic'); // ✅ dynamic import

    return new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI);
}

module.exports = { createGitHubInstance };
