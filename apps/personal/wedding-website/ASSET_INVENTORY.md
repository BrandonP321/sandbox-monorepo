# Wedding Website Asset Inventory

The 39 full-resolution Photoshop exports in the runtime asset tree are the
authority for the asset set. They include the user's post-organization
corrections to the sprigs, sparkles, paw prints, and disco-ball selection.
Earlier Google Drive names and variant counts are historical where they differ
from this inventory.

All runtime images are PNGs under `wedding-website-web/src/assets/`. The
full-resolution dimensions reflect the current browser-sized exports. Thirty
larger images also have a smaller initial-render companion whose filename adds
`-preview` immediately before `.png`; the progressive-image component swaps
from that companion only after the full image has loaded and decoded. Images
without a preview companion render directly through the same component.

## Design references

These remain reference-only in Google Drive and must not be imported into the
production bundle:

- [RSVP Front](https://drive.google.com/file/d/1pSBc2H3KiV7CRiq38AT1v51zp9xtSQh3/view)
  and
  [RSVP back](https://drive.google.com/file/d/1JMEa5_JLsh3OWp23zuWO4f7UHslNf3I3/view)
  control illustration style.
- [Refined RSVP flow](https://drive.google.com/file/d/15X7nVQ-XiP9Cy2mPDaZS2G2vtXDI1bQ0/view)
  controls layout and composition only.

## Runtime inventory

### Fonts

- `fonts/lovers-in-new-york-regular.woff2` and
  `fonts/lovers-in-new-york-bold.woff2` are the production web formats extracted
  from the supplied `LoversinNewYork.zip`; the duplicate WOFF, TTF, and OTF
  formats are not shipped.
- Lora's 400 and 700 Latin web fonts are bundled from the pinned
  `@fontsource/lora` dependency.

### Images

| Full-resolution path under `src/assets/` | Intended use                                           | Full pixels | Full size | Preview companion pixels and size |
| ---------------------------------------- | ------------------------------------------------------ | ----------: | --------: | --------------------------------: |
| `photos/landing-photo-framed.png`        | Finished landing photo and illustrated frame composite |     600×750 |   844 KiB |                   100×125, 35 KiB |
| `textures/cardboard-texture.png`         | Repeating cardboard-texture overlay                    |     600×600 |   199 KiB |                                 — |
| `cats/cat-sitting-facing-away.png`       | Sitting-cat decorative variant                         |     268×434 |   206 KiB |                   100×162, 32 KiB |
| `cats/cat-sitting-facing-forward.png`    | Sitting-cat decorative variant                         |     288×449 |   223 KiB |                   100×156, 32 KiB |
| `cats/cat-sitting-head-tilted.png`       | Sitting-cat decorative variant                         |     278×447 |   217 KiB |                   100×161, 33 KiB |
| `cats/cat-sitting-looking-right.png`     | Sitting-cat decorative variant                         |     277×433 |   214 KiB |                   100×156, 33 KiB |
| `cats/cat-sitting-looking-left.png`      | Sitting-cat decorative variant                         |     284×450 |   220 KiB |                   100×158, 31 KiB |
| `cats/cat-sitting-looking-up-right.png`  | Sitting-cat decorative variant                         |     278×430 |   204 KiB |                   100×155, 32 KiB |
| `cats/cat-sitting-paw-raised.png`        | Sitting-cat decorative variant                         |     269×456 |   219 KiB |                   100×169, 35 KiB |
| `cats/cat-sitting-smiling.png`           | Sitting-cat decorative variant                         |     297×407 |   209 KiB |                   100×137, 31 KiB |
| `cats/cat-sleeping-01.png`               | Sleeping-cat decorative variant                        |     500×500 |   263 KiB |                      50×50, 7 KiB |
| `cats/cat-sleeping-02.png`               | Sleeping-cat decorative variant                        |     500×500 |   160 KiB |                   100×100, 12 KiB |
| `cats/cat-sleeping-03.png`               | Sleeping-cat decorative variant                        |     500×500 |   273 KiB |                   100×100, 18 KiB |
| `cats/cat-sleeping-04.png`               | Sleeping-cat decorative variant                        |     500×500 |   246 KiB |                   100×100, 16 KiB |
| `florals/floral-cluster-01.png`          | Large floral decorative cluster                        |     800×533 |   368 KiB |                    100×67, 16 KiB |
| `florals/floral-cluster-02.png`          | Large floral decorative cluster                        |     800×533 |   438 KiB |                    100×67, 18 KiB |
| `florals/floral-sprig-01.png`            | Single floral sprig                                    |     300×955 |   230 KiB |                   100×318, 38 KiB |
| `florals/floral-sprig-02.png`            | Single floral sprig                                    |     300×548 |   156 KiB |                   100×183, 26 KiB |
| `florals/floral-sprig-03.png`            | Single floral sprig                                    |     300×521 |   172 KiB |                   100×174, 28 KiB |
| `florals/floral-sprig-04.png`            | Single floral sprig                                    |     300×399 |    98 KiB |                   100×133, 18 KiB |
| `florals/floral-vine-divider.png`        | Horizontal floral divider                              |      594×69 |    59 KiB |                                 — |
| `bows/bow-large-01.png`                  | Large ribbon/bow decorative variant                    |     500×424 |   161 KiB |                      50×42, 8 KiB |
| `bows/bow-large-02.png`                  | Large ribbon/bow decorative variant                    |     465×403 |   292 KiB |                      50×43, 8 KiB |
| `bows/bow-large-03.png`                  | Large ribbon/bow decorative variant                    |     408×450 |   258 KiB |                      50×55, 9 KiB |
| `bows/bow-small-01.png`                  | Small bow decorative variant                           |     223×209 |    66 KiB |                      50×47, 7 KiB |
| `bows/bow-small-02.png`                  | Small bow decorative variant                           |     201×257 |    64 KiB |                      50×64, 8 KiB |
| `bows/bow-small-03.png`                  | Small bow decorative variant                           |     271×155 |    51 KiB |                      50×29, 5 KiB |
| `celebration/champagne-glasses-01.png`   | Champagne-glass decorative variant                     |     300×443 |   109 KiB |                                 — |
| `celebration/champagne-glasses-02.png`   | Champagne-glass decorative variant                     |     300×433 |   132 KiB |                                 — |
| `celebration/champagne-glasses-03.png`   | Champagne-glass decorative variant                     |     300×306 |   110 KiB |                                 — |
| `celebration/champagne-glasses-04.png`   | Champagne-glass decorative variant                     |     200×324 |    73 KiB |                                 — |
| `celebration/disco-ball-01.png`          | Disco-ball decorative variant                          |     500×733 |   288 KiB |                   100×147, 21 KiB |
| `celebration/disco-ball-02.png`          | Disco-ball decorative variant                          |     500×559 |   375 KiB |                   100×112, 25 KiB |
| `accents/paw-print-single.png`           | Single paw-print accent                                |     141×137 |    26 KiB |                                 — |
| `accents/paw-print-double.png`           | Two-paw accent group                                   |     235×212 |    41 KiB |                                 — |
| `accents/paw-print-four.png`             | Four-paw accent group                                  |     395×522 |    83 KiB |                      50×66, 7 KiB |
| `accents/sparkles-01.png`                | Single sparkle accent                                  |     177×234 |    32 KiB |                                 — |
| `accents/sparkles-02.png`                | Sparkle/star accent group                              |     298×351 |    84 KiB |                      50×59, 9 KiB |
| `accents/sparkles-03.png`                | Sparkle/star accent group                              |     236×369 |    56 KiB |                      50×78, 9 KiB |

Future optimized exports should preserve each listed full-resolution path and
transparent canvas. Add or replace a preview using the same path with
`-preview` before `.png`; then add that companion to `weddingImageAssets.ts` for
any asset currently rendered by the app.

## Original-to-final move map

| Original filename                                | Final path or disposition               |
| ------------------------------------------------ | --------------------------------------- |
| `website_asset_main_img.png`                     | `photos/landing-photo-framed.png`       |
| `cardboard-texture.png`                          | `textures/cardboard-texture.png`        |
| `website_asset_cat_sitting_backward.png`         | `cats/cat-sitting-facing-away.png`      |
| `website_asset_cat_sitting_forward.png`          | `cats/cat-sitting-facing-forward.png`   |
| `website_asset_cat_sitting_head_angled.png`      | `cats/cat-sitting-head-tilted.png`      |
| `website_asset_cat_sitting_look_right.png`       | `cats/cat-sitting-looking-right.png`    |
| `website_asset_cat_sitting_looking_left.png`     | `cats/cat-sitting-looking-left.png`     |
| `website_asset_cat_sitting_looking_up_right.png` | `cats/cat-sitting-looking-up-right.png` |
| `website_asset_cat_sitting_paw_raised.png`       | `cats/cat-sitting-paw-raised.png`       |
| `website_asset_cat_sitting_smile.png`            | `cats/cat-sitting-smiling.png`          |
| `website_asset_cat_sleeping_1.png`               | `cats/cat-sleeping-01.png`              |
| `website_asset_cat_sleeping_2.png`               | `cats/cat-sleeping-02.png`              |
| `website_asset_cat_sleeping_3.png`               | `cats/cat-sleeping-03.png`              |
| `website_asset_cat_sleeping_4.png`               | `cats/cat-sleeping-04.png`              |
| `website_asset_floral_cluster_1.png`             | `florals/floral-cluster-01.png`         |
| `website_asset_floral_cluster_2.png`             | `florals/floral-cluster-02.png`         |
| `website_asset_floral_sprig_1.png`               | `florals/floral-sprig-01.png`           |
| `website_asset_floral_sprig_2.png`               | `florals/floral-sprig-02.png`           |
| `website_asset_floral_sprig_3.png`               | `florals/floral-sprig-03.png`           |
| `website_asset_floral_sprig_4.png`               | `florals/floral-sprig-04.png`           |
| `website_asset_floral_vine_divider.png`          | `florals/floral-vine-divider.png`       |
| `website_asset_bow_large_1.png`                  | `bows/bow-large-01.png`                 |
| `website_asset_bow_large_2.png`                  | `bows/bow-large-02.png`                 |
| `website_asset_bow_large_3.png`                  | `bows/bow-large-03.png`                 |
| `website_asset_bow_small_1.png`                  | `bows/bow-small-01.png`                 |
| `website_asset_bow_small_2.png`                  | `bows/bow-small-02.png`                 |
| `website_asset_bow_small_3.png`                  | `bows/bow-small-03.png`                 |
| `website_asset_champagne_glass_1.png`            | `celebration/champagne-glasses-01.png`  |
| `website_asset_champagne_glass_2.png`            | `celebration/champagne-glasses-02.png`  |
| `website_asset_champagne_glass_3.png`            | `celebration/champagne-glasses-03.png`  |
| `website_asset_champagne_glass_4.png`            | `celebration/champagne-glasses-04.png`  |
| `website_asset_disco_ball_1.png`                 | Removed after visual review             |
| `website_asset_disco_ball_2.png`                 | `celebration/disco-ball-01.png`         |
| `website_asset_disco_ball_3.png`                 | `celebration/disco-ball-02.png`         |
| `website_asset_paw_print_1.png`                  | `accents/paw-print-single.png`          |
| `website_asset_paw_print_2.png`                  | `accents/paw-print-double.png`          |
| `website_asset_paw_print_3.png`                  | `accents/paw-print-four.png`            |
| `website_asset_sparkles_1.png`                   | `accents/sparkles-01.png`               |
| `website_asset_sparkles_2.png`                   | `accents/sparkles-02.png`               |
| `website_asset_sparkles_3.png`                   | `accents/sparkles-03.png`               |
