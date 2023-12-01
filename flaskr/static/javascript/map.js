// Event for telling HTMX to rebuild all events. (Called after modifying HTML DOM from JS)
const updateBodyListenersEvent = new Event("updateBodyListeners");

/**
 * Use for delaying some code execution. Usage:
 *
 * sleep(1000).then (() => {alert("this code will be executed after 1 second")})
 * @param {number} ms milliseconds to delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reflow (recompose) given html element. Used for redrawing elements after css change.
 * Doesn't work with flex changes for some reason.
 *
 * @param {HTMLElement} elt
 */
function reflow(elt){
    console.log(elt.offsetHeight);
}

/**
 * Given latitude and longitude, move the gps point by offset meters up and left.
 *
 * Returns latitude and longitude swapped places because Yandex API messed the order up, duh
 * @param {[number, number]} coordinates
 * @param {number} offset
 *
 * @return {[number, number]}
 */
function prepareCoordinates(coordinates, offset= 4) {
    let y = coordinates[0]
    let x = coordinates[1]
    y += offset / 111111
    x -= offset / (111111 * Math.cos(y * Math.PI / 180))

    // See https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters

    return [x, y]
}

/**
 * Fetch all lyceum buildings' coordinates and names from flask endpoint
 *
 * Returns all lyceums in a list like [{"coordinates": [55.752318, 37.637371], "name": "Лицей на Солянке"}]
 */
async function getLyceumBuildings() {
    const response = await fetch("/lyceum_buildings");
    return await response.json()
}

/**
 * Fill side panel with info about selected lyceum building (name, address, learning areas).
 *
 * @param lyceumID
 * @param name
 * @param coordinates
 * @param fullAddress
 */
function fillLyceumBuildingSidePanel(lyceumID, name, coordinates, fullAddress) {
    clearDinerSidePanel()

    fillSidePanelHeader(name)


    let sidePanelBody = document.querySelector(".side-panel-body")


    let sidePanelSubHeader = document.createElement("div")
    sidePanelSubHeader.className = "side-panel-subheader"
    sidePanelSubHeader.textContent = "Полный адрес"
    sidePanelBody.append(sidePanelSubHeader)

    let sidePanelSubHeaderContent = document.createElement("div")
    sidePanelSubHeaderContent.className = "lyceum-full-address"
    sidePanelSubHeaderContent.textContent = fullAddress
    sidePanelBody.append(sidePanelSubHeaderContent)

    let lyceumAreasHeader = document.createElement("div")

    let lyceumAreas = document.createElement("div")

    lyceumAreasHeader.textContent = "Направления в этом здании"
    lyceumAreasHeader.className = "side-panel-subheader"

    sidePanelBody.append(lyceumAreasHeader)

    let lyceumAreasUrl = "/lyceum_buildings/" + lyceumID;

    lyceumAreas.className = "lyceum-areas"
    lyceumAreas.textContent = "Загружаю..."
    lyceumAreas.setAttribute("hx-get",  lyceumAreasUrl)
    lyceumAreas.setAttribute("hx-trigger", "load")
    lyceumAreas.setAttribute("hx-target", "this")
    lyceumAreas.setAttribute("hx-swap", "innerHTML")

    sidePanelBody.append(lyceumAreas)

    document.body.dispatchEvent(updateBodyListenersEvent)
}

/**
 * Fetch all diners' data from flask endpoint
 *
 * Returns all diners in a list like [{"id": 0, "name": "Cofix", "coordinates": [55.754005, 37.636823], "reviewed": False}]
 */
async function getDiners() {
    const response = await fetch("/diners");
    return await response.json()
}

/**
 * Clear all contents of side panel and set header to "please select a new restaurant"
 */
function clearDinerSidePanel() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = ""

    let sidePanelBody = document.querySelector(".side-panel-body")
    sidePanelBody.innerHTML = ""
}

function fillEmptySidePanelHeader() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = "Кликните по любому ресторану или зданию лицея, чтобы открыть информацию о нём."
}

function fillSidePanelHeader(headerText) {
    let sidePanelHeader = document.querySelector(".side-panel-header")

    let sidePanelHeaderText = document.createElement("div")
    sidePanelHeaderText.className = "side-panel-header-text"
    sidePanelHeaderText.textContent = headerText

    sidePanelHeader.append(sidePanelHeaderText)

    let sidePanelCloseButton = document.createElement("button")
    sidePanelCloseButton.className = "side-panel-close-button"
    sidePanelCloseButton.textContent = "✖"
    sidePanelCloseButton.addEventListener("click", () => {
        clearDinerSidePanel()
        fillEmptySidePanelHeader()
        }
    )
    sidePanelHeader.append(sidePanelCloseButton)
}

