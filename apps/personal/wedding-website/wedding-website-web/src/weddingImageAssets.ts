import sparklesPrimary from "./assets/accents/sparkles-01.png";
import sparklesSecondaryPreview from "./assets/accents/sparkles-03-preview.png";
import sparklesSecondary from "./assets/accents/sparkles-03.png";
import catSittingPreview from "./assets/cats/cat-sitting-facing-forward-preview.png";
import catSitting from "./assets/cats/cat-sitting-facing-forward.png";
import champagneGlasses from "./assets/celebration/champagne-glasses-01.png";
import discoBallPreview from "./assets/celebration/disco-ball-01-preview.png";
import discoBall from "./assets/celebration/disco-ball-01.png";
import floralClusterPreview from "./assets/florals/floral-cluster-01-preview.png";
import floralCluster from "./assets/florals/floral-cluster-01.png";
import landingPhotoPreview from "./assets/photos/landing-photo-framed-preview.png";
import landingPhoto from "./assets/photos/landing-photo-framed.png";

type WeddingImageAsset = {
  previewSrc?: string;
  src: string;
};

const weddingImageAssets = {
  catSitting: { previewSrc: catSittingPreview, src: catSitting },
  champagneGlasses: { src: champagneGlasses },
  discoBall: { previewSrc: discoBallPreview, src: discoBall },
  floralCluster: { previewSrc: floralClusterPreview, src: floralCluster },
  landingPhoto: { previewSrc: landingPhotoPreview, src: landingPhoto },
  sparklesPrimary: { src: sparklesPrimary },
  sparklesSecondary: {
    previewSrc: sparklesSecondaryPreview,
    src: sparklesSecondary
  }
} as const satisfies Record<string, WeddingImageAsset>;

export { weddingImageAssets, type WeddingImageAsset };
