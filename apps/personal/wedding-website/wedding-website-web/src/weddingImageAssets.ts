import sparklesPrimary from "./assets/accents/sparkles-01.png";
import sparklesSecondaryPreview from "./assets/accents/sparkles-03-preview.png";
import sparklesSecondary from "./assets/accents/sparkles-03.png";
import bowSmallPreview from "./assets/bows/bow-small-01-preview.png";
import bowSmall from "./assets/bows/bow-small-01.png";
import catSittingPreview from "./assets/cats/cat-sitting-facing-forward-preview.png";
import catSitting from "./assets/cats/cat-sitting-facing-forward.png";
import champagneGlasses from "./assets/celebration/champagne-glasses-01.png";
import discoBallPreview from "./assets/celebration/disco-ball-01-preview.png";
import discoBall from "./assets/celebration/disco-ball-01.png";
import floralClusterPreview from "./assets/florals/floral-cluster-01-preview.png";
import floralCluster from "./assets/florals/floral-cluster-01.png";
import floralSprigPreview from "./assets/florals/floral-sprig-01-preview.png";
import floralSprig from "./assets/florals/floral-sprig-01.png";
import floralVine from "./assets/florals/floral-vine-divider.png";
import landingPhotoPreview from "./assets/photos/landing-photo-framed-preview.png";
import landingPhoto from "./assets/photos/landing-photo-framed.png";

type WeddingImageAsset = {
  previewSrc?: string;
  src: string;
};

const weddingImageAssets = {
  bowSmall: { previewSrc: bowSmallPreview, src: bowSmall },
  catSitting: { previewSrc: catSittingPreview, src: catSitting },
  champagneGlasses: { src: champagneGlasses },
  discoBall: { previewSrc: discoBallPreview, src: discoBall },
  floralCluster: { previewSrc: floralClusterPreview, src: floralCluster },
  floralSprig: { previewSrc: floralSprigPreview, src: floralSprig },
  floralVine: { src: floralVine },
  landingPhoto: { previewSrc: landingPhotoPreview, src: landingPhoto },
  sparklesPrimary: { src: sparklesPrimary },
  sparklesSecondary: {
    previewSrc: sparklesSecondaryPreview,
    src: sparklesSecondary
  }
} as const satisfies Record<string, WeddingImageAsset>;

export { weddingImageAssets, type WeddingImageAsset };
