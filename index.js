document.addEventListener('DOMContentLoaded', () => {

    const GITHUB_USERNAME = "SyedMuhammadQasimSajjad";

    // 1. INITIALIZE AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, mirror: false });
    }

    // 2. TERMINAL GLITCH EFFECT
    const developerBadge = document.querySelector('h2.text-cyan-400');
    if (developerBadge) {
        const originalText = developerBadge.innerText;
        let iteration = 0;
        let interval = null;

        const triggerGlitch = () => {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            clearInterval(interval);
            interval = setInterval(() => {
                developerBadge.innerText = originalText.split("").map((_, index) => {
                    return index < iteration ? originalText[index] : letters[Math.floor(Math.random() * 26)];
                }).join("");
                if (iteration >= originalText.length) { clearInterval(interval); iteration = 0; }
                iteration += 1 / 3;
            }, 30);
        };
        setTimeout(triggerGlitch, 400);
        const mainCard = document.getElementById('about');
        if (mainCard) mainCard.addEventListener('mouseenter', triggerGlitch);
    }

    // 3. SMOOTH ANCHOR SCROLLING
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 4. LIVE GITHUB ENGINE
    async function fetchGitHubData() {
        const projectsContainer = document.getElementById('github-repos');

        // CACHING CHECK
        const cachedData = sessionStorage.getItem('githubRepos');
        if (cachedData) {
            renderRepos(JSON.parse(cachedData));
            return;
        }

        try {
            const profileResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
            if (profileResponse.status === 403) throw new Error('Rate limit exceeded');
            if (!profileResponse.ok) throw new Error('Profile fetch failed');

            const profileData = await profileResponse.json();
            const repoCounter = document.getElementById('github-repo-count');
            const profileLink = document.getElementById('github-profile-link');
            if (repoCounter) repoCounter.innerText = profileData.public_repos;
            if (profileLink) profileLink.href = profileData.html_url;

            const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
            const reposData = await reposResponse.json();

            if (Array.isArray(reposData)) {
                const personalRepos = reposData.filter(repo => !repo.fork);
                sessionStorage.setItem('githubRepos', JSON.stringify(personalRepos));
                renderRepos(personalRepos);
            }
        } catch (error) {
            console.error("GitHub Sync Error:", error);
            if (projectsContainer) {
                projectsContainer.innerHTML = `<p class="text-red-400/80 text-xs font-mono col-span-full text-center py-4">Sync paused: Rate limit or network error.</p>`;
            }
        }
    }

    // Helper Function to render cards
    function renderRepos(repos) {
        const projectsContainer = document.getElementById('github-repos');
        projectsContainer.innerHTML = '';

        if (repos.length === 0) {
            projectsContainer.innerHTML = `<p class="text-slate-500 text-xs font-mono col-span-full text-center py-4">No public repositories found.</p>`;
            return;
        }

        repos.forEach(repo => {
            const description = repo.description || "No description provided.";
            const language = repo.language || "Source Code";

            projectsContainer.innerHTML += `
                <div class="premium-card backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between border border-slate-900 bg-slate-950/40 hover:border-cyan-500/30 transition-all duration-300 group" data-aos="zoom-in">
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2 text-slate-400">
                                <i class="fa-regular fa-folder text-lg text-cyan-400"></i>
                                <span class="text-[11px] font-mono tracking-wider uppercase text-slate-500">${language}</span>
                            </div>
                            <span class="text-xs text-slate-400 font-mono"><i class="fa-regular fa-star text-amber-400 mr-1"></i>${repo.stargazers_count}</span>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300 truncate">${repo.name}</h3>
                            <p class="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">${description}</p>
                        </div>
                    </div>
                    <div class="pt-6 mt-4 border-t border-slate-900/60 flex justify-between items-center">
                        <span class="text-[10px] font-mono text-slate-600">Active Node</span>
                        <a href="${repo.html_url}" target="_blank" class="relative z-10 text-xs font-mono text-cyan-400 flex items-center space-x-1 hover:underline">
                            <span>Inspect Code</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </div>
                </div>
            `;
        });
    }

    fetchGitHubData();

});