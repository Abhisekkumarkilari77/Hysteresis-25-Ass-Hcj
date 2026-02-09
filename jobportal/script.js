// Job Data
const jobsData = [
    {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "Remote",
        type: "Full-time",
        experience: "Senior Level",
        posted: "2024-01-15",
        summary: "Join our team to build cutting-edge web applications using modern frameworks and best practices.",
        description: "We are seeking an experienced Frontend Developer to lead our web development initiatives. You will work with cross-functional teams to deliver high-quality user experiences.",
        responsibilities: [
            "Develop and maintain responsive web applications",
            "Collaborate with designers and backend developers",
            "Optimize applications for maximum performance",
            "Mentor junior developers and conduct code reviews"
        ],
        qualifications: [
            "5+ years of experience in frontend development",
            "Expert knowledge of JavaScript, HTML, and CSS",
            "Experience with modern frameworks (React, Vue, or Angular)",
            "Strong understanding of web performance optimization"
        ],
        skills: ["JavaScript", "React", "CSS", "HTML", "TypeScript", "Git"],
        salary: "$120,000 - $160,000"
    },
    {
        id: 2,
        title: "Product Manager",
        company: "InnovateLabs",
        location: "San Francisco",
        type: "Full-time",
        experience: "Mid Level",
        posted: "2024-01-18",
        summary: "Drive product strategy and execution for our flagship SaaS platform serving enterprise clients.",
        description: "We're looking for a Product Manager to own the roadmap and execution of key product features. You'll work closely with engineering, design, and business teams.",
        responsibilities: [
            "Define product vision and strategy",
            "Gather and prioritize product requirements",
            "Work with engineering teams on implementation",
            "Analyze metrics and user feedback"
        ],
        qualifications: [
            "3+ years of product management experience",
            "Strong analytical and problem-solving skills",
            "Experience with agile methodologies",
            "Excellent communication skills"
        ],
        skills: ["Product Strategy", "Agile", "Analytics", "User Research", "Roadmapping"],
        salary: "$110,000 - $140,000"
    },
    {
        id: 3,
        title: "Data Engineer",
        company: "DataSystems",
        location: "New York",
        type: "Full-time",
        experience: "Mid Level",
        posted: "2024-01-20",
        summary: "Build and maintain scalable data pipelines to support analytics and machine learning initiatives.",
        description: "Join our data team to design and implement robust data infrastructure. You'll work with large-scale datasets and modern data technologies.",
        responsibilities: [
            "Design and build data pipelines",
            "Optimize data storage and retrieval",
            "Collaborate with data scientists and analysts",
            "Ensure data quality and reliability"
        ],
        qualifications: [
            "3+ years of data engineering experience",
            "Proficiency in SQL and Python",
            "Experience with cloud platforms (AWS, GCP, or Azure)",
            "Knowledge of data warehousing concepts"
        ],
        skills: ["Python", "SQL", "AWS", "Spark", "ETL", "Data Modeling"],
        salary: "$115,000 - $145,000"
    },
    {
        id: 4,
        title: "UX Designer",
        company: "CloudWorks",
        location: "Remote",
        type: "Full-time",
        experience: "Mid Level",
        posted: "2024-01-22",
        summary: "Create intuitive and delightful user experiences for our cloud-based collaboration platform.",
        description: "We're seeking a talented UX Designer to shape the user experience of our products. You'll conduct research, create wireframes, and collaborate with product and engineering teams.",
        responsibilities: [
            "Conduct user research and usability testing",
            "Create wireframes, prototypes, and user flows",
            "Collaborate with product managers and developers",
            "Maintain and evolve design systems"
        ],
        qualifications: [
            "3+ years of UX design experience",
            "Strong portfolio demonstrating UX process",
            "Proficiency in design tools (Figma, Sketch, etc.)",
            "Understanding of accessibility standards"
        ],
        skills: ["Figma", "User Research", "Prototyping", "Wireframing", "Design Systems"],
        salary: "$95,000 - $125,000"
    },
    {
        id: 5,
        title: "DevOps Engineer",
        company: "TechCorp",
        location: "Berlin",
        type: "Full-time",
        experience: "Senior Level",
        posted: "2024-01-10",
        summary: "Manage and optimize our cloud infrastructure to ensure reliability and scalability.",
        description: "We need a DevOps Engineer to maintain our infrastructure and improve deployment processes. You'll work with containerization, CI/CD, and cloud services.",
        responsibilities: [
            "Manage cloud infrastructure and deployments",
            "Implement and maintain CI/CD pipelines",
            "Monitor system performance and reliability",
            "Automate operational tasks"
        ],
        qualifications: [
            "5+ years of DevOps experience",
            "Strong knowledge of AWS or Azure",
            "Experience with Docker and Kubernetes",
            "Proficiency in scripting languages"
        ],
        skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Python"],
        salary: "$125,000 - $155,000"
    },
    {
        id: 6,
        title: "Marketing Coordinator",
        company: "InnovateLabs",
        location: "Remote",
        type: "Part-time",
        experience: "Entry Level",
        posted: "2024-01-25",
        summary: "Support marketing campaigns and content creation to drive brand awareness and lead generation.",
        description: "Join our marketing team to help execute campaigns across multiple channels. This is a great opportunity for someone starting their marketing career.",
        responsibilities: [
            "Assist in campaign planning and execution",
            "Create and schedule social media content",
            "Track and report on marketing metrics",
            "Coordinate with external vendors"
        ],
        qualifications: [
            "1+ years of marketing experience",
            "Strong written and verbal communication",
            "Familiarity with social media platforms",
            "Basic understanding of marketing analytics"
        ],
        skills: ["Social Media", "Content Creation", "Analytics", "Communication"],
        salary: "$45,000 - $60,000"
    },
    {
        id: 7,
        title: "Backend Developer",
        company: "DataSystems",
        location: "London",
        type: "Full-time",
        experience: "Mid Level",
        posted: "2024-01-12",
        summary: "Develop robust APIs and services to power our data analytics platform.",
        description: "We're looking for a Backend Developer to build scalable server-side applications. You'll work with microservices architecture and modern backend technologies.",
        responsibilities: [
            "Design and implement RESTful APIs",
            "Write clean, maintainable code",
            "Optimize database queries and performance",
            "Participate in code reviews"
        ],
        qualifications: [
            "3+ years of backend development experience",
            "Strong knowledge of Node.js or Python",
            "Experience with databases (SQL and NoSQL)",
            "Understanding of API design principles"
        ],
        skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "REST APIs", "Microservices"],
        salary: "$100,000 - $130,000"
    },
    {
        id: 8,
        title: "Software Engineering Intern",
        company: "CloudWorks",
        location: "San Francisco",
        type: "Internship",
        experience: "Entry Level",
        posted: "2024-01-28",
        summary: "Gain hands-on experience building software in a fast-paced startup environment.",
        description: "This internship offers the opportunity to work on real projects alongside experienced engineers. You'll contribute to our codebase and learn industry best practices.",
        responsibilities: [
            "Contribute to feature development",
            "Write unit tests and documentation",
            "Participate in team meetings and code reviews",
            "Learn from senior engineers"
        ],
        qualifications: [
            "Currently pursuing CS degree or bootcamp graduate",
            "Knowledge of at least one programming language",
            "Strong problem-solving skills",
            "Eagerness to learn"
        ],
        skills: ["JavaScript", "Python", "Git", "Problem Solving"],
        salary: "$25 - $35 per hour"
    },
    {
        id: 9,
        title: "Technical Lead",
        company: "FinanceHub",
        location: "New York",
        type: "Full-time",
        experience: "Lead",
        posted: "2024-01-08",
        summary: "Lead a team of engineers building secure financial technology solutions.",
        description: "We're seeking a Technical Lead to guide our engineering team. You'll make architectural decisions, mentor developers, and ensure delivery of high-quality software.",
        responsibilities: [
            "Lead technical architecture and design",
            "Mentor and manage engineering team",
            "Drive technical excellence and best practices",
            "Collaborate with stakeholders on requirements"
        ],
        qualifications: [
            "7+ years of software development experience",
            "3+ years in technical leadership role",
            "Strong system design skills",
            "Experience in fintech or regulated industries"
        ],
        skills: ["System Design", "Leadership", "Java", "Microservices", "Security", "Mentoring"],
        salary: "$150,000 - $190,000"
    },
    {
        id: 10,
        title: "QA Engineer",
        company: "TechCorp",
        location: "Remote",
        type: "Contract",
        experience: "Mid Level",
        posted: "2024-01-14",
        summary: "Ensure product quality through comprehensive testing strategies and automation.",
        description: "Join our QA team to develop and execute test plans. You'll work on both manual and automated testing to ensure our products meet quality standards.",
        responsibilities: [
            "Create and execute test plans",
            "Develop automated test scripts",
            "Identify and document bugs",
            "Collaborate with development teams"
        ],
        qualifications: [
            "3+ years of QA experience",
            "Experience with test automation tools",
            "Strong attention to detail",
            "Knowledge of testing methodologies"
        ],
        skills: ["Test Automation", "Selenium", "API Testing", "Bug Tracking", "Agile"],
        salary: "$80,000 - $105,000"
    }
];

