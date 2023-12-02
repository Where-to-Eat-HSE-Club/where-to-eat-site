// Event for telling HTMX to rebuild all events. (Called after modifying HTML DOM from JS)
const updateBodyListenersEvent = new Event("updateBodyListeners")

// Selected mode for showing a network of diners:
//
// - "center" calculates middle point between all coordinates and centers on it
// with zoom of 14, works for small to medium distances
//
// - "box" calculates bounding box in which all points will fit, so they can be shown, works better at all distances

const mapCenterMode = "box" // or "center"

/**
 * Use for delaying some code execution. Usage:
 *
 * sleep(1000).then (() => {alert("this code will be executed after 1 second")})
 * @param {number} ms milliseconds to delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Reflow (recompose) given html element. Used for redrawing elements after css change.
 * Doesn't work with flex changes for some reason.
 *
 * @param {HTMLElement} elt
 */
function reflow(elt) {
    console.log(elt.offsetHeight)
}

/**
 * Given latitude and longitude, move the gps point by offset meters up and left.
 *
 * Returns latitude and longitude swapped places because Yandex API messed the order up, duh
 *
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
 * Retrieve given URL query parameter from current URL
 *
 * @param parameter
 * @returns {string}
 */
function getQueryParam(parameter) {
    let urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(parameter)
}

/**
 * Remove all query parameters from current URL
 */
function removeQueryParams() {
    window.history.pushState({}, document.title, window.location.pathname)
}

/**
 * Retrieve current highlighted_diner_id from URL or return null if not specified
 *
 * @returns {number|null}
 */
function getHighlightedDinerID() {
    let highlightedDinerId = getQueryParam("highlighted_diner_id")
    console.log(highlightedDinerId)
    if (highlightedDinerId == null) {
        return null
    }
    return Number(highlightedDinerId)
}

/**
 * Fetch all lyceum buildings' coordinates and names from flask endpoint
 *
 * For returned structure see main.py
 */
async function getLyceumBuildings() {
    const response = await fetch("/lyceum_buildings")
    return await response.json()
}

/**
 * Add htmx requester for studied areas in given lyceum
 *
 * @param lyceumID
 * @param sidePanelBody
 */
function addLyceumAreas(lyceumID, sidePanelBody) {
    let lyceumAreasHeader = document.createElement("div")

    let lyceumAreas = document.createElement("div")

    lyceumAreasHeader.textContent = "Направления в этом здании"
    lyceumAreasHeader.className = "side-panel-subheader"

    sidePanelBody.append(lyceumAreasHeader)

    let lyceumAreasUrl = "/lyceum_buildings/" + lyceumID

    lyceumAreas.className = "lyceum-areas"
    lyceumAreas.textContent = "Загружаю..."
    lyceumAreas.setAttribute("hx-get",  lyceumAreasUrl)
    lyceumAreas.setAttribute("hx-trigger", "load")
    lyceumAreas.setAttribute("hx-target", "this")
    lyceumAreas.setAttribute("hx-swap", "innerHTML")

    sidePanelBody.append(lyceumAreas)
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

    let sidePanelBody = document.querySelector(".side-panel-body")

    fillSidePanelHeader(name)

    addFullAddress(fullAddress, sidePanelBody)

    addLyceumAreas(lyceumID, sidePanelBody)

    document.body.dispatchEvent(updateBodyListenersEvent)
}

/**
 * Fetch all diners' data from flask endpoint
 *
 * For returned structure see main.py
 */
async function getDiners() {
    const response = await fetch("/diners")
    return await response.json()
}

/**
 * Clear all contents of side panel
 */
function clearDinerSidePanel() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = ""

    let sidePanelBody = document.querySelector(".side-panel-body")
    sidePanelBody.innerHTML = ""
}

/**
 * Remove highlighted class from all map points
 */
function disablePointsHighlighting() {
    removeQueryParams()
    let points = document.querySelectorAll(".highlighted")
    points.forEach((point) => {
        point.classList.remove("highlighted")
    })
}

/**
 * Change side panel header to default "click on anything to select it"
 */
function fillEmptySidePanelHeader() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = "Кликните по любому ресторану или зданию лицея, чтобы открыть информацию о нём."
}

/**
 * Change side panel header to given headerText and add a close button to the top left
 *
 * @param headerText
 */
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
            disablePointsHighlighting()
            fillEmptySidePanelHeader()
        }
    )
    sidePanelHeader.append(sidePanelCloseButton)
}

/**
 * Fill side panel with info about selected diner network
 * (name, address text saying a diner network is selected and official review)
 *
 * @param dinerID
 * @param dinerName
 * @param dinerLocationCount
 */
