// Movie Database
const movieDatabase = [
    {id:1,title:"The Shawshank Redemption",year:1994,genre:"Drama",rating:9.3,language:"English",runtime:142,poster:"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",overview:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."},
    {id:2,title:"The Godfather",year:1972,genre:"Crime",rating:9.2,language:"English",runtime:175,poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",overview:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."},
    {id:3,title:"The Dark Knight",year:2008,genre:"Action",rating:9.0,language:"English",runtime:152,poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",overview:"When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."},
    {id:4,title:"Pulp Fiction",year:1994,genre:"Crime",rating:8.9,language:"English",runtime:154,poster:"https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",overview:"The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption."},
    {id:5,title:"Forrest Gump",year:1994,genre:"Drama",rating:8.8,language:"English",runtime:142,poster:"https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",overview:"The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75."},
    {id:6,title:"Inception",year:2010,genre:"Sci-Fi",rating:8.8,language:"English",runtime:148,poster:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",overview:"A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea."},
    {id:7,title:"The Matrix",year:1999,genre:"Sci-Fi",rating:8.7,language:"English",runtime:136,poster:"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",overview:"A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."},
    {id:8,title:"Goodfellas",year:1990,genre:"Crime",rating:8.7,language:"English",runtime:146,poster:"https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",overview:"The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners in crime."},
    {id:9,title:"Interstellar",year:2014,genre:"Sci-Fi",rating:8.6,language:"English",runtime:169,poster:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",overview:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."},
    {id:10,title:"The Silence of the Lambs",year:1991,genre:"Thriller",rating:8.6,language:"English",runtime:118,poster:"https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",overview:"A young FBI cadet must receive the help of an incarcerated cannibal killer to catch another serial killer."},
    {id:11,title:"Saving Private Ryan",year:1998,genre:"War",rating:8.6,language:"English",runtime:169,poster:"https://m.media-amazon.com/images/M/MV5BZjhkMDM4MWItZTVjOC00ZDRhLThmYTAtM2I5NzBmNmNlMzI1XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_SX300.jpg",overview:"Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper."},
    {id:12,title:"The Green Mile",year:1999,genre:"Drama",rating:8.6,language:"English",runtime:189,poster:"https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_SX300.jpg",overview:"The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape."},
    {id:13,title:"Parasite",year:2019,genre:"Thriller",rating:8.6,language:"Korean",runtime:132,poster:"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",overview:"Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."},
    {id:14,title:"Spirited Away",year:2001,genre:"Animation",rating:8.6,language:"Japanese",runtime:125,poster:"https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",overview:"During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits."},
    {id:15,title:"The Prestige",year:2006,genre:"Drama",rating:8.5,language:"English",runtime:130,poster:"https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_SX300.jpg",overview:"After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything."},
    {id:16,title:"Gladiator",year:2000,genre:"Action",rating:8.5,language:"English",runtime:155,poster:"https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",overview:"A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery."},
    {id:17,title:"The Departed",year:2006,genre:"Crime",rating:8.5,language:"English",runtime:151,poster:"https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_SX300.jpg",overview:"An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in Boston."},
    {id:18,title:"Whiplash",year:2014,genre:"Drama",rating:8.5,language:"English",runtime:106,poster:"https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",overview:"A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing."},
    {id:19,title:"The Lion King",year:1994,genre:"Animation",rating:8.5,language:"English",runtime:88,poster:"https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_SX300.jpg",overview:"Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself."},
    {id:20,title:"The Usual Suspects",year:1995,genre:"Crime",rating:8.5,language:"English",runtime:106,poster:"https://m.media-amazon.com/images/M/MV5BYTViNjMyNmUtNDFkNC00ZDRlLThmMDUtZDU2YWE4NGI2ZjVmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",overview:"A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which began when five criminals met at a seemingly random police lineup."}
];

// Generate more movies to reach 200+
for(let i = 21; i <= 220; i++) {
    const genres = ["Action","Drama","Comedy","Thriller","Sci-Fi","Horror","Romance","Animation","Crime","War"];
    const languages = ["English","Spanish","French","Korean","Japanese","German","Italian"];
    movieDatabase.push({
        id: i,
        title: `Movie Title ${i}`,
        year: 1990 + Math.floor(Math.random() * 34),
        genre: genres[Math.floor(Math.random() * genres.length)],
        rating: (6 + Math.random() * 3).toFixed(1),
        language: languages[Math.floor(Math.random() * languages.length)],
        runtime: 90 + Math.floor(Math.random() * 90),
        poster: `https://via.placeholder.com/300x450/333/fff?text=Movie+${i}`,
        overview: `This is an engaging story about Movie ${i}. A compelling narrative that keeps audiences on the edge of their seats with unexpected twists and memorable characters.`
    });
}

// State Management
let state = {
    allMovies: movieDatabase,
    displayedMovies: [],
    filteredMovies: [],
    currentTab: 'all',
    currentPage: 0,
    itemsPerPage: 20,
    searchQuery: '',
    sortBy: '',
    genreFilter: '',
    languageFilter: '',
    viewMode: 'grid',
    theme: 'dark'
};

// LocalStorage Keys
const STORAGE_KEYS = {
    FAVORITES: 'movieapp_favorites',
    RECENT: 'movieapp_recent',
    PREFERENCES: 'movieapp_preferences',
    CACHE: 'movieapp_cache'
};

// Initialize App
function init() {
    loadPreferences();
    cacheMovies();
    populateFilters();
    applyFilters();
    renderMovies();
    attachEventListeners();
}

// LocalStorage Functions
function loadPreferences() {
    const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '{}');
    state.viewMode = prefs.viewMode || 'grid';
    state.theme = prefs.theme || 'dark';
    
    if(state.theme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHE) || '[]');
    if(cached.length > 0) {
        state.allMovies = cached;
    }
}

function savePreferences() {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({
        viewMode: state.viewMode,
        theme: state.theme
    }));
}

