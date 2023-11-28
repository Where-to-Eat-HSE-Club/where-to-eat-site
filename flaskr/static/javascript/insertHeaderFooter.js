console.log("insertHeaderFooter.js init!")


const templateHeader = document.createElement('template');
const templateFooter = document.createElement('template');

templateHeader.innerHTML = `
    <div class="header">
        <div class="header-left">
            <img src="/static/images/where-to-eat-logo.png" alt="Site Logo">
            <a class="nav-button no-decoration" href="/">Где Поесть?</a>
        </div>
        <div class="header-right">
            <a class="nav-button no-decoration" href="/blog">Блог</a>
            <a class="nav-button no-decoration" href="/map">Карта</a>
            <a class="nav-button no-decoration" href="/">Про Нас</a>
        </div>
    </div>
`;

templateFooter.innerHTML = `
    <div class="footer">
        <div> Социальный проект  <a class="no-decoration" href="https://2359.hse.ru/spd/view/222">"Где Поесть?"</a>  © 2023, Лицей НИУ ВШЭ </div>
        <a href="https://www.flaticon.com/free-icons/school" title="school icons">School icons created by Freepik - Flaticon</a>
        <a href="https://www.flaticon.com/free-icons/shop" title="shop icons">Shop icons created by Eucalyp - Flaticon</a>
    </div>
`

document.body.prepend(templateHeader.content);

document.body.append(templateFooter.content);