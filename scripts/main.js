document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is running!');
    // Add your JavaScript code here
    create_list_view(20)


});

function create_list_view(n_bars){


    let container = document.querySelector(".list-visualizer");
    container.innerHTML = '';

    for (let i = 0; i< n_bars; i++){


        const value = Math.floor(Math.random() * 50) + 1;

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 3}px`;

        // Translate the bar towards positive X axis
        // bar.style.transform = `translateX(${i * 30}px)`;

        // To create element "label"
        const barLabel = document.createElement("label");

        // To add class "bar_id" to "label"
        barLabel.classList.add("bar_id");

        // Assign value to "label"
        barLabel.innerHTML = value.toString();

        // Append "Label" to "div"
        bar.appendChild(barLabel);

        // Append "div" to "data-container div"
        container.appendChild(bar);
    }
}

