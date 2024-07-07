
export const FPSHandler = (() => {
  let FPS = 0;
  let deltaTime = 0;
  let lastFrameTime = 0;
  let frameCount = 0;

  function Instance() {

    function loop() {
      const currentTime = performance.now();
      deltaTime = (currentTime - lastFrameTime);

      frameCount++;

      if (currentTime >= lastFrameTime + 1) {
        lastFrameTime = currentTime;
        FPS = frameCount;
        frameCount = 0;
      }
    }

    const getFPS = () => FPS;

    const getDeltaTime = () => deltaTime;

    return { getFPS, loop, getDeltaTime }
  }

  return Instance;

})()
