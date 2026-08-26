# Wedding Website Asset Inventory

The 39 final Photoshop exports in the runtime asset tree are the authority for
the asset set. They include the user's post-organization corrections to the
sprigs, sparkles, paw prints, and disco-ball selection. Earlier Google Drive
names and variant counts are historical where they differ from this inventory.

All runtime images are transparent PNGs under
`wedding-website-web/src/assets/`. The audit found no exact duplicates or
obvious accidental copies. Image dimensions and sizes below describe the
approved source pixels; no artwork was resized, recompressed, cropped, or
otherwise modified during organization.

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

| Final path under `src/assets/`          | Intended use                                           |    Pixels |      Size | Photoshop optimization                                                                  |
| --------------------------------------- | ------------------------------------------------------ | --------: | --------: | --------------------------------------------------------------------------------------- |
| `photos/landing-photo-framed.png`       | Finished landing photo and illustrated frame composite |   600×750 |   844 KiB | Compression only; keep 600×750 and target about 700 KiB or less if quality is unchanged |
| `textures/cardboard-texture.png`        | Repeating cardboard-texture overlay                    |   600×600 |   199 KiB | No                                                                                      |
| `cats/cat-sitting-facing-away.png`      | Sitting-cat decorative variant                         |   268×434 |   206 KiB | No                                                                                      |
| `cats/cat-sitting-facing-forward.png`   | Sitting-cat decorative variant                         |   288×449 |   223 KiB | No                                                                                      |
| `cats/cat-sitting-head-tilted.png`      | Sitting-cat decorative variant                         |   278×447 |   217 KiB | No                                                                                      |
| `cats/cat-sitting-looking-right.png`    | Sitting-cat decorative variant                         |   277×433 |   214 KiB | No                                                                                      |
| `cats/cat-sitting-looking-left.png`     | Sitting-cat decorative variant                         |   284×450 |   220 KiB | No                                                                                      |
| `cats/cat-sitting-looking-up-right.png` | Sitting-cat decorative variant                         |   278×430 |   204 KiB | No                                                                                      |
| `cats/cat-sitting-paw-raised.png`       | Sitting-cat decorative variant                         |   269×456 |   219 KiB | No                                                                                      |
| `cats/cat-sitting-smiling.png`          | Sitting-cat decorative variant                         |   297×407 |   209 KiB | No                                                                                      |
| `cats/cat-sleeping-01.png`              | Sleeping-cat decorative variant                        | 1254×1254 | 1,239 KiB | Yes; target an 800 px long edge and roughly 250–450 KiB                                 |
| `cats/cat-sleeping-02.png`              | Sleeping-cat decorative variant                        | 1254×1254 |   730 KiB | Yes; target an 800 px long edge and roughly 250–450 KiB                                 |
| `cats/cat-sleeping-03.png`              | Sleeping-cat decorative variant                        | 1254×1254 | 1,272 KiB | Yes; target an 800 px long edge and roughly 250–450 KiB                                 |
| `cats/cat-sleeping-04.png`              | Sleeping-cat decorative variant                        | 1254×1254 | 1,183 KiB | Yes; target an 800 px long edge and roughly 250–450 KiB                                 |
| `florals/floral-cluster-01.png`         | Large floral decorative cluster                        | 1536×1024 | 1,659 KiB | Yes; target a 1000–1200 px long edge and about 600 KiB or less                          |
| `florals/floral-cluster-02.png`         | Large floral decorative cluster                        | 1536×1024 | 1,899 KiB | Yes; target a 1000–1200 px long edge and about 600 KiB or less                          |
| `florals/floral-sprig-01.png`           | Single floral sprig                                    |   283×901 |   179 KiB | No                                                                                      |
| `florals/floral-sprig-02.png`           | Single floral sprig                                    |  571×1043 |   523 KiB | Compression only; target about 350 KiB or less if line quality is unchanged             |
| `florals/floral-sprig-03.png`           | Single floral sprig                                    |   464×806 |   346 KiB | Compression only; target about 300 KiB or less if line quality is unchanged             |
| `florals/floral-sprig-04.png`           | Single floral sprig                                    |   649×864 |   310 KiB | Compression only; target about 250 KiB or less if line quality is unchanged             |
| `florals/floral-vine-divider.png`       | Horizontal floral divider                              |    594×69 |    59 KiB | No                                                                                      |
| `bows/bow-large-01.png`                 | Large ribbon/bow decorative variant                    |   541×459 |   305 KiB | No                                                                                      |
| `bows/bow-large-02.png`                 | Large ribbon/bow decorative variant                    |   465×403 |   292 KiB | No                                                                                      |
| `bows/bow-large-03.png`                 | Large ribbon/bow decorative variant                    |   408×450 |   258 KiB | No                                                                                      |
| `bows/bow-small-01.png`                 | Small bow decorative variant                           |   223×209 |    66 KiB | No                                                                                      |
| `bows/bow-small-02.png`                 | Small bow decorative variant                           |   201×257 |    64 KiB | No                                                                                      |
| `bows/bow-small-03.png`                 | Small bow decorative variant                           |   271×155 |    51 KiB | No                                                                                      |
| `celebration/champagne-glasses-01.png`  | Champagne-glass decorative variant                     |  734×1084 |   434 KiB | Yes; target a 600–800 px long edge and roughly 150–300 KiB                              |
| `celebration/champagne-glasses-02.png`  | Champagne-glass decorative variant                     |  731×1055 |   538 KiB | Yes; target a 600–800 px long edge and roughly 150–300 KiB                              |
| `celebration/champagne-glasses-03.png`  | Champagne-glass decorative variant                     |   903×921 |   628 KiB | Yes; target a 600–800 px long edge and roughly 150–300 KiB                              |
| `celebration/champagne-glasses-04.png`  | Champagne-glass decorative variant                     |  725×1173 |   554 KiB | Yes; target a 600–800 px long edge and roughly 150–300 KiB                              |
| `celebration/disco-ball-01.png`         | Disco-ball decorative variant                          |   670×982 |   443 KiB | Yes; target a 600–800 px long edge and roughly 150–350 KiB                              |
| `celebration/disco-ball-02.png`         | Disco-ball decorative variant                          | 1037×1159 | 1,358 KiB | Yes; target a 600–800 px long edge and roughly 150–350 KiB                              |
| `accents/paw-print-single.png`          | Single paw-print accent                                |   141×137 |    26 KiB | No                                                                                      |
| `accents/paw-print-double.png`          | Two-paw accent group                                   |   235×212 |    41 KiB | No                                                                                      |
| `accents/paw-print-four.png`            | Four-paw accent group                                  |   395×522 |    83 KiB | No                                                                                      |
| `accents/sparkles-01.png`               | Single sparkle accent                                  |   177×234 |    32 KiB | No                                                                                      |
| `accents/sparkles-02.png`               | Sparkle/star accent group                              |   298×351 |    84 KiB | No                                                                                      |
| `accents/sparkles-03.png`               | Sparkle/star accent group                              |   236×369 |    56 KiB | No                                                                                      |

Photoshop optimization should preserve each listed path and transparent PNG
canvas so an optimized export can replace the current file in place. The
suggested pixel and file-size targets are practical browser-use ranges, not
requirements to sacrifice visible line quality.

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
