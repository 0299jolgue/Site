import os
from functools import wraps

from flask import Flask, jsonify, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me-in-production")

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

HOST = os.getenv("HOST", "0.0.0.0")
# Shard/proxies may inject PORT. Keep 80 as the fallback required by this project.
try:
    PORT = int(os.getenv("PORT", "80"))
except (TypeError, ValueError):
    PORT = 80

if not 1 <= PORT <= 65535:
    PORT = 80

VERSION = "v3"


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("authenticated"):
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


@app.get("/login")
def login():
    if session.get("authenticated"):
        return redirect(url_for("studio"))
    return render_template("login.html")


@app.post("/login")
def login_submit():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")
    if username == ADMIN_USER and password == ADMIN_PASSWORD:
        session["authenticated"] = True
        session["username"] = username
        return redirect(url_for("studio"))
    return render_template("login.html", error="Credenciais inválidas."), 401


@app.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.get("/")
@login_required
def studio():
    return render_template("index.html", username=session.get("username", "admin"), version=VERSION)


@app.post("/api/render-plan")
@login_required
def render_plan():
    data = request.get_json(silent=True) or {}

    try:
        start = max(0, min(int(data.get("start", 500)), 99999))
        end = max(0, min(int(data.get("end", 575)), 99999))
    except (TypeError, ValueError):
        return jsonify({"error": "Os pontos inicial/final têm de ser números."}), 400

    brawler = str(data.get("brawler", "Brawler"))[:32]
    mode = str(data.get("mode", "Troféus"))[:32]
    template = str(data.get("template", "match-end"))[:32]

    return jsonify({
        "ok": True,
        "version": VERSION,
        "plan": {
            "brawler": brawler,
            "mode": mode,
            "template": template,
            "start": start,
            "end": end,
            "delta": end - start,
            "resolution": "1080x1920",
            "composition": "static-match-end",
            "export_formats": ["png", "webm"],
            "source": "browser-canvas",
        },
    })


@app.get("/health")
def health():
    return jsonify({"status": "ok", "version": VERSION, "port": PORT})


if __name__ == "__main__":
    # Local/default mode uses port 80; hosted environments can inject PORT.
    app.run(host=HOST, port=PORT, debug=False)
