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
    y = coordinates[0]
    x = coordinates[1]
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
    console.log("Requesting lyceum buildings")
    const response = await fetch("/lyceum_buildings");
    const lyceumBuildingsData = await response.json();

    console.log(lyceumBuildingsData);

    return lyceumBuildingsData
}

/**
 * Fetch all diners' data from flask endpoint
 *
 * Returns all diners in a list like [{"id": 0, "name": "Cofix", "position": [55.754005, 37.636823], "reviewed": False}]
 */
async function getDiners() {
    const response = await fetch("/diners");
    const dinersData = await response.json();


    return dinersData
}

/**
 * Clear all contents of side panel and set header to "please select a new restaurant"
 */
function clearDinerSidePanel() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = "Кликните по любому ресторану, чтобы открыть информацию о нём."

    let sidePanelBody = document.querySelector(".side-panel-body")
    sidePanelBody.innerHTML = ""
}

/**
 * Fill side panel with diner info.
 *
 * @param id
 * @param dinerName
 * @param position
 * @param reviewed
 */
function fillDinerSidePanel(id, dinerName, position, reviewed) {
    clearDinerSidePanel()

    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = dinerName

    let sidePanelBody = document.querySelector(".side-panel-body")

    addOfficialReview(id, reviewed, sidePanelBody)

    addReviews(id, sidePanelBody)

    // WIP
    // addReviewForm(sidePanelBody)

    document.body.dispatchEvent(updateBodyListenersEvent)
}

/**
 * Insert official review at the start of sidePanelBody
 *
 * @param dinerId
 * @param reviewed
 * @param sidePanelBody
 */
function addOfficialReview(dinerId, reviewed, sidePanelBody) {
    let officialReviewHeader =  document.createElement("div")
    let officialReview = document.createElement("div")

    officialReviewHeader.textContent = "Официальный обзор от Где Поесть"
    officialReviewHeader.className = "official-review-header"


    if (reviewed) {
        let reviewUrl = "/official_review/" + dinerId;

        officialReview.textContent = "loading now"
        officialReview.className = "official-review"
        officialReview.setAttribute("hx-get",  reviewUrl)
        officialReview.setAttribute("hx-trigger", "load")
        officialReview.setAttribute("hx-target", "this")
        officialReview.setAttribute("hx-swap", "outerHTML")
    } else {
        officialReview.textContent = "Мы еще не написали обзор этого места"
        officialReview.className = "official-review"
    }
    sidePanelBody.prepend(officialReview)
    sidePanelBody.prepend(officialReviewHeader)

}

/**
 * Insert all diner reviews at the end of sidePanelBody
 *
 * @param dinerId
 * @param sidePanelBody
 */
function addReviews(dinerId, sidePanelBody) {
    let reviews = document.createElement("div")

    let reviewsHeader = document.createElement("div")

    reviewsHeader.textContent = "Отзывы от людей"
    reviewsHeader.className = "reviews-header"

    sidePanelBody.append(reviewsHeader)

    let reviewsUrl = "/reviews/" + dinerId;

    reviews.className = "reviews"
    reviews.textContent = "loading now"
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
 */
function addReviewForm(sidePanelBody) {
    let reviewForm = document.createElement("form")
    reviewForm.innerHTML = "" +
        "  <input name=\"name\" type=\"text\" class=\"feedback-input\" placeholder=\"Name\" />" +
        "  <input name=\"email\" type=\"text\" class=\"feedback-input\" placeholder=\"Email\" />" +
        "  <textarea name=\"text\" class=\"feedback-input\" placeholder=\"Comment\"></textarea>" +
        "  <input type=\"submit\" value=\"SUBMIT\"/>"


    sidePanelBody.append(reviewForm)

}

/**
 * Map click event handler.
 *
 * - If the user clicked not on the marker, close currently opened diner's information on the side panel.
 *
 * @param obj
 */
function onMapClick(obj) {
    // For now disabled, will add close side panel button later, because map click events are unreliable
    return
    console.log(obj)
    if (obj) {
        if (obj["type"] === "marker"){
            return
        }
    }

    clearDinerSidePanel()
}

/**
 * Import all classes from Yandex Maps JS API and return them.
 *
 * @return {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl}
 */
async function initYMapModules() {
    console.log("map loading")
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

    map.addChild((scheme = new YMapDefaultSchemeLayer()));
    map.addChild(new YMapControls({position: 'right'}).addChild(new YMapZoomControl({})));
    map.addChild(new YMapDefaultFeaturesLayer({id: 'features'}));

    const mapListener = new YMapListener({
        layer: 'any',
        onClick: (obj) => {onMapClick(obj)},
        // onMouseMove: mouseMoveCallback
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
            let markerElement = document.createElement("div")
            let markerIcon = document.createElement("img")
            markerIcon.src = "/static/images/school.png"
            markerElement.className = "marker lyceum-marker"
            markerElement.appendChild(markerIcon)
            console.log(lyceum.coordinates)
            let placemark = new YMapMarker(
                {
                    // source: "featureSource",
                    coordinates: prepareCoordinates(lyceum.coordinates),

                    // draggable: false,
                    // mapFollowsOnDrag: false
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
            let id = diner.id
            let name = diner.name
            let position = diner.position
            let reviewed = diner.reviewed

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
                    coordinates: prepareCoordinates(position),
                    onFastClick: () => {fillDinerSidePanel(id, name, position, reviewed)}
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
