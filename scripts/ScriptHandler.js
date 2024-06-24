class ScriptHandler {
    #graphScripts = ["/scripts/utils/PriorityQueue.js", "/scripts/graph/PathAlgorithms.js",
        "/scripts/utils/Queue.js", "/scripts/graph/GraphVisualizer.js", "https://d3js.org/d3.v7.min.js",
        "/scripts/graph/graphNetworkActions.js"];
    #listScripts = ["/scripts/list/sorting/SortingAlgorithm.js", "/scripts/list/search/SearchAlgorithm.js",
        "/scripts/list/listActions.js","/scripts/list/ListVisualizer.js"];
    #matrixScripts = ["/scripts/matrix/algorithm/floodFill.js", "/scripts/matrix/MatrixVisualizer.js",
        "/scripts/matrix/matrixActions.js"];

    async loadScriptsForViews() {
        await this.#loadScripts(this.#graphScripts);
        await this.#loadScripts(this.#listScripts);
        await this.#loadScripts(this.#matrixScripts);
    }

    #loadScripts(scripts) {
        return Promise.all(scripts.map(src => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = false;
                script.classList.add('dynamic-script'); // This is used to know which script to remove later on
                script.onload = () => resolve(src);
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });
        }));
    }

    // well I will keep the functionality if I want to remove scripts in order to improve load time
    #removeAllDynamicScripts() {
        const scriptElements = document.querySelectorAll('script.dynamic-script');
        scriptElements.forEach(script => {
            script.remove();
        });
    }
}