/**
 * Fill side panel with diner info.
 *
 * @param dinerID
 * @param dinerName
 * @param coordinates
 * @param reviewed
 * @param fullAddress
 * @param placeID
 */
function fillDinerSidePanel(dinerID, dinerName, coordinates, reviewed, fullAddress, placeID) {
    clearDinerSidePanel()

    fillSidePanelHeader(dinerName)

    let sidePanelBody = document.querySelector(".side-panel-body")


    let sidePanelAddressHeader = document.createElement("div")
    sidePanelAddressHeader.className = "side-panel-subheader"
    sidePanelAddressHeader.textContent = "Полный адрес"

    let sidePanelAddress = document.createElement("div")
    sidePanelAddress.className = "lyceum-full-address"
    sidePanelAddress.textContent = fullAddress

    sidePanelBody.append(sidePanelAddressHeader)
    sidePanelBody.append(sidePanelAddress)


    addOfficialReview(dinerID, reviewed, sidePanelBody)

    addReviews(placeID, sidePanelBody)

    addReviewForm(sidePanelBody, placeID)

    document.body.dispatchEvent(updateBodyListenersEvent)
}

/**
 * Insert official review at the start of sidePanelBody
 *
 * @param dinerID
 * @param reviewed
 * @param sidePanelBody
 */
function addOfficialReview(dinerID, reviewed, sidePanelBody) {
    let officialReviewHeader =  document.createElement("div")
    let officialReview = document.createElement("div")

    officialReviewHeader.textContent = "Наш Обзор"
    officialReviewHeader.className = "side-panel-subheader"

    let reviewUrl = "/official_review/" + dinerID;

    officialReview.textContent = "Загружаю..."
    officialReview.className = "official-review"
    officialReview.setAttribute("hx-get",  reviewUrl)
    officialReview.setAttribute("hx-trigger", "load")
    officialReview.setAttribute("hx-target", "this")
    officialReview.setAttribute("hx-swap", "outerHTML")

    sidePanelBody.append(officialReviewHeader)

    sidePanelBody.append(officialReview)
}

/**
 * Insert all diner reviews at the end of sidePanelBody
 *
 * @param placeID
 * @param sidePanelBody
 */
function addReviews(placeID, sidePanelBody) {
    let reviews = document.createElement("div")

    let reviewsHeader = document.createElement("div")

    reviewsHeader.textContent = "Отзывы от людей"
    reviewsHeader.className = "side-panel-subheader"

    sidePanelBody.append(reviewsHeader)

    let reviewsUrl = "/reviews/" + placeID;

    reviews.className = "reviews"
    reviews.textContent = "Загружаю..."
    reviews.setAttribute("hx-get",  reviewsUrl)
    reviews.setAttribute("hx-trigger", "load")
    reviews.setAttribute("hx-target", "this")
    reviews.setAttribute("hx-swap", "innerHTML")

    sidePanelBody.append(reviews)
}

/**
 * Insert form for leaving a review at the end of sidePanelBody
 *
 * @param sidePanelBody
 * @param placeID
 */
function addReviewForm(sidePanelBody, placeID) {
    let reviewFormHeader = document.createElement("div")
    reviewFormHeader.textContent = "Оставить отзыв"
    reviewFormHeader.className = "side-panel-subheader"
    sidePanelBody.append(reviewFormHeader)

    let reviewForm = document.createElement("form")
    reviewForm.setAttribute("hx-post", "/reviews")
    reviewForm.setAttribute("hx-swap", "outerHTML")
    reviewForm.textContent = "Загружаю..."

    reviewForm.innerHTML = `
        <input name="name" type="text" class="feedback-input" placeholder="Имя" />
        <input name="diner_id" type="text" class="side-panel-header-hidden-id" value=${placeID}>
        <div class="stars">
            <div class="stars-label">Рейтинг</div>
            <div class="stars-bar">
                <input class="star star-5" id="star-5" type="radio" name="rating" value="5"/>
                <label class="star star-5" for="star-5"></label>
                <input class="star star-4" id="star-4" type="radio" name="rating" value="4"/>
                <label class="star star-4" for="star-4"></label>
                <input class="star star-3" id="star-3" type="radio" name="rating" value="3"/>
                <label class="star star-3" for="star-3"></label>
                <input class="star star-2" id="star-2" type="radio" name="rating" value="2"/>
                <label class="star star-2" for="star-2"></label>
                <input class="star star-1" id="star-1" type="radio" name="rating" value="1"/>
                <label class="star star-1" for="star-1"></label>
            </div>
        </div>
        <textarea name="text" class="feedback-input" placeholder="Отзыв"></textarea>
        <button class="submit-button" type="submit">Отправить</button>
    `

    sidePanelBody.append(reviewForm)
}


