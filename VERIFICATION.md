# Verification

Last validated on 2026-11-08, after the screenshot integration.

## Commands

- `npm test`: 7 tests passed. They cover routes, real screenshots for every project (desktop primary and supporting screens), WebP dimensions matching the declared sizes, manifest/project agreement with originals present, native and mobile-web labelling, AI attribution, and camera progression.
- `npm run typecheck`: passed.
- `npm run build`: passed using Next.js Webpack. The homepage and five case studies were prerendered.

## Layout (production build, headless Chromium via Playwright)

- `/` and all five `/work/*` pages were checked at 390, 768, 1440 and 1920 px wide. Every screenshot loaded, and each rendered aspect ratio matched its file within 0.02. There was no horizontal overflow and no console errors.
- The only aspect mismatch was the hero portrait, which is a `fill`/cover image by design.
- Desktop captures render full width. Phone captures render 264 px wide in a framed row, or 149 px in two columns at 390 px, and open full size in a new tab.
- Full-page renders of the Forge case study (1440) and LaundroGo (390) were inspected visually.

## 3D studio (headless Chromium with SwiftShader WebGL, 1440×900)

- The world mounted. Chapter links 01–05 each moved to their room and set the current marker.
- All 10 primary and supporting textures loaded with HTTP 200. Room renders for The Forge and LJ Vet were inspected visually. Frames now hug each texture's real aspect ratio.
- Opening the LJ Vet case study and choosing "Return to studio" restored the scroll position (4853 → 4853) and focus (`#link-lj-vet`).
- "View without 3D" removed the canvas and saved the preference across a reload. "Explore in 3D" restored the world.
- With WebGL disabled (`--disable-webgl --disable-3d-apis`) and with reduced motion, no canvas mounted and the HTML view with screenshots was shown.
- Frame rate: about 6–13 rAF frames/s while scrolling under headless software rendering. This does not represent real hardware, and no 60 FPS result is claimed.
- **Low-FPS fallback bug found and fixed** (`components/World.tsx`). Before the fix, 12 seconds of wheel-scrolling at about 7 fps never left 3D, for two reasons:
  - The scene counted as "moving" for only 120 ms after each scroll update. At low frame rates the next frame landed after that window, which reset the slow-time counter.
  - Any frame longer than 0.5 s also reset the counter.
  
  Now only a real pause (500 ms past the movement window) resets the count, and very long frames are skipped. With the fix, the same test switched to the lightweight view and announced "Switched to the lightweight studio to keep scrolling smooth." Chapter jumps, the case-study round trip and the toggle were re-checked afterwards and still pass. Real-hardware behaviour, including making sure fast devices don't fall back by mistake, still needs a device check.

## Hero (2026-11-08, follow-up)

- **Blur.** The CSS was enlarging the 1672×941 portrait by 8–12% and shifting it, and Next re-compressed it at quality 75. Now the photo's box starts 18% from the left (30% on tablets) and is never scaled, the area behind the left fade is the same red, and the original JPEG is served unoptimized. Rendered widths are 1181 px at 1440, 1574 px at 1920 and 538 px at 768. At 1920×1080 the image still has to stretch about 15% to cover the height, and only a higher-resolution photo can remove that.
- **Centered hero and entrance (second pass).** The photo is now centered and full-bleed on every desktop width.
  - In 3D the scene draws the same photo as a plane sized to cover the first camera view (z=8, fov 52). Once the world is ready the HTML photo hides, and the two match at scroll 0.
  - The entrance camera pulls straight back along the center line, so the photo only shrinks. The photo fades out over 15–60% of the entrance, before the first room.
  - The corridor floor now starts behind the photo instead of cutting across its bottom.
- **Text placement.**
  - At 1200 px and wider, the headline sits beside the face and is sized to clear the sunglasses: `clamp(52px, 4.3vw, 82px)`.
  - From 768 to 1199 px the text sits below the face over a bottom shade, like the phone layout. On screens 860 px tall or shorter it starts higher so the buttons clear "Scroll to enter".
- Renders checked: 900×800, 1024×768, 1280×800, 1440×900 and 1920×1080 at scroll 0. The 1440 entrance was checked at 0, 30, 60, 90 and 120% of a screen height, and the 3D view at scroll 0 matched the HTML-only render. Tests, typecheck, build, and the layout and 3D checks pass.

## Dev server

- `npm run dev` (`next dev --hostname 127.0.0.1`) was opened at both `127.0.0.1` and `localhost`. The page hydrated, the 3D world mounted, the case study rendered its images, and no requests failed.

## Screenshot capture checks

- New captures: 7 Forge (4 desktop, 3 native Android) and 5 LJ Vet (3 desktop, 2 native Android). Each was reviewed visually before use. The Forge draft review was recaptured after its "Draft ready" toast closed.
- All 16 reused images were reviewed on contact sheets, and their alt text was written to match what is visible.
- LJ Vet's 3D primary is the populated Pets & Clients register. The admin dashboard moved into the gallery because the demo seed has no paid bills, so its sales figures are ₱0.00.
- The reused LaundroGo owner dashboard had the demo account's "You are using the default password" banner. It was removed from the image (the page content below it was moved up); nothing else in the screenshot was changed.
- Browser captures blocked every non-loopback request. Both source servers ran with a process-level network guard, and no outside request was recorded.
- `git status` in The Forge PH 2.0 and LJ Veterinary Clinic Management System matched the pre-capture state. No source, schema or seed was changed, and no database was reset, migrated or seeded.

## Not done

- Safari, Firefox and physical-device performance testing.
- A full JavaScript-disabled browser walkthrough (server-rendered HTML was confirmed by the build and HTTP).
- The in-app browser pane was hidden during this run, so interactive checks used headless Chromium instead.
