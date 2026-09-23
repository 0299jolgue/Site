import os
from functools import wraps

from flask import Flask, jsonify, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me-in-production")

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = 80
VERSION = "v2"


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
    # Deploy requirement: this app intentionally listens on port 80, not 8080.
    app.run(host=HOST, port=PORT, debug=False)
