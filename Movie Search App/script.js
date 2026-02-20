/**
 * CineSearch - Movie Search App
 * Powered by OMDb API
 */

// Configuration - REPLACE WITH YOUR OWN API KEY FROM http://www.omdbapi.com/
// Try a few fallback keys or use the one from localStorage if user sets it
const DEFAULT_API_KEY = '44a714ef';
let API_KEY = localStorage.getItem('cine_api_key') || DEFAULT_API_KEY;
let BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

// Update Base URL whenever API key changes
function updateApiKey(newKey) {
    API_KEY = newKey;
    BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
    localStorage.setItem('cine_api_key', API_KEY);
}

// State Management
let state = {
    allMovies: [],
    favorites: JSON.parse(localStorage.getItem('cine_favorites') || '[]'),
    history: JSON.parse(localStorage.getItem('cine_history') || '[]'),
    currentTab: 'all',
    searchQuery: 'Avengers',
    currentPage: 1,
    isLoading: false,
    viewMode: 'grid',
    theme: 'dark'
};

// Selectors
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const themeToggle = document.getElementById('themeToggle');
const tabs = document.querySelectorAll('.tab');

// Initialize
async function init() {
    loadPreferences();
    attachEventListeners();
    await fetchMovies(); // Initial load
}

// Data Fetching
async function fetchMovies(append = false) {
    if (state.isLoading) return;

    state.isLoading = true;
    if (!append) movieGrid.innerHTML = '';

    showSkeletons(append);

    try {
        const response = await fetch(`${BASE_URL}&s=${encodeURIComponent(state.searchQuery)}&page=${state.currentPage}`);
        const data = await response.json();

        if (data.Response === "True") {
            const movies = data.Search;
            if (append) {
                state.allMovies = [...state.allMovies, ...movies];
            } else {
                state.allMovies = movies;
            }
            renderMovies();
        } else {
            let errorMsg = data.Error;
            if (errorMsg === "Invalid API key!") {
                errorMsg = 'The API key is invalid or has expired. Please click the 🔑 icon above to set a working OMDb API key.';
            }
            if (!append) movieGrid.innerHTML = `<div class="empty-state"><h2>Notice</h2><p>${errorMsg}</p></div>`;
            document.getElementById('loadMore').style.display = 'none';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        movieGrid.innerHTML = `<div class="empty-state"><h2>Oops!</h2><p>Something went wrong. Please check your connection or API key.</p></div>`;
    } finally {
        state.isLoading = false;
        hideSkeletons();
    }
}

async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${BASE_URL}&i=${imdbID}&plot=full`);
        return await response.json();
    } catch (error) {
        console.error('Details fetch error:', error);
        return null;
    }
}

// Render Functions
function renderMovies() {
    let moviesToDisplay = [];

    if (state.currentTab === 'all') {
        moviesToDisplay = state.allMovies;
        document.getElementById('loadMore').style.display = state.allMovies.length >= 10 ? 'block' : 'none';
    } else if (state.currentTab === 'favorites') {
        moviesToDisplay = state.favorites;
        document.getElementById('loadMore').style.display = 'none';
    } else if (state.currentTab === 'recent') {
        moviesToDisplay = state.history;
        document.getElementById('loadMore').style.display = 'none';
    }

    if (moviesToDisplay.length === 0) {
        movieGrid.innerHTML = `<div class="empty-state"><h2>Empty here...</h2><p>Try searching or adding some movies!</p></div>`;
        return;
    }

    const html = moviesToDisplay.map(movie => createMovieCard(movie)).join('');
    movieGrid.innerHTML = html;
}

function createMovieCard(movie) {
    const isFavorite = state.favorites.some(m => m.imdbID === movie.imdbID);
    return `
        <div class="movie-card" onclick="handleCardClick('${movie.imdbID}')">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${movie.imdbID}')">
                ${isFavorite ? '❤' : '♡'}
            </button>
            <div class="movie-poster-wrapper">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/141416/ffffff?text=No+Poster'}" 
                     alt="${movie.Title}" class="movie-poster" loading="lazy">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <div class="movie-meta">
                    <span>${movie.Year}</span>
                    <span class="movie-rating">★ OMDb</span>
                </div>
            </div>
        </div>
    `;
}

async function handleCardClick(imdbID) {
    // Show modal with skeleton first
    modalBody.innerHTML = '<div style="padding: 100px; text-align: center; width: 100%;"><h3>Loading cinematic details...</h3></div>';
    modal.classList.add('active');

    const movie = await fetchMovieDetails(imdbID);
    if (!movie) return;

    // Add to history
    addToHistory(movie);

    const isFavorite = state.favorites.some(m => m.imdbID === movie.imdbID);

    modalBody.innerHTML = `
        <div class="modal-poster-side">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/800x1200'}" alt="${movie.Title}" class="modal-poster">
        </div>
        <div class="modal-info-side">
            <h2 class="modal-title">${movie.Title}</h2>
            <div class="modal-meta">
                <span class="meta-tag">⭐ ${movie.imdbRating}</span>
                <span class="meta-tag">📅 ${movie.Year}</span>
                <span class="meta-tag">${movie.Runtime}</span>
                <span class="meta-tag">${movie.Genre}</span>
            </div>
            <p class="modal-overview">${movie.Plot}</p>
            
            <div class="modal-cast">
                <div class="cast-title">Director</div>
                <div class="cast-list">${movie.Director}</div>
            </div>
            
            <div class="modal-cast">
                <div class="cast-title">Top Cast</div>
                <div class="cast-list">${movie.Actors}</div>
            </div>

            <div class="modal-actions">
                <button class="btn-favorite" onclick="toggleFavorite('${movie.imdbID}', true)">
                    ${isFavorite ? '❤ Remove from Favorites' : '♡ Add to Favorites'}
                </button>
            </div>
        </div>
    `;
}

// State Utilities
function toggleFavorite(imdbID, inModal = false) {
    const movieIndex = state.favorites.findIndex(m => m.imdbID === imdbID);

    if (movieIndex > -1) {
        state.favorites.splice(movieIndex, 1);
    } else {
        const movie = state.allMovies.find(m => m.imdbID === imdbID) ||
            state.history.find(m => m.imdbID === imdbID);
        if (movie) state.favorites.push(movie);
    }

    localStorage.setItem('cine_favorites', JSON.stringify(state.favorites));

    if (inModal) {
        const btn = document.querySelector('.btn-favorite');
        const isFavorite = state.favorites.some(m => m.imdbID === imdbID);
        btn.innerHTML = isFavorite ? '❤ Remove from Favorites' : '♡ Add to Favorites';
    }

    renderMovies();
}

function addToHistory(movie) {
    state.history = state.history.filter(m => m.imdbID !== movie.imdbID);
    state.history.unshift({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Poster: movie.Poster,
        Year: movie.Year
    });
    state.history = state.history.slice(0, 10); // Keep last 10
    localStorage.setItem('cine_history', JSON.stringify(state.history));
}

// Helpers
function showSkeletons(append) {
    const skeletons = Array(4).fill(0).map(() => `
        <div class="movie-card skeleton" style="height: 450px; border-radius: 24px;"></div>
    `).join('');

    if (append) {
        movieGrid.insertAdjacentHTML('beforeend', skeletons);
    } else {
        movieGrid.innerHTML = skeletons;
    }
}

function hideSkeletons() {
    const skeletons = movieGrid.querySelectorAll('.skeleton');
    skeletons.forEach(s => s.remove());
}

function loadPreferences() {
    state.theme = localStorage.getItem('cine_theme') || 'dark';
    if (state.theme === 'light') document.body.classList.add('light-theme');
}

// Event Listeners
function attachEventListeners() {
    document.getElementById('apiKeyBtn').addEventListener('click', () => {
        const newKey = prompt('Enter your OMDb API Key (get one free at omdbapi.com):', API_KEY);
        if (newKey && newKey.trim() !== '') {
            updateApiKey(newKey.trim());
            state.currentPage = 1;
            fetchMovies();
        }
    });

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            state.searchQuery = e.target.value.trim() || 'Avengers';
            state.currentPage = 1;
            fetchMovies();
        }, 600);
    });

    loadMoreBtn.addEventListener('click', () => {
        state.currentPage++;
        fetchMovies(true);
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentTab = tab.dataset.tab;
            renderMovies();
        });
    });

    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-theme');
        localStorage.setItem('cine_theme', state.theme);
    });

    document.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', init);
