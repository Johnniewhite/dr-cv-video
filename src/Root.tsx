import "./index.css";
import { Composition } from "remotion";
import { DrCV, TOTAL } from "./DrCV";
import { DrCVPool, POOL_TOTAL } from "./DrCVPool";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DrCV"
        component={DrCV}
        durationInFrames={TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DrCVVertical"
        component={DrCV}
        durationInFrames={TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DrCVPool"
        component={DrCVPool}
        durationInFrames={POOL_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DrCVPoolVertical"
        component={DrCVPool}
        durationInFrames={POOL_TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
