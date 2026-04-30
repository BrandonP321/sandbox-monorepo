import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "../../../lib/cn";
import styles from "./Container.module.scss";

const mediaPositionClasses = {
  top: styles.mediaTop,
  side: styles.mediaSide
} as const;

export type ContainerMediaPosition = keyof typeof mediaPositionClasses;

export type ContainerMedia = {
  content: ReactNode;
  position?: ContainerMediaPosition;
  width?: string | number;
  height?: string | number;
};

export type ContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children?: ReactNode;
  disableContentPaddings?: boolean;
  disableHeaderPaddings?: boolean;
  fitHeight?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  media?: ContainerMedia;
};

function toCssSize(value?: string | number) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export function Container({
  children,
  className,
  disableContentPaddings = false,
  disableHeaderPaddings = false,
  fitHeight = false,
  footer,
  header,
  media,
  ...props
}: ContainerProps) {
  const mediaPosition = media?.position ?? "top";
  const mediaStyle: CSSProperties | undefined = media
    ? {
        inlineSize:
          mediaPosition === "side" ? toCssSize(media.width) : undefined,
        minBlockSize:
          mediaPosition === "top" ? toCssSize(media.height) : undefined
      }
    : undefined;

  const mediaContentStyle: CSSProperties | undefined = media
    ? {
        blockSize: mediaPosition === "top" ? toCssSize(media.height) : undefined
      }
    : undefined;

  const { style, ...restProps } = props;
  const rootStyle: CSSProperties = {
    ...style
  };

  return (
    <div
      className={cn(
        styles.root,
        fitHeight && styles.fitHeight,
        media && mediaPositionClasses[mediaPosition],
        className
      )}
      style={rootStyle}
      {...restProps}
    >
      {media ? (
        <div className={styles.media} style={mediaStyle}>
          <div className={styles.mediaContent} style={mediaContentStyle}>
            {media.content}
          </div>
        </div>
      ) : null}
      <div className={styles.main}>
        {header ? (
          <div
            className={cn(
              styles.header,
              disableHeaderPaddings && styles.headerWithoutPadding
            )}
          >
            {header}
          </div>
        ) : null}
        {children ? (
          <div
            className={cn(
              styles.content,
              disableContentPaddings && styles.contentWithoutPadding
            )}
          >
            {children}
          </div>
        ) : null}
        {footer ? (
          <div
            className={cn(
              styles.footer,
              disableContentPaddings && styles.footerWithoutPadding
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

Container.displayName = "Container";
