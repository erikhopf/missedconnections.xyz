# Missed Connections

The website for *Missed Connections*, a radio show on Freeform Portland. A single static page with no framework — just HTML, CSS, and a sprinkle of JavaScript. Episodes are managed in a YAML file and built into JSON.

## Project layout

```
index.html             The page
css/site.css           All styles
js/main.js             Menu, marquee, player toggle, episode rendering
data/episodes.yaml     ← edit this to add episodes
data/episodes.json     generated — do not edit
data/episodes.js       generated — do not edit
scripts/build-episodes.mjs   YAML → JSON build script
favicon/               icons and webmanifest
```

## Adding or editing episodes

1. Open `data/episodes.yaml`.
2. Add a new entry at the top (newest first). Each episode looks like this:

   ```yaml
   - ep: "22"
     date: "May 16, 2026"
     title: "feat. Some Guest"
     description: >-
       Two or three sentences about the episode. HTML is allowed if you want
       <em>emphasis</em> or a <a href="...">link</a>.
     tags:
       - Guest
       - Experimental
     url: "https://www.mixcloud.com/MissedConnectionsPDX/..."
   ```

3. Run the build:

   ```
   npm run build
   ```

4. Reload `index.html` to see the change. Commit and deploy.

### Field reference

| Field         | Required | Notes                                                                |
|---------------|----------|----------------------------------------------------------------------|
| `ep`          | yes      | Episode number, as a string (`"21"`)                                 |
| `date`        | yes      | Human-readable air date                                              |
| `title`       | yes      | Episode title                                                        |
| `description` | yes      | One paragraph. Inline HTML allowed                                   |
| `tags`        | no       | List of strings. Rendered as pills under the title                   |
| `url`         | yes      | Mixcloud (or other) link to listen                                   |

## Setup

You only need Node installed. Then once:

```
npm install
```

That pulls in `js-yaml`, the only dependency, used by the build script.

## Building

```
npm run build
```

This reads `data/episodes.yaml` and writes:

- `data/episodes.json` — the canonical data file
- `data/episodes.js` — a wrapper that assigns the episodes to `window.__MC_EPISODES__`, which `index.html` loads via a `<script>` tag

The site reads from `episodes.js` at page load. **You must rebuild after editing the YAML, or the site will keep showing old data.**

## Local preview

The page is fully static and loads everything via relative paths. To preview:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Any static file server will work — the project has no build step beyond the episode generator.

## Editing styles or scripts

- **Styles:** `css/site.css`. Plain CSS, no preprocessor. The marker-highlight effect on "Missed" and inline `<em>` tags is built with an inline SVG filter defined in `index.html` (`<filter id="marker-rough">`).
- **JavaScript:** `js/main.js`. Handles the nav menu, the scrolling marquee, the Mixcloud player toggle on the hero, and rendering the episode grid from `window.__MC_EPISODES__`.

## Deploying

The site is static — `index.html`, `css/`, `js/`, `data/`, and `favicon/` are everything the browser needs. Upload that set to any static host.

`node_modules/`, `scripts/`, `package.json`, `package-lock.json`, and the source `episodes.yaml` are not needed at runtime (the site reads `episodes.js`, which is built from the YAML), but it's fine to deploy them too.
