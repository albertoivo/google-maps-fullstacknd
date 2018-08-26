function AppViewModel() {
  var self = this
  var markers = []

  self.map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -15.8012908, lng: -47.8675807 },
    zoom: 13
  })

  var largeInfowindow = new google.maps.InfoWindow()
  var bounds = new google.maps.LatLngBounds()

  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location
    var title = locations[i].title

    var marker = new google.maps.Marker({
      map: self.map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    })

    markers.push(marker)

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow)
    })
    bounds.extend(markers[i].position)
  }

  self.map.fitBounds(bounds)

  function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.setContent('')
      infowindow.marker = marker

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null
      })
      var streetViewService = new google.maps.StreetViewService()
      var radius = 50

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation,
            marker.position
          )
          infowindow.setContent(
            '<div>' +
              marker.title +
              '</div><div id="pano"></div><br /><div id="foursquare"></div>'
          )
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          }
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'),
            panoramaOptions
          )
          var foursquare = new google.maps.StreetViewPanorama(
            document.getElementById('foursquare'),
            panoramaOptions
          )
        } else {
          infowindow.setContent(
            '<div>' +
              marker.title +
              '</div>' +
              '<div>No Street View Found</div>'
          )
        }
      }

      streetViewService.getPanoramaByLocation(
        marker.position,
        radius,
        getStreetView
      )

      infowindow.open(self.map, marker)
    }
  }
}

function initMap() {
  ko.applyBindings(new AppViewModel())
}

var locations = [
  {
    title: 'National Congress',
    location: { lat: -15.7997118, lng: -47.8641627 }
  },
  {
    title: 'Mané Garrincha Stadium',
    location: { lat: -15.7835194, lng: -47.8992105 }
  },
  {
    title: 'Toinha Brasil Show',
    location: { lat: -15.8228551, lng: -47.9568887 }
  },
  {
    title: 'Cathedral of Brasília',
    location: { lat: -15.7983419, lng: -47.8755394 }
  },
  {
    title: 'Café Cristina',
    location: { lat: -15.7833516, lng: -47.8785346 }
  },
  {
    title: 'City Park',
    location: { lat: -15.8003432, lng: -47.9078002 }
  },
  {
    title: 'National Theater',
    location: { lat: -15.7922213, lng: -47.8802482 }
  }
]