/**
 * Import all classes from Yandex Maps JS API and return them.
 *
 * @return {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl}
 */
async function initYMapModules() {
    await ymaps3.ready;

    const {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer} = ymaps3;

    const {YMapDefaultMarker} = await ymaps3.import('@yandex/ymaps3-markers@0.0.1');
    const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

    return {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl}
}

/**
 * Create a map, setup all settings (camera location, map controls, layers and event listeners) and return it.
 *
 * @param YMap
 * @param YMapDefaultSchemeLayer
 * @param YMapControls
 * @param YMapZoomControl
 * @param YMapDefaultFeaturesLayer
 * @param YMapListener
 *
 * @return YMap
 */
async function setupMap(YMap, YMapDefaultSchemeLayer, YMapControls, YMapZoomControl, YMapDefaultFeaturesLayer, YMapListener) {
    const map = new YMap(document.getElementById("map"), {
        location: {
            center: [55.752630, 37.623130],
            zoom: 5
        }
    });
    let scheme = new YMapDefaultSchemeLayer()
    map.addChild((scheme));
    map.addChild(new YMapControls({position: 'right'}).addChild(new YMapZoomControl({})));
    map.addChild(new YMapDefaultFeaturesLayer({id: 'features'}));

    const mapListener = new YMapListener({
        layer: 'any',
    });

    map.addChild(mapListener)
    return map
}


/**
 * Add all lyceum buildings markers to the map.
 *
 * @param map
 * @param YMapMarker
 */
async function setupLyceumBuildings(map, YMapMarker) {
    getLyceumBuildings().then((lyceumBuildingsData) => {
        if (lyceumBuildingsData != null) {
            map.setLocation({
              center: prepareCoordinates(lyceumBuildingsData[0].coordinates),
              zoom: 15
            });
        }
        for (let lyceum of lyceumBuildingsData) {
            let id = lyceum.id
            let name = lyceum.name
            let coordinates = lyceum.coordinates
            let fullAddress = lyceum.full_address

            let markerElement = document.createElement("div")
            let markerIcon = document.createElement("img")

            markerIcon.src = "/static/images/school.png"
            markerElement.className = "marker lyceum-marker"
            markerElement.appendChild(markerIcon)

            let placemark = new YMapMarker(
                {
                    coordinates: prepareCoordinates(lyceum.coordinates),
                    onFastClick: () => {fillLyceumBuildingSidePanel(id, name, coordinates, fullAddress)}
                },
                markerElement
            )

            map.addChild(placemark);
        }
    })
}

/**
 * Add all diners markers to the map.
 *
 * @param map
 * @param YMapMarker
 * @return {Promise<void>}
 */
async function setupDiners(map, YMapMarker) {
    getDiners().then((dinersData) => {
        for (let diner of dinersData) {
            let placeID = diner.id
            let dinerID = diner.diner_id
            let name = diner.name
            let coordinates = diner.coordinates
            let reviewed = diner.reviewed
            let fullAddress = diner.full_address

            let markerElement = document.createElement("div")
            let markerIcon = document.createElement("img")

            if (reviewed){
                markerIcon.src = "/static/images/restaurant_colored.png"
            } else {
                markerIcon.src = "/static/images/restaurant.png"
            }

            markerElement.className = "marker diner-marker"
            markerElement.appendChild(markerIcon)


            let placemark = new YMapMarker(
                {
                    coordinates: prepareCoordinates(coordinates),
                    onFastClick: () => {fillDinerSidePanel(dinerID, name, coordinates, reviewed, fullAddress, placeID)}
                },
                markerElement
            )
            map.addChild(placemark)
        }
    })
}

/**
 * Function called on start, inits the map and places lyceum buildings and diners markers on the map.
 */
async function init(){

    let {
        YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls,
        YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl
    } = await initYMapModules()

    let map = await setupMap(YMap, YMapDefaultSchemeLayer, YMapControls, YMapZoomControl, YMapDefaultFeaturesLayer, YMapListener)

    await setupLyceumBuildings(map, YMapMarker)
    await setupDiners(map, YMapMarker)
}
