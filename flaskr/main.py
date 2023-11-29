from flask import Flask, render_template, Response
from json import dumps

app = Flask(__name__)

lyceum_buildings = [
    {"coordinates": [55.752318, 37.637371], "name": "Лицей на Солянке"},
    {"coordinates": [55.753164, 37.648106], "name": "Вышка на Покре"},
    {"coordinates": [55.760825, 37.652278], "name": "Лицей на Ляле"},
    {"coordinates": [55.763528, 37.643714], "name": "Лицей на БХ"},
    {"coordinates": [55.769390, 37.618911], "name": "Лицей на Колобке"},
]

posts_dict = [
    {
        "name": "whaat",
        "id": 412,
        "author": "kekus",
        "place_name": "Даблби",
        "body_text": """
            Продолжаем нашу рубрику " Кофе брейк", и наше следующее заведение - Даблби.☕️
            Даблби - международная сеть кофеен🌍 и является самой титулованной в России. В ее составе многократные чемпионы России по приготовлению кофе, сертифицированные специалисты и тренеры, а также вице-чемпион мира по обжарке кофе, финалист мирового чемпионата по завариванию кофе🏆. Сейчас в сети более 60 кофеен.
            
            В меню мы видим множество видов кофе, но если вы предпочитаете чай, то для вас тоже что-то найдется.☺️🍵
            
            Сейчас проходит акция осенне-зимних напитков🍂❄️, где представлены очень интересные вкусы и вариации повседневных видов кофе и чая. К примеру, латте "Цветущая вишня" звучит очень-очень вкусно.🍒
            
            Помимо напитков, в меню присутствуют и различные блюда: салаты на любой вкус🥗, различная выпечка🥧 и многое другое! Всё это есть в Даблби.
            
            Самые ближайшие кофейни к зданиям лицея:
            📍Солянский переулок, 1 (м. Китай город)
            📍Цветной бульвар, 1 (м. Цветной бульвар)
            📍Милютинский переулок, 3 (м. Чистые пруды)
        """
    },
    {
        "name": "whaat",
        "id": 412,
        "author": "kekus",
    }

]

for i in posts_dict:
    if "body_text" in i:
        i["body_text"] = i["body_text"].replace("\n", "<br>")

reviews = [
    {"id": 1, "name": "Max", "rating": 3, "text": "a great place, bad food"},
    {"id": 0, "name": "Ivan", "rating": 5, "text": "impressive, very nice"},
    {"id": 1, "name": "Keril", "rating": 1, "text": "my friend died here"}
]

diners = [
    {"id": 0, "name": "Cofix", "position": [55.754005, 37.636823], "reviewed": True},
    {"id": 1, "name": "Даблби", "position": [55.712390, 37.618911], "reviewed": False},
]


@app.route('/')
def index_page():
    return render_template("index.html")


@app.route('/map')
def map_page():
    return render_template("map.html")


@app.route('/blog')
def blog_page():
    return render_template("blog.html", posts=posts_dict)


@app.route("/diners")
def get_diners():
    return Response(dumps(diners, default=str), 200, mimetype='application/json')


@app.route("/lyceum_buildings")
def get_lyceum_buildings():
    return Response(dumps(lyceum_buildings, default=str), 200, mimetype='application/json')


@app.get("/official_review/<int:id>")
def get_official_review(id: int):
    if "body_text" in posts_dict[id]:
        text = posts_dict[id]["body_text"]
    else:
        text = "Мы еще не написали обзор этого места"

    return f"<div class='official-review'>{text}</div>"


@app.get("/reviews/<int:id>")
def get_reviews(id: int):
    res = []
    for i in reviews:
        if i["id"] == id:
            html_review_elem = f"""<div class="review-item">
                  <span class="review-rating">{i["rating"]} ★</span>
                  <span>{i["name"]}</span>
                  <p>{i["text"]}</p>
                </div>"""
            res.append(html_review_elem)

    if res:
        return " ".join(res)

    res = "<div class='no-reviews'>Нет отзывов, оставьте первый!</div>"

    return res


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
