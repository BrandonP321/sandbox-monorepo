import sparklesPrimary from "./assets/accents/sparkles-01.png";
import sparklesSecondaryPreview from "./assets/accents/sparkles-03-preview.png";
import sparklesSecondary from "./assets/accents/sparkles-03.png";
import registryHeartPreview from "./assets/accents/registry-heart-v1-preview.png";
import registryHeart from "./assets/accents/registry-heart-v1.png";
import smallBowPreview from "./assets/bows/bow-small-01-preview.png";
import smallBow from "./assets/bows/bow-small-01.png";
import registryBowPreview from "./assets/bows/registry-bow-sparkles-v1-preview.png";
import registryBow from "./assets/bows/registry-bow-sparkles-v1.png";
import catSittingPreview from "./assets/cats/cat-sitting-facing-forward-preview.png";
import catSitting from "./assets/cats/cat-sitting-facing-forward.png";
import champagneGlasses from "./assets/celebration/champagne-glasses-01.png";
import discoBallPreview from "./assets/celebration/disco-ball-01-preview.png";
import discoBall from "./assets/celebration/disco-ball-01.png";
import floralClusterPreview from "./assets/florals/floral-cluster-01-preview.png";
import floralCluster from "./assets/florals/floral-cluster-01.png";
import floralSprigPreview from "./assets/florals/floral-sprig-04-preview.png";
import floralSprig from "./assets/florals/floral-sprig-04.png";
import floralVineDivider from "./assets/florals/floral-vine-divider.png";
import registryDividerPreview from "./assets/florals/registry-floral-divider-v1-preview.png";
import registryDivider from "./assets/florals/registry-floral-divider-v1.png";
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
  floralSprig: { previewSrc: floralSprigPreview, src: floralSprig },
  floralVineDivider: { src: floralVineDivider },
  landingPhoto: { previewSrc: landingPhotoPreview, src: landingPhoto },
  registryBow: { previewSrc: registryBowPreview, src: registryBow },
  registryDivider: {
    previewSrc: registryDividerPreview,
    src: registryDivider
  },
  registryHeart: { previewSrc: registryHeartPreview, src: registryHeart },
  sparklesPrimary: { src: sparklesPrimary },
  sparklesSecondary: {
    previewSrc: sparklesSecondaryPreview,
    src: sparklesSecondary
  },
  smallBow: { previewSrc: smallBowPreview, src: smallBow }
} as const satisfies Record<string, WeddingImageAsset>;

export { weddingImageAssets, type WeddingImageAsset };