function fillDinerNetworkSidePanel(dinerID, dinerName, dinerLocationCount) {
    clearDinerSidePanel()

    let sidePanelBody = document.querySelector(".side-panel-body")

    fillSidePanelHeader(dinerName)

    addFullAddress(`Выделены все локации "${dinerName}" (${dinerLocationCount})`, sidePanelBody)

    addOfficialReview(dinerID, true, sidePanelBody, null)

    document.body.dispatchEvent(updateBodyListenersEvent)
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

    addFullAddress(fullAddress, sidePanelBody)

    addOfficialReview(dinerID, reviewed, sidePanelBody, dinerName)

    addReviews(placeID, sidePanelBody)

    addReviewForm(sidePanelBody, placeID)

    document.body.dispatchEvent(updateBodyListenersEvent)
}

/**
 * Add address header ans subheader to side panel
 * @param fullAddress
 * @param sidePanelBody
 */
function addFullAddress(fullAddress, sidePanelBody) {
    let sidePanelAddressHeader = document.createElement("div")
    sidePanelAddressHeader.className = "side-panel-subheader"
    sidePanelAddressHeader.textContent = "Полный адрес"

    let sidePanelAddress = document.createElement("div")
    sidePanelAddress.className = "lyceum-full-address"
    sidePanelAddress.textContent = fullAddress

    sidePanelBody.append(sidePanelAddressHeader)
    sidePanelBody.append(sidePanelAddress)
}

/**
 * Add official review and network redirect button to sidePanelBody
 *
 * @param dinerID
 * @param reviewed
 * @param sidePanelBody
 * @param dinerName
 */
function addOfficialReview(dinerID, reviewed, sidePanelBody, dinerName) {
    let officialReviewHeader =  document.createElement("div")
    let officialReviewHeaderText = document.createElement("div")

    let officialReview = document.createElement("div")

    officialReviewHeader.className = "side-panel-review-header"

    officialReviewHeaderText.textContent = "Наш Обзор"
    officialReviewHeaderText.className = "side-panel-subheader"
    officialReviewHeader.append(officialReviewHeaderText)


    if (dinerName !== null){
        let officialReviewHeaderNetworkButton = document.createElement("button")

        officialReviewHeaderNetworkButton.className = "official-review-network-button"
        officialReviewHeaderNetworkButton.textContent = `Показать все ${dinerName}`
        officialReviewHeaderNetworkButton.addEventListener("click", () => {
            document.location.href = `/map?highlighted_diner_id=${dinerID}`
        })
        officialReviewHeader.append(officialReviewHeaderNetworkButton)
    }

    let reviewUrl = "/official_review/" + dinerID

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
 * Add all diner reviews to sidePanelBody
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

    let reviewsUrl = "/reviews/" + placeID

    reviews.className = "reviews"
    reviews.textContent = "Загружаю..."
    reviews.setAttribute("hx-get",  reviewsUrl)
    reviews.setAttribute("hx-trigger", "load")
    reviews.setAttribute("hx-target", "this")
    reviews.setAttribute("hx-swap", "innerHTML")

    sidePanelBody.append(reviews)
}

/**
 * Add form for leaving a review to sidePanelBody
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
 * Import all used classes from Yandex Maps JS API and return them.
 *
 * @return {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl}
 */
async function initYMapModules() {
    await ymaps3.ready

    const {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer} = ymaps3

    const {YMapDefaultMarker} = await ymaps3.import('@yandex/ymaps3-markers@0.0.1')
    const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1')

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
    })
    let scheme = new YMapDefaultSchemeLayer()
    map.addChild((scheme))
    map.addChild(new YMapControls({position: 'right'}).addChild(new YMapZoomControl({})))
    map.addChild(new YMapDefaultFeaturesLayer({id: 'features'}))

    const mapListener = new YMapListener({
        layer: 'any',
    })

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
            let boundingBox = calculateBoundingBox(lyceumBuildingsData, null)
            map.setLocation({
                bounds: [
                    [boundingBox.minLongitude, boundingBox.minLatitude],
                    [boundingBox.maxLongitude, boundingBox.maxLatitude]
                ]
            })
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
                    onFastClick: () => {
                        disablePointsHighlighting()
                        markerElement.classList.add("highlighted")
                        fillLyceumBuildingSidePanel(id, name, coordinates, fullAddress)
                    }
                },
                markerElement
            )

            map.addChild(placemark)
        }
    })
}

/**
 * Take all coordinates from given diners (filtered by targetDinerID) and find average center point between them
 *
 * @param diners
 * @param targetDinerID
 * @returns {number[]|null}
 */
function calculateAverageCoordinate(diners, targetDinerID) {
    const filteredDiners = diners.filter(diner => diner.diner_id === targetDinerID)

    if (filteredDiners.length === 0) {
        return null
    }

    let sumLat = 0
    let sumLong = 0

    for (const diner of filteredDiners) {
        const coordinates = diner.coordinates

        sumLat += coordinates[0]
        sumLong += coordinates[1]
    }

    const avgLat = sumLat / filteredDiners.length
    const avgLong = sumLong / filteredDiners.length

    return [avgLong, avgLat]
}

