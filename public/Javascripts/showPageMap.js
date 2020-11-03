	mapboxgl.accessToken = mapToken;
	const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/outdoors-v11', // stylesheet location
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
	new mapboxgl.Popup({offset:25})
	.setHTML(
		`<h3>${campground.name}</h3><p>${campground.location}</p>`//the $ symbol comes in new ejs/javascript syntax
	)
)
.addTo(map);
