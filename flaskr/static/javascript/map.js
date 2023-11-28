const updateBodyListenersEvent = new Event("updateBodyListeners");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function reflow(elt){
    console.log(elt.offsetHeight);
}

function prepareCoordinates(coordinates) {
    offset = 4 // offset all markers by 4 meters up and left
    y = coordinates[0]
    x = coordinates[1]
    y += offset / 111111
    x -= offset / (111111 * Math.cos(y * Math.PI / 180))

    return [x, y]
}

async function getLyceumBuildings() {
    console.log("Requesting lyceum buildings")
    const response = await fetch("/lyceum_buildings");
    const lyceumBuildingsData = await response.json();

    console.log(lyceumBuildingsData);

    return lyceumBuildingsData
}
async function getDiners() {
    console.log("Requesting diners")

    const response = await fetch("/diners");
    const dinersData = await response.json();

    console.log(dinersData);

    return dinersData
}

function clearDinerSidePanel() {
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = ""

    let sidePanelBody = document.querySelector(".side-panel-body")
    sidePanelBody.innerHTML = ""
}

function fillDinerSidePanel(id, dinerName, position, reviewed) {
    clearDinerSidePanel()
    console.log(`Filled side panel with ${dinerName}`)
    let sidePanelHeader = document.querySelector(".side-panel-header")
    sidePanelHeader.textContent = dinerName

    let sidePanelBody = document.querySelector(".side-panel-body")
    let officialReview = document.createElement("div")
    if (!reviewed) {
        let reviewUrl = "/official_review/" + id;

        officialReview.textContent = "loading now"
        officialReview.className = "official-review"
        officialReview.setAttribute("hx-get",  reviewUrl)
        officialReview.setAttribute("hx-trigger", "load")
        officialReview.setAttribute("hx-target", "this")
        officialReview.setAttribute("hx-swap", "outerHTML")
    }
    sidePanelBody.prepend(officialReview)
    console.log("Firing updateBodyListeners event")

    document.body.dispatchEvent(updateBodyListenersEvent)

    console.log("appended child " + officialReview)
}

function onMapClick(eventType) {
    if (eventType === "hotspot") {
        clearDinerSidePanel()
    }
}

async function initYMapModules() {
    console.log("map loading")
    await ymaps3.ready;

    const {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer} = ymaps3;

    const {YMapDefaultMarker} = await ymaps3.import('@yandex/ymaps3-markers@0.0.1');
    const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

    return {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls, YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl}
}

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
        // Добавление обработчиков на слушатель.
        onClick: ({type, camera, location}) => {onMapClick(type)},
        // onMouseMove: mouseMoveCallback
    });

    map.addChild(mapListener)
    return map
}

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

async function setupDiners(map, YMapMarker) {
    getDiners().then((dinersData) => {
        for (let diner of dinersData) {
            let id = diner.id
            let name = diner.name
            let position = diner.position
            let avg = diner.average_rating
            let reviewed = diner.reviewed
            let reviews = diner.reviews

            let markerElement = document.createElement("div")
            let markerIcon = document.createElement("img")
            // markerIcon.className = "diner-image"
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

async function init(){
    let {
        YMap, YMapDefaultSchemeLayer, YMapMarker, YMapControls,
        YMapListener, YMapDefaultFeaturesLayer, YMapDefaultMarker, YMapZoomControl
    } = await initYMapModules()

    let map = await setupMap(YMap, YMapDefaultSchemeLayer, YMapControls, YMapZoomControl, YMapDefaultFeaturesLayer, YMapListener)

    await setupLyceumBuildings(map, YMapMarker)
    await setupDiners(map, YMapMarker)
}
