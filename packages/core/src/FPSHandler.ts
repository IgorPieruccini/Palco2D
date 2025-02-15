
export const FPSHandler = (() => {
  let FPS = 0;
  let deltaTime = 0;
  let previousTime = 0;
  let frameCount = 0;

  function Instance() {

    function loop() {
      const currentTime = performance.now();
      deltaTime = (currentTime - previousTime) / 1000;

      frameCount++;

      if (currentTime >= 1000) {
        deltaTime = currentTime - previousTime;
        FPS = frameCount / (deltaTime / 1000);
        frameCount = 0;
        previousTime = currentTime;
      }
    }

    const getFPS = () => FPS;

    const getDeltaTime = () => deltaTime;

    return { getFPS, loop, getDeltaTime }
  }

  return Instance;

})()
