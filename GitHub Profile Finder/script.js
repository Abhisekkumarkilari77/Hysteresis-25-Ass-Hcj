// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const profileSection = document.getElementById('profileSection');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// Profile elements
const avatar = document.getElementById('avatar');
const name = document.getElementById('name');
const username = document.getElementById('username');
const bio = document.getElementById('bio');
const location = document.getElementById('location');
const company = document.getElementById('company');
const blog = document.getElementById('blog');
const joinDate = document.getElementById('joinDate');

// Stats elements
const repoCount = document.getElementById('repoCount');
const followerCount = document.getElementById('followerCount');
const followingCount = document.getElementById('followingCount');
const gistCount = document.getElementById('gistCount');
const profileLink = document.getElementById('profileLink');

// Repos elements
const repoContainer = document.getElementById('repoContainer');
const noRepos = document.getElementById('noRepos');

// Recent searches elements
const recentSearchesContainer = document.getElementById('recentSearchesContainer');
const recentSearchesList = document.getElementById('recentSearchesList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// API Base URL
const API_URL = 'https://api.github.com/users/';

// LocalStorage keys
const STORAGE_KEY = 'github_profiles';
const RECENT_SEARCHES_KEY = 'github_recent_searches';

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadRecentSearches();
});

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all search history?')) {
        clearAllProfiles();
        recentSearchesContainer.style.display = 'none';
        recentSearchesList.innerHTML = '';
    }
});

/**
 * Handle search button click and enter key
 */
async function handleSearch() {
    const userInput = searchInput.value.trim().toLowerCase();

    // Validation
    if (!userInput) {
        showError('Please enter a GitHub username');
        return;
    }

    // Reset states
    clearError();
    hideProfile();

    // Check localStorage first
    const cachedProfile = getProfileFromStorage(userInput);
    if (cachedProfile) {
        // Display from cache
        displayProfile(cachedProfile.user);
        displayRepositories(cachedProfile.repos);
        showProfile();
        searchInput.value = '';
        addToRecentSearches(userInput);
        loadRecentSearches();
        return;
    }

    // Show loading
    showLoading();

    try {
        // Fetch user data
        const userData = await fetchUser(userInput);

        // Fetch repos
        const reposData = await fetchRepos(userInput);

        // Save to localStorage
        saveProfileToStorage(userInput, userData, reposData);

        // Add to recent searches
        addToRecentSearches(userInput);

        // Render profile and repos
        displayProfile(userData);
        displayRepositories(reposData);

        // Hide loading
        hideLoading();

        // Show profile section
        showProfile();

        // Clear input
        searchInput.value = '';

        // Refresh recent searches UI
        loadRecentSearches();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

/**
 * Save profile to localStorage
 * @param {string} username - GitHub username
 * @param {Object} userData - User profile data
 * @param {Array} reposData - User repositories data
 */
function saveProfileToStorage(username, userData, reposData) {
    try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        profiles[username] = {
            user: userData,
            repos: reposData,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
        console.warn('Error saving to localStorage:', error);
    }
}

/**
 * Get profile from localStorage
 * @param {string} username - GitHub username
 * @returns {Object|null} Cached profile or null if not found
 */
function getProfileFromStorage(username) {
    try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        return profiles[username] || null;
    } catch (error) {
        console.warn('Error reading from localStorage:', error);
        return null;
    }
}

/**
 * Add username to recent searches
 * @param {string} username - GitHub username
 */
function addToRecentSearches(username) {
    try {
        let recent = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
        // Remove if already exists and add to top
        recent = recent.filter((u) => u !== username);
        recent.unshift(username);
        // Keep only last 10 searches
        recent = recent.slice(0, 10);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (error) {
        console.warn('Error updating recent searches:', error);
    }
}

/**
 * Load and display recent searches
 */
function loadRecentSearches() {
    try {
        const recent = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
        
        if (recent.length > 0) {
            recentSearchesList.innerHTML = '';
            recent.forEach((username) => {
                const btn = document.createElement('button');
                btn.className = 'recent-search-btn';
                btn.textContent = `@${username}`;
                btn.addEventListener('click', () => {
                    searchInput.value = username;
                    handleSearch();
                });
                recentSearchesList.appendChild(btn);
            });
            recentSearchesContainer.style.display = 'block';
        } else {
            recentSearchesContainer.style.display = 'none';
        }
    } catch (error) {
        console.warn('Error loading recent searches:', error);
    }
}

/**
 * Get all saved profiles
 * @returns {Array} Array of usernames with saved profiles
 */
function getSavedProfiles() {
    try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        return Object.keys(profiles);
    } catch (error) {
        console.warn('Error getting saved profiles:', error);
        return [];
    }
}

/**
 * Clear all saved profiles from localStorage
 */
function clearAllProfiles() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        loadRecentSearches();
        console.log('✅ All saved profiles cleared');
    } catch (error) {
        console.warn('Error clearing localStorage:', error);
    }
}

