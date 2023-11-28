from flask import Flask

app = Flask(__name__)


@app.route('/')
def index_page():
    return "Finally figured out CI/CD !!!!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