function cacheMovies() {
    localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(state.allMovies));
}

function getFavorites() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
}

function saveFavorites(favorites) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

function toggleFavorite(movieId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(movieId);
    
    if(index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movieId);
    }
    
    saveFavorites(favorites);
    
    if(state.currentTab === 'favorites') {
        applyFilters();
        renderMovies();
    }
}

function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT) || '[]');
}

function addToRecentlyViewed(movieId) {
    let recent = getRecentlyViewed();
    recent = recent.filter(id => id !== movieId);
    recent.unshift(movieId);
    recent = recent.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent));
}

// Filter and Sort Functions
function populateFilters() {
    const genres = [...new Set(state.allMovies.map(m => m.genre))].sort();
    const languages = [...new Set(state.allMovies.map(m => m.language))].sort();
    
    const genreSelect = document.getElementById('genreFilter');
    const langSelect = document.getElementById('languageFilter');
    
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        langSelect.appendChild(option);
    });
}

function applyFilters() {
    let movies = state.allMovies;
    
    // Tab filtering
    if(state.currentTab === 'favorites') {
        const favorites = getFavorites();
        movies = movies.filter(m => favorites.includes(m.id));
    } else if(state.currentTab === 'recent') {
        const recent = getRecentlyViewed();
        movies = movies.filter(m => recent.includes(m.id));
        movies.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    }
    
    // Search filtering
    if(state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        movies = movies.filter(m => 
            m.title.toLowerCase().includes(query) ||
            m.genre.toLowerCase().includes(query) ||
            m.year.toString().includes(query)
        );
    }
    
    // Genre filtering
    if(state.genreFilter) {
        movies = movies.filter(m => m.genre === state.genreFilter);
    }
    
    // Language filtering
    if(state.languageFilter) {
        movies = movies.filter(m => m.language === state.languageFilter);
    }
    
    // Sorting
    if(state.sortBy === 'rating-desc') {
        movies.sort((a, b) => b.rating - a.rating);
    } else if(state.sortBy === 'year-desc') {
        movies.sort((a, b) => b.year - a.year);
    } else if(state.sortBy === 'title-asc') {
        movies.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    state.filteredMovies = movies;
    state.currentPage = 0;
}

function getDisplayMovies() {
    const start = 0;
    const end = (state.currentPage + 1) * state.itemsPerPage;
    return state.filteredMovies.slice(start, end);
}

// Render Functions
function renderMovies() {
    const grid = document.getElementById('movieGrid');
    const displayMovies = getDisplayMovies();
    
    if(displayMovies.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h2>No movies found</h2><p>Try adjusting your filters or search query</p></div>';
        document.getElementById('loadMore').style.display = 'none';
        return;
    }
    
    grid.className = `movie-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;
    grid.innerHTML = displayMovies.map(movie => createMovieCard(movie)).join('');
    
    // Show/hide load more button
    const hasMore = displayMovies.length < state.filteredMovies.length;
    document.getElementById('loadMore').style.display = hasMore ? 'block' : 'none';
}

function createMovieCard(movie) {
    const favorites = getFavorites();
    const isFavorite = favorites.includes(movie.id);
    
    return `
        <div class="movie-card" data-id="${movie.id}">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${movie.id})">
                ${isFavorite ? '❤' : '♡'}
            </button>
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/333/fff?text=No+Image'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating">⭐ ${movie.rating}</span>
                    <span>${movie.year}</span>
                </div>
                <div class="movie-genre">${movie.genre}</div>
            </div>
        </div>
    `;
}

function openModal(movieId) {
    const movie = state.allMovies.find(m => m.id === movieId);
    if(!movie) return;
    
    addToRecentlyViewed(movieId);
    
    const favorites = getFavorites();
    const isFavorite = favorites.includes(movie.id);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${movie.poster}" alt="${movie.title}" class="modal-poster" onerror="this.src='https://via.placeholder.com/800x400/333/fff?text=No+Image'">
        </div>
        <div class="modal-body">
            <h2 class="modal-title">${movie.title}</h2>
            <div class="modal-meta">
                <span class="modal-rating">⭐ ${movie.rating}</span>
                <span>📅 ${movie.year}</span>
                <span>🎬 ${movie.genre}</span>
                <span>🌐 ${movie.language}</span>
                <span>⏱ ${movie.runtime} min</span>
            </div>
            <p class="modal-overview">${movie.overview}</p>
            <div class="modal-actions">
                <button class="btn-primary" onclick="toggleFavorite(${movie.id}); this.textContent = getFavorites().includes(${movie.id}) ? '❤ Remove from Favorites' : '♡ Add to Favorites'">
                    ${isFavorite ? '❤ Remove from Favorites' : '♡ Add to Favorites'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Event Listeners
function attachEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        applyFilters();
        renderMovies();
    });
    
    // Filters
    document.getElementById('sortBy').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
        renderMovies();
    });
    
    document.getElementById('genreFilter').addEventListener('change', (e) => {
        state.genreFilter = e.target.value;
        applyFilters();
        renderMovies();
    });
    
    document.getElementById('languageFilter').addEventListener('change', (e) => {
        state.languageFilter = e.target.value;
        applyFilters();
        renderMovies();
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentTab = tab.dataset.tab;
            applyFilters();
            renderMovies();
        });
    });
    
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-theme');
        savePreferences();
    });
    
    // View Toggle
    document.getElementById('viewToggle').addEventListener('click', () => {
        state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
        renderMovies();
        savePreferences();
    });
    
    // Load More
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        state.currentPage++;
        renderMovies();
    });
    
    // Movie Card Click
    document.getElementById('movieGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if(card) {
            openModal(parseInt(card.dataset.id));
        }
    });
    
    // Modal Close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if(e.target.id === 'modal') closeModal();
    });
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') closeModal();
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