// Local Storage Manager
const storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// State Management
let state = {
    jobs: jobsData,
    filteredJobs: jobsData,
    savedJobs: storage.get('savedJobs') || [],
    recentJobs: storage.get('recentJobs') || [],
    filters: storage.get('filters') || {
        search: '',
        location: '',
        jobTypes: [],
        experience: [],
        company: ''
    },
    currentView: 'listings',
    currentJob: null,
    sortBy: 'newest'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    applyFilters();
    attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('locationFilter').addEventListener('change', handleLocationFilter);
    document.getElementById('companyFilter').addEventListener('change', handleCompanyFilter);
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('filterToggle').addEventListener('click', toggleFilters);
    
    document.querySelectorAll('.job-type-filter').forEach(cb => {
        cb.addEventListener('change', handleJobTypeFilter);
    });
    
    document.querySelectorAll('.experience-filter').forEach(cb => {
        cb.addEventListener('change', handleExperienceFilter);
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.getElementById('submitApplication')?.addEventListener('click', () => {
        alert('Application submitted successfully!');
        closeModal();
    });
}

// Initialize Filters from Storage
function initializeFilters() {
    document.getElementById('searchInput').value = state.filters.search;
    document.getElementById('locationFilter').value = state.filters.location;
    document.getElementById('companyFilter').value = state.filters.company;
    
    state.filters.jobTypes.forEach(type => {
        const checkbox = Array.from(document.querySelectorAll('.job-type-filter'))
            .find(cb => cb.value === type);
        if (checkbox) checkbox.checked = true;
    });
    
    state.filters.experience.forEach(exp => {
        const checkbox = Array.from(document.querySelectorAll('.experience-filter'))
            .find(cb => cb.value === exp);
        if (checkbox) checkbox.checked = true;
    });
}

// Filter Handlers
function handleSearch() {
    state.filters.search = document.getElementById('searchInput').value.toLowerCase();
    saveFilters();
    applyFilters();
}

function handleLocationFilter(e) {
    state.filters.location = e.target.value;
    saveFilters();
    applyFilters();
}

function handleCompanyFilter(e) {
    state.filters.company = e.target.value;
    saveFilters();
    applyFilters();
}

function handleJobTypeFilter() {
    state.filters.jobTypes = Array.from(document.querySelectorAll('.job-type-filter:checked'))
        .map(cb => cb.value);
    saveFilters();
    applyFilters();
}

function handleExperienceFilter() {
    state.filters.experience = Array.from(document.querySelectorAll('.experience-filter:checked'))
        .map(cb => cb.value);
    saveFilters();
    applyFilters();
}

function handleSort(e) {
    state.sortBy = e.target.value;
    applyFilters();
}

function clearFilters() {
    state.filters = {
        search: '',
        location: '',
        jobTypes: [],
        experience: [],
        company: ''
    };
    document.getElementById('searchInput').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('companyFilter').value = '';
    document.querySelectorAll('.job-type-filter, .experience-filter').forEach(cb => cb.checked = false);
    saveFilters();
    applyFilters();
}

function saveFilters() {
    storage.set('filters', state.filters);
}

// Apply Filters
function applyFilters() {
    let filtered = state.jobs;
    
    if (state.currentView === 'saved') {
        filtered = state.jobs.filter(job => state.savedJobs.includes(job.id));
    } else if (state.currentView === 'recent') {
        filtered = state.jobs.filter(job => state.recentJobs.includes(job.id));
    } else {
        if (state.filters.search) {
            filtered = filtered.filter(job => 
                job.title.toLowerCase().includes(state.filters.search) ||
                job.summary.toLowerCase().includes(state.filters.search) ||
                job.skills.some(skill => skill.toLowerCase().includes(state.filters.search))
            );
        }
        
        if (state.filters.location) {
            filtered = filtered.filter(job => job.location === state.filters.location);
        }
        
        if (state.filters.company) {
            filtered = filtered.filter(job => job.company === state.filters.company);
        }
        
        if (state.filters.jobTypes.length > 0) {
            filtered = filtered.filter(job => state.filters.jobTypes.includes(job.type));
        }
        
        if (state.filters.experience.length > 0) {
            filtered = filtered.filter(job => state.filters.experience.includes(job.experience));
        }
    }
    
    filtered = sortJobs(filtered);
    state.filteredJobs = filtered;
    renderJobListings();
}

// Sort Jobs
function sortJobs(jobs) {
    const sorted = [...jobs];
    if (state.sortBy === 'newest') {
        sorted.sort((a, b) => new Date(b.posted) - new Date(a.posted));
    } else if (state.sortBy === 'oldest') {
        sorted.sort((a, b) => new Date(a.posted) - new Date(b.posted));
    }
    return sorted;
}

// Render Job Listings
function renderJobListings() {
    const container = document.getElementById('jobListings');
    const emptyState = document.getElementById('emptyState');
    const jobDetail = document.getElementById('jobDetail');
    const resultsCount = document.getElementById('resultsCount');
    
    jobDetail.classList.add('hidden');
    
    if (state.filteredJobs.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        resultsCount.textContent = 'No jobs found';
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    const viewText = state.currentView === 'saved' ? 'Saved Jobs' : 
                     state.currentView === 'recent' ? 'Recently Viewed' : 'Available Jobs';
    resultsCount.textContent = `${state.filteredJobs.length} ${viewText}`;
    
    container.innerHTML = state.filteredJobs.map(job => createJobCard(job)).join('');
    
    container.querySelectorAll('.job-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('bookmark-btn')) {
                showJobDetail(state.filteredJobs[index]);
            }
        });
    });
    
    container.querySelectorAll('.bookmark-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSaveJob(state.filteredJobs[index].id);
        });
    });
}

