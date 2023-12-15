# -*- coding: utf-8 -*-

from flask import Flask, render_template, Response, request, abort
from json import dumps
import hashlib

app = Flask(__name__)

lyceum_buildings = [
    {"id": 0, "coordinates": [55.752318, 37.637371], "name": "Лицей на Солянке", "full_address": "Солянка, 14А"},
    {"id": 1, "coordinates": [55.753164, 37.648106], "name": "Вышка на Покре",
     "full_address": "Покровский бульвар, 11с10"},
    {"id": 2, "coordinates": [55.760825, 37.652278], "name": "Лицей на Ляле", "full_address": "Лялин переулок, 3А"},
    {"id": 3, "coordinates": [55.763528, 37.643714], "name": "Лицей на БХ",
     "full_address": "Большой Харитоньевский переулок, 4с1"},
    {"id": 4, "coordinates": [55.769390, 37.618911], "name": "Лицей на Колобке",
     "full_address": "3-й Колобовский переулок, 8с2"},
]

lyceum_buildings_areas = [
    {"lyceum_id": 0, "areas": ["МатИнфо", "Психология", "Естественные науки", "Востоковедение", "Математика"]},
    {"lyceum_id": 1, "areas": ["Большая вышка, ФКН"]},
    {"lyceum_id": 2, "areas": ["Футуритет (8 и 9 классы)"]},
    {"lyceum_id": 3, "areas": ["Гуманитарные науки", "Дизайн", "Юриспруденция"]},
    {"lyceum_id": 4, "areas": ["Экономика и математика", "Экономика и социальные науки"]},
]

areas_icons = {
    "МатИнфо": "matinfo",
    "Психология": "psychology",
    "Естественные науки": "natural_science",
    "Востоковедение": "east",
    "Математика": "math",
    "Гуманитарные науки": "gum",
    "Дизайн": "design",
    "Юриспруденция": "better_call_saul",
    "Экономика и математика": "economics_math",
    "Экономика и социальные науки": "economics_social",
    "Футуритет (8 и 9 классы)": "futuritet",
    "Большая вышка, ФКН": "hse",
}