/**
 * Take all coordinates from given diners (filtered by targetDinerID) and find box corners that fit all of points.
 *
 * @param points
 * @param targetDinerID
 * @returns {{maxLongitude: number, minLatitude: number, minLongitude: number, maxLatitude: number}|null}
 */
function calculateBoundingBox(points, targetDinerID) {
    let filteredPoints = []
    if (targetDinerID !== null){
        filteredPoints = points.filter(diner => diner.diner_id === targetDinerID)
    } else {
        filteredPoints = points
    }

    if (filteredPoints.length === 0) {
        return null
    }

    let minLat = filteredPoints[0].coordinates[0]
    let maxLat = filteredPoints[0].coordinates[0]
    let minLong = filteredPoints[0].coordinates[1]
    let maxLong = filteredPoints[0].coordinates[1]

    for (const point of filteredPoints) {
        const coordinates = point.coordinates

        minLat = Math.min(minLat, coordinates[0])
        maxLat = Math.max(maxLat, coordinates[0])
        minLong = Math.min(minLong, coordinates[1])
        maxLong = Math.max(maxLong, coordinates[1])
    }

    return {
        minLatitude: minLat,
        maxLatitude: maxLat,
        minLongitude: minLong,
        maxLongitude: maxLong,
    }
}

/**
 * Select all markers that need highlighting and enable jumping animation on them
 */
function animateHighlightedMarkers() {
    const placemarks = document.querySelectorAll('.highlighted')

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // FIXME extra classes on now unused points,
            //  change to unsubscribing point from the observer
            //  when removing the highlighted class in disablePointsHighlighting
            //  instead keeping the now not highlighted points listening

            if (entry.target.classList.contains("highlighted")){
                if (entry.isIntersecting) {
                    entry.target.classList.add('jumping-marker')
                } else {
                    entry.target.classList.remove('jumping-marker')
                }
            }
        })
    })

    placemarks.forEach(placemark => {
        observer.observe(placemark)
    })
}


/**
 * Add all diners markers to the map
 *
 * @param map
 * @param YMapMarker
 * @return {Promise<void>}
 */
async function setupDiners(map, YMapMarker) {
    const highlightedDinerID = getHighlightedDinerID()
    let mapCenter = [0, 0]
    let boundingBox = {}
    let dinerNetworkName = null
    let dinerLocationCount = 0
    getDiners().then((dinersData) => {
        if (highlightedDinerID != null) {
            switch (mapCenterMode) {
                case "box":
                    boundingBox = calculateBoundingBox(dinersData, highlightedDinerID)
                    break
                case "center":
                    mapCenter = calculateAverageCoordinate(dinersData, highlightedDinerID)
                    break
                default:
                    console.error("Map selection mode not set... Using average coordinates")
                    mapCenter = calculateAverageCoordinate(dinersData, highlightedDinerID)
                    break
            }
        }
        for (let diner of dinersData) {
            let placeID = diner.id
            let dinerID = diner.diner_id
            let name = diner.name
            let coordinates = diner.coordinates
            let reviewed = diner.reviewed
            let fullAddress = diner.full_address

            let markerElement = document.createElement("div")
            let markerIcon = document.createElement("img")

            markerElement.className = "marker diner-marker"
            if (reviewed){
                markerIcon.src = "/static/images/restaurant_colored.png"
            } else {
                markerIcon.src = "/static/images/restaurant.png"
            }
            if (highlightedDinerID === dinerID) {
                dinerNetworkName = name
                markerElement.className += " highlighted"
                dinerLocationCount += 1
            }

            markerElement.appendChild(markerIcon)


            let marker = new YMapMarker(
                {
                    coordinates: prepareCoordinates(coordinates),
                    onFastClick: () => {
                        if (getHighlightedDinerID() !== dinerID) {
                            disablePointsHighlighting()
                        }
                        markerElement.classList.add("highlighted")

                        fillDinerSidePanel(dinerID, name, coordinates, reviewed, fullAddress, placeID)
                    }
                },
                markerElement
            )
            map.addChild(marker)
        }
        if (highlightedDinerID != null) {
            switch (mapCenterMode) {
                case "box":
                    map.setLocation({
                        bounds: [
                            [boundingBox.minLongitude, boundingBox.minLatitude],
                            [boundingBox.maxLongitude, boundingBox.maxLatitude]
                        ]
                    })
                    break
                case "center":
                    map.setLocation({
                        center: mapCenter,
                        zoom: 14
                    })
                    break
                default:
                    console.error("Map selection mode not set... Using average coordinates")
                    map.setLocation({
                        center: mapCenter,
                        zoom: 14
                    })
                    break
            }

            animateHighlightedMarkers()
            fillDinerNetworkSidePanel(highlightedDinerID, dinerNetworkName, dinerLocationCount)
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
