import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import styles from "./Container.module.scss";
import { Container } from "./Container";

describe("Container", () => {
  it("renders related content with header and footer framing", () => {
    const markup = renderToStaticMarkup(
      <Container footer="Last updated 5 minutes ago" header="Regional briefing">
        <p>Top metrics and commentary.</p>
      </Container>
    );

    expect(markup).toContain("<div");
    expect(markup).toContain(styles.root);
    expect(markup).toContain(styles.header);
    expect(markup).toContain(styles.content);
    expect(markup).toContain(styles.footer);
    expect(markup).toContain("Regional briefing");
    expect(markup).toContain("Last updated 5 minutes ago");
  });

  it("supports media sizing and fit-height", () => {
    const markup = renderToStaticMarkup(
      <Container
        fitHeight
        header="Throughput"
        media={{
          content: <img alt="Port map" src="/port-map.png" />,
          position: "side",
          width: 280
        }}
      >
        <div>Content area</div>
      </Container>
    );

    expect(markup).toContain(styles.fitHeight);
    expect(markup).toContain(styles.mediaSide);
    expect(markup).toContain(styles.media);
    expect(markup).toContain('style="inline-size:280px"');
  });

  it("supports disabling header and content paddings", () => {
    const markup = renderToStaticMarkup(
      <Container
        disableContentPaddings
        disableHeaderPaddings
        header={<div className="custom-header">Toolbar</div>}
        media={{
          content: <img alt="Region" src="/region.png" />,
          height: "12rem"
        }}
      >
        <div className="custom-content">Full-bleed table</div>
      </Container>
    );

    expect(markup).toContain(styles.headerWithoutPadding);
    expect(markup).toContain(styles.contentWithoutPadding);
    expect(markup).toContain(styles.mediaTop);
    expect(markup).toContain('style="min-block-size:12rem"');
  });
});