// Create Job Card HTML
function createJobCard(job) {
    const isSaved = state.savedJobs.includes(job.id);
    const daysAgo = Math.floor((new Date() - new Date(job.posted)) / (1000 * 60 * 60 * 24));
    
    return `
        <div class="job-card">
            <div class="job-card-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="company-name">${job.company}</p>
                </div>
                <button class="bookmark-btn ${isSaved ? 'saved' : ''}" title="${isSaved ? 'Unsave' : 'Save'} job">
                    ${isSaved ? '★' : '☆'}
                </button>
            </div>
            <div class="job-meta">
                <span>📍 ${job.location}</span>
                <span>💼 ${job.type}</span>
                <span>📊 ${job.experience}</span>
                <span>🕒 ${daysAgo} days ago</span>
            </div>
            <p class="job-summary">${job.summary}</p>
            <div class="job-card-footer">
                <div class="job-tags">
                    ${job.skills.slice(0, 3).map(skill => `<span class="tag">${skill}</span>`).join('')}
                </div>
                <button class="view-details-btn">View Details</button>
            </div>
        </div>
    `;
}

// Show Job Detail
function showJobDetail(job) {
    state.currentJob = job;
    addToRecentJobs(job.id);
    
    const container = document.getElementById('jobDetail');
    const listings = document.getElementById('jobListings');
    const isSaved = state.savedJobs.includes(job.id);
    
    listings.classList.add('hidden');
    container.classList.remove('hidden');
    
    container.innerHTML = `
        <button class="back-btn">← Back to Jobs</button>
        <div class="job-detail-header">
            <div>
                <h1 class="job-detail-title">${job.title}</h1>
                <p class="job-detail-company">${job.company}</p>
            </div>
            <div class="job-detail-actions">
                <button class="btn-primary" id="applyBtn">Apply Now</button>
                <button class="btn-secondary" id="saveJobBtn">
                    ${isSaved ? '★ Saved' : '☆ Save Job'}
                </button>
            </div>
        </div>
        
        <div class="job-detail-meta">
            <div class="meta-item">
                <span class="meta-label">Location</span>
                <span class="meta-value">${job.location}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Job Type</span>
                <span class="meta-value">${job.type}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Experience</span>
                <span class="meta-value">${job.experience}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Salary</span>
                <span class="meta-value">${job.salary}</span>
            </div>
        </div>
        
        <div class="job-detail-section">
            <h2 class="section-title">About the Role</h2>
            <p>${job.description}</p>
        </div>
        
        <div class="job-detail-section">
            <h2 class="section-title">Responsibilities</h2>
            <ul>
                ${job.responsibilities.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="job-detail-section">
            <h2 class="section-title">Qualifications</h2>
            <ul>
                ${job.qualifications.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="job-detail-section">
            <h2 class="section-title">Required Skills</h2>
            <div class="skills-list">
                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    `;
    
    container.querySelector('.back-btn').addEventListener('click', () => {
        container.classList.add('hidden');
        listings.classList.remove('hidden');
    });
    
    container.querySelector('#applyBtn').addEventListener('click', () => {
        document.getElementById('applyModal').classList.remove('hidden');
    });
    
    container.querySelector('#saveJobBtn').addEventListener('click', () => {
        toggleSaveJob(job.id);
        container.querySelector('#saveJobBtn').textContent = 
            state.savedJobs.includes(job.id) ? '★ Saved' : '☆ Save Job';
    });
    
    window.scrollTo(0, 0);
}

// Save/Unsave Job
function toggleSaveJob(jobId) {
    if (state.savedJobs.includes(jobId)) {
        state.savedJobs = state.savedJobs.filter(id => id !== jobId);
    } else {
        state.savedJobs.push(jobId);
    }
    storage.set('savedJobs', state.savedJobs);
    renderJobListings();
}

// Add to Recent Jobs
function addToRecentJobs(jobId) {
    state.recentJobs = [jobId, ...state.recentJobs.filter(id => id !== jobId)].slice(0, 10);
    storage.set('recentJobs', state.recentJobs);
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    const view = e.target.dataset.view;
    state.currentView = view;
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    applyFilters();
}

// Toggle Filters (Mobile)
function toggleFilters() {
    document.getElementById('filtersPanel').classList.toggle('active');
}

// Close Modal
function closeModal() {
    document.getElementById('applyModal').classList.add('hidden');
}
