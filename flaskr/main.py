from flask import Flask, render_template, Response, request
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
        "name": "Отличное место",
        "diner_id": 0,
        "author": "Игорь",
        "place_name": "Даблби",
        "body_text": """Продолжаем нашу рубрику " Кофе брейк", и наше следующее заведение - Даблби.☕️
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

for i in posts_dict:
    if "body_text" in i:
        i["body_text"] = i["body_text"].replace("\n", "<br>")

reviews = [
    {"diner_id": 1, "name": "Max", "rating": 3, "text": "great place, bad food"},
    {"diner_id": 0, "name": "Ivan", "rating": 5, "text": "impressive, very nice"},
    {"diner_id": 1, "name": "Keril", "rating": 1, "text": "my friend died here"}
]

diners = [
    {"id": 1, "name": "Cofix", "position": [55.754005, 37.636823]},
    {"id": 0, "name": "Даблби", "position": [55.754025, 37.635746]},
    {"id": 3, "name": "Андерсон", "position": [55.783735, 37.632352]},
]


# TODO multiple geographical locations per diner
# make a id to diner name table and make a diner id to location table


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
    for diner in diners:
        review = get_official_review(diner["id"])
        if "Мы еще не написали обзор этого места" in review:
            diner["reviewed"] = False
        else:
            diner["reviewed"] = True

    return Response(dumps(diners, default=str), 200, mimetype='application/json')


@app.route("/lyceum_buildings")
def get_lyceum_buildings():
    return Response(dumps(lyceum_buildings, default=str), 200, mimetype='application/json')


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
    for review in reviews:
        if review["diner_id"] == id:
            html_review_elem = f"""<div class="review-item">
                  <span class="review-rating">{review["rating"]} ★</span>
                  <span>{review["name"]}</span>
                  <p>{review["text"]}</p>
                </div>"""
            result.append(html_review_elem)

    if result:
        return " ".join(result)

    result = "<div class='no-reviews'>Нет отзывов, оставьте первый!</div>"
    return result


@app.route("/reviews", methods=["POST"])
def add_review():
    review_data = request.form.to_dict()

    review_author_name = review_data["name"]
    review_rating = int(review_data["rating"])
    review_text = review_data["text"]

    # For now just add new review to others, will be reset on program restart
    reviews.append({"diner_id": int(review_data["diner_id"]), "name": review_author_name, "rating": review_rating,
                    "text": review_text})

    return "<div>Спасибо, отзыв отправлен, скоро мы его рассмотрим и он появится тут!</div>"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
