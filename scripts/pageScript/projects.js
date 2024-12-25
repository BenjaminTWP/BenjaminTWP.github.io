function loadProjects(containerId, dataUrl) {
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const projectsContainer = document.getElementById(containerId);

            data.forEach((project) => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item', 'poppins-regular');

                const informationLink = project.information.available ?
                    `<a class="learn-more-link" href="${project.information.link}" target="_blank">Learn More</a>` :
                    '';

                const codeLinkHTML = project.code.available ?
                    `<a class="view-code-link" href="${project.code.link}" target="_blank">View Code</a>` :
                    '';

                const individualHTML = project.individual ?
                    `<p class="project-type">Individual Project ${project.date}</p>` :
                    `<p class="project-type">Group Project ${project.date}</p>`;

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

                // Generate the project HTML
                projectItem.innerHTML = `
                        <div class="project-content">
                            <h2 class="project-title">${project.title}</h2>
                            <p class="project-description">${project.description}</p>
                            ${codeLinkHTML} <!-- Only show code link if available -->
                            ${informationLink} <!-- Only show information link if available -->
                            
                            <b>${individualHTML} <!-- show if individual or team project --></b>
                        </div>
                        ${mediaHTML} 
                    `;

                projectsContainer.appendChild(projectItem);
            });
        })
        .catch(error => {
            console.error('Error fetching the project data:', error);
        });
}