# Harcharan Singh  Portfolio Website

A dynamic Flask portfolio site for a Graphic Designer & Digital Marketer (Meta Ads Specialist).
Content lives in JSON files, not in the HTML, so you can add projects, skills, and testimonials
without touching a template.

## Run it locally

```bash
cd portfolio
pip install -r requirements.txt
python app.py
```

Visit `http://127.0.0.1:5000`.

## Structure

```
portfolio/
├── app.py                  # All Flask routes
├── data/                   # Everything editable lives here
│   ├── projects.json       # Portfolio projects (title, category, gallery, case study text...)
│   ├── skills.json
│   ├── services.json
│   ├── experience.json
│   ├── testimonials.json
│   └── clients.json
├── templates/               # Jinja2 templates (one per page)
├── static/
│   ├── css/style.css       # Full design system (dark theme, tokens at the top)
│   ├── js/main.js          # Cursor, reveal animations, filters, lightbox, carousel
│   ├── images/projects/    # Placeholder SVG thumbnails \u2014 replace with real project shots
│   └── files/               # Put your real resume PDF here as
│                             #   Harcharan_Singh_Resume.pdf
```

## Adding real projects

The placeholder images in `static/images/projects/` are generated SVG stand-ins so the site
has something to show immediately. To swap in real work:

1. Drop your images into `static/images/uploads/` (create the folder) or `static/images/projects/`.
2. Edit `data/projects.json` and point `thumbnail` / `gallery` at the new file paths.
3. Or use the built-in admin at `/admin` (default password: `harcharan2026` \u2014
   **change `ADMIN_PASSWORD` in `app.py` or set it as an environment variable before deploying**).

Each project entry supports: title, category, tags, description, overview, problem, solution,
process, outcome, thumbnail, gallery (list), client, industry, software (list), date,
deliverables (list), featured (bool), project_url.

## Media placeholders (media1 \u2014 media15)

Every image on the site now points at `static/images/media/mediaN.jpg`. Nothing is generated for
these \u2014 drop your real files in with these **exact names** and they'll appear automatically
(there's a graceful fallback to a placeholder tile if a file is missing, so nothing looks broken
in the meantime). Recommended size: at least 1200\u00d7900 for photos, 640\u00d7760 for the portrait.

| File | Used for |
|---|---|
| `media1.jpg` | PracticePanel \u2014 main thumbnail |
| `media13.jpg` | PracticePanel \u2014 second gallery image |
| `media2.jpg` | Telecast: The Tawi Tales \u2014 thumbnail |
| `media3.jpg` | MedSimplified \u2014 thumbnail |
| `media4.jpg` | LifeMechanical \u2014 thumbnail |
| `media5.jpg` | Trade Academy \u2014 main thumbnail |
| `media14.jpg` | Trade Academy \u2014 second gallery image |
| `media6.jpg` | VectorGlobe \u2014 thumbnail |
| `media7.jpg` | Seabird Education (Lead Gen Creatives) \u2014 main thumbnail |
| `media15.jpg` | Seabird Education (Lead Gen Creatives) \u2014 second gallery image |
| `media8.jpg` | GreenAppleActive \u2014 thumbnail |
| `media9.jpg` | Seabird Education (Landing Page) \u2014 thumbnail |
| `media10.jpg` | CBPA \u2014 thumbnail |
| `media11.jpg` | Your portrait photo, used in the About page frame |
| `media12.jpg` | Poster/cover image for the Showreel video on the home page |

All 15 files live in **`static/images/media/`**. Just save your photos there using these exact
filenames (e.g. `media1.jpg`) and refresh the page.

If you want to add more images to a project's gallery beyond what's mapped above, edit that
project's `"gallery"` array in `data/projects.json` and add more paths (they don't have to be
named `mediaN` \u2014 that's just the placeholder scheme this build ships with).

### Video

The home page now has a Showreel section that plays a real video file. Put your show-reel /
ad-cutdown video at:

```
static/videos/showreel.mp4
```

The poster image shown before playback is `media12.jpg` (see table above).

## Connecting your real Google Drive assets

This build ships with ten sample projects seeded from your resume so every page has real
content to preview. There's no live Google Drive connector wired in (that needs OAuth
credentials this environment doesn't have access to) \u2014 the fastest path is:

1. Download the images/videos you want to feature from Drive.
2. Drop them into `static/images/projects/` (or a new subfolder).
3. Add/edit entries in `data/projects.json`, or use `/admin` to add new projects through a form.

If you'd like, a next step could be a small script that reads a local folder of exported Drive
images and auto-generates `projects.json` entries from the filenames \u2014 say the word and it can
be added.

## Pages

`/` `/about` `/portfolio` `/portfolio/<slug>` `/digital-marketing` `/services` `/resume`
`/contact` `/admin` (password protected) `/api/projects` (JSON) `/sitemap.xml`

## Before going live

- Replace `static/files/Harcharan_Singh_Resume.pdf` with your real resume PDF.
- Replace placeholder SVG thumbnails with real project images.
- Set a real `SECRET_KEY` and `ADMIN_PASSWORD` as environment variables.
- Swap the development server (`python app.py`) for a production WSGI server (e.g. gunicorn)
  when deploying.
