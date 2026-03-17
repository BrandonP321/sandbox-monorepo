import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useId,
  useState
} from "react";

import { cn } from "../../../lib/cn";
import {
  AppShellContext,
  type AppShellRegionMode
} from "./AppShellContext";
import styles from "./AppShell.module.scss";

const regionModeClasses = {
  inline: styles.inline,
  overlay: styles.overlay
} as const;

type RegionSurfaceProps = Omit<HTMLAttributes<HTMLElement>, "children">;

type AppShellStyle = CSSProperties & {
  "--app-shell-sidebar-track"?: string;
  "--app-shell-sidebar-width"?: string;
  "--app-shell-aside-track"?: string;
  "--app-shell-aside-width"?: string;
};

export type AppShellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  aside?: ReactNode;
  asideMode?: AppShellRegionMode;
  asideOpen?: boolean;
  asideProps?: RegionSurfaceProps;
  defaultAsideOpen?: boolean;
  defaultSidebarOpen?: boolean;
  asideWidth?: string;
  children: ReactNode;
  mainId?: string;
  mainProps?: Omit<HTMLAttributes<HTMLElement>, "children" | "id">;
  masthead?: ReactNode;
  mastheadProps?: RegionSurfaceProps;
  onAsideOpenChange?: (open: boolean) => void;
  onSidebarOpenChange?: (open: boolean) => void;
  asideId?: string;
  sidebar?: ReactNode;
  sidebarId?: string;
  sidebarMode?: AppShellRegionMode;
  sidebarOpen?: boolean;
  sidebarProps?: RegionSurfaceProps;
  sidebarWidth?: string;
  skipLinkLabel?: string;
};

export function AppShell({
  aside,
  asideId,
  asideMode = "inline",
  asideOpen,
  asideProps,
  defaultAsideOpen,
  defaultSidebarOpen,
  asideWidth = "var(--layout-detail-pane-width)",
  children,
  className,
  mainId,
  mainProps,
  masthead,
  mastheadProps,
  onAsideOpenChange,
  onSidebarOpenChange,
  sidebar,
  sidebarId,
  sidebarMode = "inline",
  sidebarOpen,
  sidebarProps,
  sidebarWidth = "var(--layout-sidebar-width)",
  skipLinkLabel = "Skip to main content",
  style,
  ...props
}: AppShellProps) {
  const generatedId = useId();
  const resolvedMainId = mainId ?? `app-shell-main-${generatedId}`;
  const resolvedSidebarId = sidebarId ?? `app-shell-sidebar-${generatedId}`;
  const resolvedAsideId = asideId ?? `app-shell-aside-${generatedId}`;
  const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] = useState(
    defaultSidebarOpen ?? sidebarMode === "inline"
  );
  const [uncontrolledAsideOpen, setUncontrolledAsideOpen] = useState(
    defaultAsideOpen ?? asideMode === "inline"
  );
  const isSidebarOpen = sidebarOpen ?? uncontrolledSidebarOpen;
  const isAsideOpen = asideOpen ?? uncontrolledAsideOpen;
  const setSidebarOpen = (open: boolean) => {
    if (sidebarOpen === undefined) {
      setUncontrolledSidebarOpen(open);
    }

    onSidebarOpenChange?.(open);
  };
  const setAsideOpen = (open: boolean) => {
    if (asideOpen === undefined) {
      setUncontrolledAsideOpen(open);
    }

    onAsideOpenChange?.(open);
  };
  const renderInlineSidebar = !!sidebar && sidebarMode === "inline" && isSidebarOpen;
  const renderInlineAside = !!aside && asideMode === "inline" && isAsideOpen;
  const bodyStyle: AppShellStyle = {
    "--app-shell-sidebar-track": renderInlineSidebar ? sidebarWidth : "0px",
    "--app-shell-sidebar-width": sidebarWidth,
    "--app-shell-aside-track": renderInlineAside ? asideWidth : "0px",
    "--app-shell-aside-width": asideWidth,
    ...style
  };
  const { className: mainClassName, ...restMainProps } = mainProps ?? {};
  const { className: mastheadClassName, ...restMastheadProps } = mastheadProps ?? {};
  const { className: sidebarClassName, ...restSidebarProps } = sidebarProps ?? {};
  const { className: asideClassName, ...restAsideProps } = asideProps ?? {};

  return (
    <AppShellContext.Provider
      value={{
        asideId: resolvedAsideId,
        asideMode,
        isAsideOpen: !!aside && isAsideOpen,
        isSidebarOpen: !!sidebar && isSidebarOpen,
        setAsideOpen,
        setSidebarOpen,
        sidebarId: resolvedSidebarId,
        sidebarMode,
        toggleAside: () => setAsideOpen(!isAsideOpen),
        toggleSidebar: () => setSidebarOpen(!isSidebarOpen)
      }}
    >
      <div className={cn(styles.root, className)} {...props}>
        <a className={styles.skipLink} href={`#${resolvedMainId}`}>
          {skipLinkLabel}
        </a>
        {masthead ? (
          <header
            className={cn(styles.masthead, mastheadClassName)}
            {...restMastheadProps}
          >
            {masthead}
          </header>
        ) : null}
        <div className={styles.body} style={bodyStyle}>
          {renderInlineSidebar ? (
            <div
              className={cn(
                styles.sidebar,
                styles.inlineRail,
                regionModeClasses[sidebarMode],
                sidebarClassName
              )}
              {...restSidebarProps}
            >
              {sidebar}
            </div>
          ) : null}
          <main
            className={cn(styles.main, mainClassName)}
            id={resolvedMainId}
            tabIndex={-1}
            {...restMainProps}
          >
            {children}
          </main>
          {renderInlineAside ? (
            <div
              className={cn(
                styles.aside,
                styles.inlineRail,
                regionModeClasses[asideMode],
                asideClassName
              )}
              {...restAsideProps}
            >
              {aside}
            </div>
          ) : null}
          {sidebar && sidebarMode === "overlay" ? (
            <div
              aria-hidden={isSidebarOpen ? undefined : true}
              className={cn(
                styles.overlayLayer,
                styles.overlayLeft,
                !isSidebarOpen && styles.overlayHidden
              )}
            >
              <div className={styles.overlayBackdrop} />
              <div
                className={cn(
                  styles.sidebar,
                  regionModeClasses[sidebarMode],
                  styles.overlayPanel,
                  sidebarClassName
                )}
                {...restSidebarProps}
              >
                {sidebar}
              </div>
            </div>
          ) : null}
          {aside && asideMode === "overlay" ? (
            <div
              aria-hidden={isAsideOpen ? undefined : true}
              className={cn(
                styles.overlayLayer,
                styles.overlayRight,
                !isAsideOpen && styles.overlayHidden
              )}
            >
              <div className={styles.overlayBackdrop} />
              <div
                className={cn(
                  styles.aside,
                  regionModeClasses[asideMode],
                  styles.overlayPanel,
                  asideClassName
                )}
                {...restAsideProps}
              >
                {aside}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

AppShell.displayName = "AppShell";
