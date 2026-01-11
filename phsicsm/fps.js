
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS() {
    const now = performance.now();
    frameCount++;

    if (now - lastFrameTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
        const counter = document.getElementById('fps-counter');
        if(counter) counter.textContent = `FPS: ${fps}`;
    }

    requestAnimationFrame(updateFPS);
}


window.addEventListener('load', () => {
    requestAnimationFrame(updateFPS);
});
