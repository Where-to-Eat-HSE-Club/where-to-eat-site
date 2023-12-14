console.log("insertHeaderFooter.js init!")


const templateHeader = document.createElement('template');
const templateFooter = document.createElement('template');

templateHeader.innerHTML = `
    <div class="header">
        <div class="header-left">
            <img src="/static/images/where-to-eat-logo.png" alt="Site Logo">
            <a class="nav-button no-decoration" href="/"><div class="nav-button-text">Где Поесть?</div></a>
        </div>
        <div class="header-right">
            <a class="nav-button no-decoration" href="/blog"><div class="nav-button-text">Обзоры</div></a>
            <a class="nav-button no-decoration" href="/map"><div class="nav-button-text">Карта</div></a>
            <a class="nav-button no-decoration" href="/"><div class="nav-button-text">Про Нас</div></a>
        </div>
    </div>
`;

templateFooter.innerHTML = `
    <div class="footer">
        <div class="footer-text-container"><div> Социальный проект  <a class="no-decoration" href="https://2359.hse.ru/spd/view/222">"Где Поесть?"</a>  © 2023, Лицей НИУ ВШЭ </div></div>
        <button class="nav-button no-decoration footer-button" onclick="promptAuth()"><div class="nav-button-text">Админка</div></button>
    </div>
`

// <a href="https://www.flaticon.com/free-icons/school" title="school icons">School icons created by Freepik - Flaticon</a>
// <a href="https://www.flaticon.com/free-icons/shop" title="shop icons">Shop icons created by Eucalyp - Flaticon</a>
// <a href="https://www.flaticon.com/free-icons/pin" title="pin icons">Pin icons created by Freepik - Flaticon</a>

document.body.prepend(templateHeader.content);

document.body.append(templateFooter.content);


function reflow(elt){
    console.log(elt.offsetHeight);
}

function checkSizes() {
    console.log("refreshing")
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');

    const headerHeight = header.offsetHeight;
    const footerHeight = footer.offsetHeight;
    const windowHeight = window.innerHeight;

    const sidePanelHeight = windowHeight - headerHeight - footerHeight;

    const div = document.querySelector('.map-body');
    if (div) {
        div.style.height = `${sidePanelHeight}px`;
    }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener('resize', checkSizes);
sleep(100).then(checkSizes) // костыль, но работает

reflow(document.querySelector('.footer'))