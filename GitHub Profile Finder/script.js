const searchBtn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("username");
const profile = document.getElementById("profile");

searchBtn.addEventListener("click", fetchProfile);

usernameInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        fetchProfile();
    }
});

async function fetchProfile(){
    const username = usernameInput.value.trim();

    if(username === ""){
        profile.innerHTML = "<p class='error'>Please enter a username</p>";
        return;
    }

    profile.innerHTML = "<div class='loader'></div>";

    try{
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userResponse.json();

        if(userData.message === "Not Found"){
            profile.innerHTML = "<p class='error'>User not found</p>";
            return;
        }

        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        const repos = await repoResponse.json();

        let repoHTML = "";
        repos.forEach(repo => {
            repoHTML += `
                <a href="${repo.html_url}" target="_blank">
                    ${repo.name}
                </a>
            `;
        });

        profile.innerHTML = `
            <div class="profile-top">
                <img src="${userData.avatar_url}" alt="Avatar">
                <div class="profile-info">
                    <h2>${userData.name || userData.login}</h2>
                    <p>${userData.bio || "No bio available"}</p>
                    <p>📍 ${userData.location || "Unknown location"}</p>
                    <p>🏢 ${userData.company || "No company listed"}</p>
                    <p>🌐 ${userData.blog ? `<a href="${userData.blog}" target="_blank">${userData.blog}</a>` : "No website"}</p>

                    <div class="stats">
                        <div>Repos: ${userData.public_repos}</div>
                        <div>Followers: ${userData.followers}</div>
                        <div>Following: ${userData.following}</div>
                    </div>

                    <br>
                    <a href="${userData.html_url}" target="_blank" style="color:#ff758c;">
                        View Full Profile →
                    </a>
                </div>
            </div>

            <div class="repos">
                <h3>Latest Repositories:</h3>
                ${repoHTML || "<p>No repositories found.</p>"}
            </div>
        `;

    }catch(error){
        profile.innerHTML = "<p class='error'>Error fetching data</p>";
    }
}
