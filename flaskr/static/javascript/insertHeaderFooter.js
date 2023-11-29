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
        </div>
`

// <a href="https://www.flaticon.com/free-icons/school" title="school icons">School icons created by Freepik - Flaticon</a>
// <a href="https://www.flaticon.com/free-icons/shop" title="shop icons">Shop icons created by Eucalyp - Flaticon</a>


document.body.prepend(templateHeader.content);

document.body.append(templateFooter.content);


function checkSizes() {
    console.log("refreshing")
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');

    const headerHeight = header.offsetHeight;
    const footerHeight = footer.offsetHeight;

    const windowHeight = window.innerHeight;


    const div = document.querySelector('.map-body');
    console.log(div)
    // header и footer height берут высоты подобранные flex_ом
    const sidePanelHeight = windowHeight - headerHeight - footerHeight;
    console.log(sidePanelHeight)

    console.log(div.style.maxHeight)
    div.style.height = `${sidePanelHeight}px`;
    console.log(div.style.maxHeight)
}

window.addEventListener('resize', checkSizes);
checkSizes()