/**
 * Delete a specific profile from storage
 * @param {string} username - GitHub username
 */
function deleteProfile(username) {
    try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        delete profiles[username];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        console.log(`✅ Profile '${username}' deleted`);
    } catch (error) {
        console.warn('Error deleting profile:', error);
    }
}

/**
 * Fetch user data from GitHub API
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User data
 */
async function fetchUser(username) {
    try {
        const response = await fetch(API_URL + username);

        if (response.status === 404) {
            throw new Error('❌ GitHub user not found. Check the username and try again.');
        }

        if (response.status === 403) {
            throw new Error('⚠️ API rate limit exceeded. Please try again later.');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        return await response.json();
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('🌐 Network error. Please check your internet connection.');
        }
        throw error;
    }
}

/**
 * Fetch user repositories from GitHub API
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Array of repositories
 */
async function fetchRepos(username) {
    try {
        const response = await fetch(
            `${API_URL}${username}/repos?sort=updated&per_page=6&type=public`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        return await response.json();
    } catch (error) {
        console.warn('Error fetching repos:', error);
        return []; // Return empty array if repos fail
    }
}

/**
 * Display user profile information
 * @param {Object} userData - User data from API
 */
function displayProfile(userData) {
    // Avatar
    avatar.src = userData.avatar_url;
    avatar.alt = userData.login;

    // Name and username
    name.textContent = userData.name || 'No name provided';
    username.textContent = '@' + userData.login;

    // Bio
    bio.textContent = userData.bio || 'No bio available';

    // Location
    if (userData.location) {
        location.textContent = `📍 ${userData.location}`;
        location.style.display = '';
    } else {
        location.style.display = 'none';
    }

    // Company
    if (userData.company) {
        company.textContent = `🏢 ${userData.company}`;
        company.style.display = '';
    } else {
        company.style.display = 'none';
    }

    // Blog
    if (userData.blog) {
        // Extract domain from URL for display
        const url = new URL(
            userData.blog.startsWith('http') ? userData.blog : 'https://' + userData.blog
        );
        blog.innerHTML = `🔗 <a href="${userData.blog}" target="_blank" style="color: var(--accent); text-decoration: none;">${url.hostname}</a>`;
        blog.style.display = '';
    } else {
        blog.style.display = 'none';
    }

    // Join date
    const joinedDate = new Date(userData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    joinDate.textContent = `📅 Joined ${joinedDate}`;

    // Stats
    repoCount.textContent = userData.public_repos;
    followerCount.textContent = userData.followers;
    followingCount.textContent = userData.following;
    gistCount.textContent = userData.public_gists;

    // Profile link
    profileLink.href = userData.html_url;
}

/**
 * Display repositories
 * @param {Array} repos - Array of repository objects
 */
function displayRepositories(repos) {
    repoContainer.innerHTML = ''; // Clear previous repos

    if (repos.length === 0) {
        noRepos.style.display = 'block';
        return;
    }

    noRepos.style.display = 'none';

    repos.forEach((repo) => {
        const repoCard = createRepoCard(repo);
        repoContainer.appendChild(repoCard);
    });
}

/**
 * Create a repository card element
 * @param {Object} repo - Repository object
 * @returns {HTMLElement} Repository card element
 */
function createRepoCard(repo) {
    const card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.className = 'repo-card';

    // Format last updated date
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Build card HTML
    card.innerHTML = `
        <div class="repo-name">${repo.name}</div>
        ${repo.description ? `<div class="repo-description">${repo.description}</div>` : '<div class="repo-description">No description provided</div>'}
        ${repo.language ? `<div class="repo-language">${repo.language}</div>` : ''}
        <div class="repo-stats">
            <div class="repo-stat">
                <span>⭐</span>
                <span>${repo.stargazers_count}</span>
            </div>
            <div class="repo-stat">
                <span>🍴</span>
                <span>${repo.forks_count}</span>
            </div>
        </div>
        <div class="repo-footer">Last updated: ${updatedDate}</div>
    `;

    return card;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

/**
 * Clear error message
 */
function clearError() {
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

/**
 * Show loading state
 */
function showLoading() {
    loadingDiv.style.display = 'flex';
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingDiv.style.display = 'none';
}

/**
 * Show profile section
 */
function showProfile() {
    profileSection.style.display = 'block';
    // Scroll to profile section
    profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hide profile section
 */
function hideProfile() {
    profileSection.style.display = 'none';
}
