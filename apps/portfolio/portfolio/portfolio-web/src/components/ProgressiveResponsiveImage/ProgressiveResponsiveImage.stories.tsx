import type { Meta, StoryObj } from "@storybook/react-vite";

import purpleBlackHoleDesktopLowResUrl from "../HeroSection/assets/purple-blackhole-desktop-low-res.jpg";
import purpleBlackHoleDesktopUrl from "../HeroSection/assets/purple-blackhole-desktop.jpg";
import purpleBlackHoleMobileLowResUrl from "../HeroSection/assets/purple-blackhole-mobile-low-res.jpg";
import purpleBlackHoleMobileUrl from "../HeroSection/assets/purple-blackhole-mobile.jpg";
import { ProgressiveResponsiveImage } from "./ProgressiveResponsiveImage";
import type {
  ProgressiveResponsiveImageLoader,
  ProgressiveResponsiveImageSource
} from "./ProgressiveResponsiveImage";

const blackHoleImageSources = [
  {
    media: "(max-width: 720px)",
    lowResSrc: purpleBlackHoleMobileLowResUrl,
    src: purpleBlackHoleMobileUrl
  },
  {
    lowResSrc: purpleBlackHoleDesktopLowResUrl,
    src: purpleBlackHoleDesktopUrl
  }
] satisfies [
  ProgressiveResponsiveImageSource,
  ...ProgressiveResponsiveImageSource[]
];

const slowImageLoader: ProgressiveResponsiveImageLoader = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      window.setTimeout(resolve, 3200);
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    image.src = src;
  });

const meta = {
  title: "Components/ProgressiveResponsiveImage",
  component: ProgressiveResponsiveImage,
  args: {
    alt: "",
    className: "portfolio-progressive-responsive-image-story__image",
    loadImage: slowImageLoader,
    sources: blackHoleImageSources
  },
  argTypes: {
    loadImage: {
      control: false
    },
    sources: {
      control: false
    }
  },
  decorators: [
    (Story) => (
      <div className="portfolio-progressive-responsive-image-story">
        <Story />
      </div>
    )
  ],
  parameters: {
    portfolioPreview: "fullscreen"
  }
} satisfies Meta<typeof ProgressiveResponsiveImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SlowFullResLoad: Story = {};
