async function wait(waitFactor){
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        },  500 * waitFactor)
    );
}