posts_dict = [
    {
        "name": "Отличное место",
        "diner_id": 0,
        "author": "Игорь",
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
        """,
        "creation_date": "19.10.2023"
    },
    {
        "name": "Семейное кафе и кондитерская",
        "diner_id": 3,
        "author": "Влад",
        "place_name": "Андерсон",
        "body_text": """Кондитерская "АндерСон" - уютное место, чтобы провести время с семьей👨‍👩‍👧‍👦. 
        В отличие от кондитерской "Пушкинъ", интерьер здесь не отличается особой вычурностью, не все десерты обладают своим оригинальным дизайном, но это никак не мешает отлично провести время и вкусно поесть здесь😋! 
        Здесь есть замечательное меню доставки, которую вам быстро привезут. В этой кондитерской также проводят детские праздники и даже выпускные🎉. За все время в этом месте было проведено больше четырех тысяч праздников, так что в качестве проведения мероприятия можно не сомневаться! 
        Помимо десертов здесь также есть и обычное меню🥗🥙, так что голодными оттуда вы не уйдете!
            
            💸Средний чек: 2000р
            
            Ближайшие к зданиям Лицея адреса:
            📍Ул. Гиляровского, 39
            📍Верхняя Красносельская ул., 7, стр. 2
            📍Наб. Академика Туполева, 15
            📍Таганская ул., 36, стр. 1
            """,
        "creation_date": "3.11.2023"
    }

]

pass_key_hash = "ddbe7b29ea6025d731132854b72ceca46af449d55482c819561381a92da6aa1ad5e7009e21fe30bb269c71f7d01d4713c0259d720250c0ee1cfa8d4b5f8c9245"
# TODO put current hash in one place to be accessed both from python and js


for i in posts_dict:
    if "body_text" in i:
        i["body_text"] = i["body_text"].replace("\n", "<br>")

reviews = [
    {"place_id": 1, "name": "Max", "rating": 3, "text": "great place, bad food"},
    {"place_id": 0, "name": "Ivan", "rating": 5, "text": "impressive, very nice"},
    {"place_id": 1, "name": "Keril", "rating": 1, "text": "my friend died here"}
]

diner_names = [
    {"id": 1, "name": "Cofix"},
    {"id": 0, "name": "Даблби"},
    {"id": 3, "name": "Андерсон"},
]

diner_locations = [
    {"id": 0, "diner_id": 1, "coordinates": [55.754005, 37.636823], "full_address": "улица Солянка, 2/6"},
    {"id": 6, "diner_id": 0, "coordinates": [55.767762, 37.620743], "full_address": "Цветной бульвар, 1"},
    {"id": 7, "diner_id": 0, "coordinates": [55.761507, 37.631424], "full_address": "Милютинский переулок, 3"},
    {"id": 1, "diner_id": 0, "coordinates": [55.754025, 37.635746], "full_address": "Солянский проезд, 1"},
    {"id": 2, "diner_id": 3, "coordinates": [55.783735, 37.632352], "full_address": "улица Гиляровского, 39с3"},
    {"id": 3, "diner_id": 3, "coordinates": [55.784906, 37.66115], "full_address": "Верхняя Красносельская улица, 7с2"},
    {"id": 4, "diner_id": 3, "coordinates": [55.760697, 37.682179], "full_address": "Наб. Академика Туполева, 15"},
    {"id": 5, "diner_id": 3, "coordinates": [55.739421, 37.666310], "full_address": "Таганская ул., 36, стр. 1"},
]


def get_sha512_hash(string):
    return hashlib.sha512(string.encode('utf-8')).hexdigest()


@app.route('/')
def index_page():
    return render_template("index.html")


@app.route('/map')
def map_page():
    return render_template("map.html")


@app.route('/blog')
def blog_page():
    args = request.args
    return render_template("blog.html", posts=posts_dict)


@app.route("/diners")
def get_diners():
    for diner_location in diner_locations:
        diner_id = diner_location["diner_id"]
        diner_name = list(filter(lambda x: x["id"] == diner_id, diner_names))[0]["name"]
        diner_location["name"] = diner_name
        review = get_official_review(diner_id)
        if "Мы еще не написали обзор этого места" in review:
            diner_location["reviewed"] = False
        else:
            diner_location["reviewed"] = True

    return Response(dumps(diner_locations, default=str), 200, mimetype='application/json')


@app.route("/admin")
def admin_panel():
    pass_key = request.args.get("passkey")
    if get_sha512_hash(pass_key) != pass_key_hash:
        abort(401)

    return render_template("admin.html", posts=posts_dict, diners=diner_locations)


@app.route("/lyceum_buildings")
def get_lyceum_buildings():
    return Response(dumps(lyceum_buildings, default=str), 200, mimetype='application/json')


@app.get("/lyceum_buildings/<int:id>")
def get_lyceum_building_areas(id: int):
    lyceums_with_matching_id = list(filter(lambda x: x["lyceum_id"] == id, lyceum_buildings_areas))
    result = []
    prefix = "<div class='lyceum-areas'>"
    postfix = "</div>"
    for area in lyceums_with_matching_id[0]["areas"]:
        icon_path = f"/static/images/areas_icons/{areas_icons[area]}.png"
        html_review_elem = f"""<div class="lyceum-area-item">
<img src='{icon_path}' alt='{area}'>{area}
                </div>"""
        result.append(html_review_elem)

    if result:
        result = " ".join(result)
    else:
        result = "<div class='no-reviews'>Что-то пошло не так</div>"

    return prefix + result + postfix


@app.get("/official_review/<int:id>")
def get_official_review(id: int):
    posts_with_matching_id = list(filter(lambda x: x["diner_id"] == id, posts_dict))
    if not posts_with_matching_id:
        text = "Мы еще не написали обзор этого места"
    else:
        text = posts_with_matching_id[0]["body_text"]

    return f"<div class='official-review'>{text}</div>"


@app.get("/reviews/<int:id>")
def get_reviews(id: int):
    result = []
    reviews_with_matching_id = list(filter(lambda x: x["place_id"] == id, reviews))
    for review in reviews_with_matching_id:
        html_review_elem = f"""<div class="review-item">
              <span class="review-rating">{review["rating"]} ★</span>
              <span>{review["name"]}</span>
              <p>{review["text"]}</p>
            </div>"""
        result.append(html_review_elem)

    if result:
        result = " ".join(result)
    else:
        result = "<div class='no-reviews'>Нет отзывов, оставьте первый!</div>"

    return result


@app.route("/reviews", methods=["POST"])
def add_review():
    review_data = request.form.to_dict()

    review_author_name = review_data["name"]
    review_rating = int(review_data["rating"])
    review_text = review_data["text"]

    # For now just add new review to others, will be reset on program restart
    reviews.append({"place_id": int(review_data["diner_id"]), "name": review_author_name, "rating": review_rating,
                    "text": review_text})

    return "<div>Спасибо, отзыв отправлен, скоро мы его рассмотрим и он появится тут!</div>"


if __name__ == "__main__":
    # get_address_gps("Верхняя Красносельская ул., 7, стр. 2")

    app.run(host="localhost", port=80)
