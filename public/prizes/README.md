# Prize Images

Drop product photos into this folder. Filenames must match the prize `id` defined in
`src/data/constants.js`. PNG with transparent background recommended; square crop, around 400×400 to 800×800.

| File              | Prize                          |
| ----------------- | ------------------------------ |
| `toiletry.png`    | Waterproof Toiletry Bag        |
| `toothpaste.png`  | Konnyaku Toothpaste            |
| `toothbrush.png`  | Organic Bamboo Toothbrush      |
| `laundry.png`     | Eco Fabric Laundry Mousse      |
| `mist.png`        | Antibacterial Garment Mist     |
| `towel.png`       | SHIZUKU Osaka Towel            |
| `socks.png`       | 10th Anniversary Socks         |

If a file is missing, the wheel automatically falls back to the emoji.

To use a different filename or format (e.g. `toothpaste.webp`), update the
`PRIZE_IMG('...')` reference in `src/data/constants.js`.
