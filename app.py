import json
import os
from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, jsonify, request,
    redirect, url_for, session, flash, abort
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-key-change-in-production")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "harcharan2026")

PROFILE = {
    "name": "Harcharan Singh",
    "title": "Graphic Designer & Digital Marketer",
    "subtitle": "Meta Ads Specialist",
    "tagline": "I design the creative and run the numbers behind it.",
    "experience_years": "3+",
    "company": "Seabird Education",
    "location": "Kharar, Punjab",
    "email": "harcharan038@gmail.com",
    "phone": "+91 8699523208",
    "linkedin": "https://linkedin.com/in/harcharan-singh-6839b1276",
    "behance": "",
    "instagram": "",
    "availability": "Open to select freelance & full-time roles",
    "resume_pdf": "/static/files/Harcharan_Singh_Resume.pdf",
    "ad_budget_managed": "\u20b915\u201318L / month",
    "education": "MBA in Digital Marketing & Business Analytics",
    "profile_image": "/static/Portfolio-20260713T112036Z-2-001/Portfolio/media0.jpeg",
}


# ---------------------------------------------------------------------------
# Data access helpers
# ---------------------------------------------------------------------------

def _path(name):
    return os.path.join(DATA_DIR, f"{name}.json")


def load_data(name):
    path = _path(name)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(name, data):
    with open(_path(name), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_projects():
    return load_data("projects")


def get_project_by_slug(slug):
    for p in get_projects():
        if p.get("slug") == slug:
            return p
    return None


def get_categories():
    projects = get_projects()
    cats = sorted({p["category"] for p in projects})
    return cats


def site_stats():
    projects = get_projects()
    experience = load_data("experience")
    clients = load_data("clients")
    return {
        "projects_completed": len(projects),
        "years_experience": PROFILE["experience_years"],
        "brands_worked_with": len(clients),
        "ad_budget_managed": PROFILE["ad_budget_managed"],
    }


@app.context_processor
def inject_globals():
    return {
        "profile": PROFILE,
        "current_year": datetime.now().year,
        "nav_categories": get_categories(),
    }


# ---------------------------------------------------------------------------
# Admin auth helper
# ---------------------------------------------------------------------------

def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    projects = get_projects()
    featured = [p for p in projects if p.get("featured")][:6]
    testimonials = load_data("testimonials")
    clients = load_data("clients")
    return render_template(
        "index.html",
        featured_projects=featured,
        testimonials=testimonials,
        clients=clients,
        stats=site_stats(),
    )


@app.route("/about")
def about():
    experience = load_data("experience")
    skills = load_data("skills")
    return render_template("about.html", experience=experience, skills=skills, stats=site_stats())


@app.route("/portfolio")
def portfolio():
    projects = get_projects()
    category = request.args.get("category", "all")
    q = request.args.get("q", "").strip().lower()

    filtered = projects
    if category and category != "all":
        filtered = [p for p in filtered if p["category"] == category]
    if q:
        filtered = [
            p for p in filtered
            if q in p["title"].lower()
            or q in p["description"].lower()
            or q in p["client"].lower()
            or any(q in t.lower() for t in p.get("tags", []))
        ]

    return render_template(
        "portfolio.html",
        projects=filtered,
        categories=get_categories(),
        active_category=category,
        query=q,
        total=len(projects),
    )


@app.route("/portfolio/<slug>")
def project_detail(slug):
    project = get_project_by_slug(slug)
    if not project:
        abort(404)
    projects = get_projects()
    idx = next((i for i, p in enumerate(projects) if p["slug"] == slug), 0)
    next_project = projects[(idx + 1) % len(projects)]
    related = [
        p for p in projects
        if p["category"] == project["category"] and p["slug"] != slug
    ][:3]
    return render_template(
        "project_detail.html",
        project=project,
        next_project=next_project,
        related=related,
    )


@app.route("/digital-marketing")
def digital_marketing():
    projects = get_projects()
    marketing_categories = {"Advertising Creatives", "Marketing Campaigns", "Website Designs"}
    marketing_projects = [p for p in projects if p["category"] in marketing_categories]
    return render_template(
        "digital_marketing.html",
        projects=marketing_projects,
        stats=site_stats(),
    )


@app.route("/services")
def services():
    services_data = load_data("services")
    return render_template("services.html", services=services_data)


@app.route("/resume")
def resume():
    experience = load_data("experience")
    skills = load_data("skills")
    return render_template("resume.html", experience=experience, skills=skills)


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        message = request.form.get("message", "").strip()
        budget = request.form.get("budget", "").strip()

        if not name or not email or not message:
            flash("Please fill in your name, email, and message.", "error")
            return redirect(url_for("contact"))

        submissions = load_data("submissions") if os.path.exists(_path("submissions")) else []
        submissions.append({
            "name": name,
            "email": email,
            "message": message,
            "budget": budget,
            "received_at": datetime.now().isoformat(timespec="seconds"),
        })
        save_data("submissions", submissions)

        flash("Thanks \u2014 your message is in. I'll reply within a day or two.", "success")
        return redirect(url_for("contact"))

    return render_template("contact.html")


# ---------------------------------------------------------------------------
# JSON API (used by portfolio filter JS + available for external use)
# ---------------------------------------------------------------------------

@app.route("/api/projects")
def api_projects():
    return jsonify(get_projects())


@app.route("/api/projects/<slug>")
def api_project(slug):
    project = get_project_by_slug(slug)
    if not project:
        return jsonify({"error": "not found"}), 404
    return jsonify(project)


# ---------------------------------------------------------------------------
# Admin (simple password-protected dashboard)
# ---------------------------------------------------------------------------

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password", "")
        if password == ADMIN_PASSWORD:
            session["is_admin"] = True
            next_url = request.args.get("next") or url_for("admin_dashboard")
            return redirect(next_url)
        flash("Incorrect password.", "error")
    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return redirect(url_for("admin_login"))


@app.route("/admin")
@admin_required
def admin_dashboard():
    return render_template("admin_dashboard.html", projects=get_projects())


@app.route("/admin/project/add", methods=["POST"])
@admin_required
def admin_add_project():
    projects = get_projects()
    title = request.form.get("title", "").strip()
    if not title:
        flash("Title is required.", "error")
        return redirect(url_for("admin_dashboard"))

    slug = title.lower().replace(" ", "-").replace("/", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    new_id = max([p["id"] for p in projects], default=0) + 1

    project = {
        "id": new_id,
        "slug": slug,
        "title": title,
        "category": request.form.get("category", "Branding"),
        "tags": [t.strip() for t in request.form.get("tags", "").split(",") if t.strip()],
        "description": request.form.get("description", ""),
        "overview": request.form.get("overview", ""),
        "problem": request.form.get("problem", ""),
        "solution": request.form.get("solution", ""),
        "process": request.form.get("process", ""),
        "outcome": request.form.get("outcome", ""),
        "thumbnail": request.form.get("thumbnail") or "/static/images/projects/placeholder.svg",
        "gallery": [request.form.get("thumbnail") or "/static/images/projects/placeholder.svg"],
        "client": request.form.get("client", ""),
        "industry": request.form.get("industry", ""),
        "software": [s.strip() for s in request.form.get("software", "").split(",") if s.strip()],
        "date": request.form.get("date", datetime.now().strftime("%Y-%m")),
        "deliverables": [d.strip() for d in request.form.get("deliverables", "").split(",") if d.strip()],
        "featured": bool(request.form.get("featured")),
        "project_url": request.form.get("project_url", ""),
    }
    projects.append(project)
    save_data("projects", projects)
    flash(f'"{title}" added.', "success")
    return redirect(url_for("admin_dashboard"))


@app.route("/admin/project/delete/<int:project_id>", methods=["POST"])
@admin_required
def admin_delete_project(project_id):
    projects = get_projects()
    projects = [p for p in projects if p["id"] != project_id]
    save_data("projects", projects)
    flash("Project deleted.", "success")
    return redirect(url_for("admin_dashboard"))


@app.route("/admin/project/toggle-featured/<int:project_id>", methods=["POST"])
@admin_required
def admin_toggle_featured(project_id):
    projects = get_projects()
    for p in projects:
        if p["id"] == project_id:
            p["featured"] = not p.get("featured", False)
    save_data("projects", projects)
    return redirect(url_for("admin_dashboard"))


# ---------------------------------------------------------------------------
# SEO
# ---------------------------------------------------------------------------

@app.route("/sitemap.xml")
def sitemap():
    projects = get_projects()
    pages = ["/", "/about", "/portfolio", "/digital-marketing", "/services", "/resume", "/contact"]
    pages += [f"/portfolio/{p['slug']}" for p in projects]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for page in pages:
        xml.append(f"<url><loc>{request.url_root.rstrip('/')}{page}</loc></url>")
    xml.append("</urlset>")
    return "\n".join(xml), 200, {"Content-Type": "application/xml"}


@app.route("/robots.txt")
def robots():
    return (
        "User-agent: *\nAllow: /\nSitemap: " + request.url_root.rstrip("/") + "/sitemap.xml",
        200,
        {"Content-Type": "text/plain"},
    )


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
