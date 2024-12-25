//*
// In this script, I will be using a global list to hold the projects. First of all, it is global to this page
// where the script is used, and there are only projects on this page. Secondly, a list is used since I do
// not intend for there to be a lot of projects necessarily, hence linear time is sufficient.
// *//

let allProjects = [];
let filterState = {
    language: 'all', // 'all' or the language in the SELECT box
    type: 'all', // 'individual', 'group', or 'all'
    sort: 'none' // 'dateAsc', 'dateDesc', or 'none'
};

function loadProjects(containerId, dataUrl) {
    fetch(dataUrl) //<- location of json data
        .then(response => response.json())
        .then(data => {
            allProjects = data;
            populateLanguageFilter(data);
            renderFilteredAndSortedProjects(containerId);
        })
        .catch(error => {
            console.error('Project data not loaded, error:', error);
        });
}

function populateLanguageFilter(projects) {
    const languageFilter = document.getElementById('languageFilter');
    const languages = new Set();

    projects.forEach(project => {
        const projectLanguages = project.tags.language;
        projectLanguages.forEach(lang => {
            languages.add(lang);
        });
    });

    languageFilter.innerHTML = `<option value="all">All  Languages</option>`;
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
}

function renderFilteredAndSortedProjects(containerId) {
    let filteredProjects = allProjects;

    if (filterState.language !== 'all') {
        filteredProjects = filteredProjects.filter(project =>
            project.tags && Array.isArray(project.tags.language) &&
            project.tags.language.includes(filterState.language)
        );
    }

    if (filterState.type === 'individual') {
        filteredProjects = filteredProjects.filter(project => project.individual);
    } else if (filterState.type === 'group') {
        filteredProjects = filteredProjects.filter(project => !project.individual);
    }

    if (filterState.sort === 'dateAsc') {
        filteredProjects = filteredProjects.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filterState.sort === 'dateDesc') {
        filteredProjects = filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderProjects(filteredProjects, containerId);
}

function renderProjects(projects, containerId) {
    const projectsContainer = document.getElementById(containerId);
    projectsContainer.innerHTML = '';

    projects.forEach((project) => {
        const projectItem = document.createElement('div');
        projectItem.classList.add('project-item', 'poppins-regular');

        const informationLink = project.information.available
            ? `<a class="learn-more-link" href="${project.information.link}" target="_blank">Learn More</a>`
            : '';

        const codeLinkHTML = project.code.available
            ? `<a class="view-code-link" href="${project.code.link}" target="_blank">View Code</a>`
            : '';

        const individualHTML = project.individual
            ? `<p class="project-type">Individual Project ${project.date}</p>`
            : `<p class="project-type">Group Project ${project.date}</p>`;

        let mediaHTML = '';
        if (project.media.type === 'video') {
            mediaHTML = `
                <div class="project-media">
                    <video controls>
                        <source src="${project.media.link}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>`;
        } else if (project.media.type === 'image') {
            mediaHTML = `
                <div class="project-media">
                    <img src="${project.media.link}" alt="${project.title}">
                </div>`;
        }

        projectItem.innerHTML = `
            <div class="project-content">
                <h2 class="project-title">${project.title}</h2>
                <p class="project-description">${project.description}</p>
                ${codeLinkHTML}
                ${informationLink}
                <b>${individualHTML}</b>
            </div>
            ${mediaHTML}`;

        projectsContainer.appendChild(projectItem);
    });
}

document.getElementById('languageFilter').addEventListener('change', (event) => {
    filterState.language = event.target.value;
    renderFilteredAndSortedProjects('projectsContainer');
});

document.getElementById('sortDateAsc').addEventListener('click', () => {
    filterState.sort = 'dateAsc';
    renderFilteredAndSortedProjects('projectsContainer');
});

document.getElementById('sortDateDesc').addEventListener('click', () => {
    filterState.sort = 'dateDesc';
    renderFilteredAndSortedProjects('projectsContainer');
});

document.getElementById('filterIndividual').addEventListener('click', () => {
    filterState.type = filterState.type === 'individual' ? 'all' : 'individual'; // Toggle filter
    renderFilteredAndSortedProjects('projectsContainer');
});

document.getElementById('filterGroup').addEventListener('click', () => {
    filterState.type = filterState.type === 'group' ? 'all' : 'group'; // Toggle filter
    renderFilteredAndSortedProjects('projectsContainer');
});
