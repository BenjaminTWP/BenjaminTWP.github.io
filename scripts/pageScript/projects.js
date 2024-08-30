fetch('/data/projects.json')
    .then(response => response.json())
    .then(data => {
        const projectsContainer = document.getElementById('projectsContainer');

        data.forEach((project) => {
            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item', 'poppins-regular');

            // Handle the code link
            const codeLinkHTML = project.codeLink.available
                ? `<a class="view-code-link" href="${project.codeLink.link}" target="_blank">View Code</a>`
                : '';

            // Handle individual or team project display
            const individualHTML = project.individual
                ? '<p class="project-type">Individual Project</p>'
                : '<p class="project-type">Team Project</p>';

            // Handle media (either video or image)
            let mediaHTML = '';
            if (project.media.type === 'video') {
                mediaHTML = `
                        <div class="project-video">
                            <video controls style="max-width: 100%; border-radius: 10px;">
                                <source src="${project.media.link}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>`;
            } else if (project.media.type === 'image') {
                mediaHTML = `
                        <div class="project-image">
                            <img src="${project.media.link}" alt="${project.title}" style="max-width: 100%; border-radius: 10px;">
                        </div>`;
            }

            // Generate the project HTML
            projectItem.innerHTML = `
                    <div class="project-content">
                        <h2 class="project-title">${project.title}</h2>
                        <p class="project-description">${project.description}</p>
                        ${codeLinkHTML} <!-- Only show code link if available -->
                        <a class="learn-more-link" href="${project.informationLink}" target="_blank">Learn More</a>
                        
                        <b>${individualHTML} <!-- Show if individual or team project --></b>
                    </div>
                    ${mediaHTML} <!-- Render either video or image -->
                `;

            // Append the project to the container
            projectsContainer.appendChild(projectItem);
        });
    })
    .catch(error => {
        console.error('Error fetching the project data:', error);
    });