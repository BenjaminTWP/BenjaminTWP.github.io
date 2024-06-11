async function wait_for(wait_factor){
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        },  500 * wait_factor)
    );
}