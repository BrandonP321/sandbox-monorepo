import { weddingImageAssets } from "../../weddingImageAssets";
import { ProgressiveImage } from "./ProgressiveImage";

function FloralCornerDecoration() {
  return (
    <ProgressiveImage
      {...weddingImageAssets.floralCluster}
      alt=""
      className="wedding-corner-floral"
      draggable={false}
    />
  );
}

export { FloralCornerDecoration };
