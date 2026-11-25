import { Composition } from "remotion";
import "./estilo";
import { linhaDoTempo } from "./dados";
import { FrescoKey } from "./FrescoKey";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FrescoKey"
      component={FrescoKey}
      durationInFrames={linhaDoTempo.totalFrames}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
