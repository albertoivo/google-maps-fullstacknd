function AppViewModel() {
  var self = this

  var markers = []

  self.locations = ko.observableArray(locations)

  self.filter = ko.observable()

  self.map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -15.8012908, lng: -47.8675807 },
    zoom: 13
  })

  var largeInfowindow = new google.maps.InfoWindow()
  var bounds = new google.maps.LatLngBounds()

  for (var i = 0; i < self.locations().length; i++) {
    var position = self.locations()[i].location
    var title = self.locations()[i].title

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
              '</div><div id="pano"></div><br /><!--div id="foursquare"></div-->'
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

  self.chooseALocation = function(selectedLocation) {
    for (var i = 0; i < markers.length; i++) {
      if (selectedLocation.title == markers[i].title) {
        selectedLocation = markers[i]
      }
    }
    populateInfoWindow(selectedLocation, largeInfowindow)
  }

  self.showMarkers = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(self.map)
      bounds.extend(markers[i].position)
    }
    self.map.fitBounds(bounds)
  }

  self.hideMarkers = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null)
    }
  }

  self.showOnlyFilteredMarkers = function(markers) {
    console.log('showOnlyFilteredMarkers')
    self.hideMarkers()
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(self.map)
      bounds.extend(markers[i].position)
    }
    self.map.fitBounds(bounds)
  }

  self.filter() = ko.observable()
  self.filteredLocations = ko.computed( function() {
    var filter = self.filter()
    if (!filter) {
        self.showMarkers()
        return self.locations();
    } else {
        self.hideMarkers(self.markers())
        return ko.utils.arrayFilter(self.markers(), function(marker) {
             startsWith = marker.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
             if (startsWith) {
                self.showMarker(marker)
                return true
             }
        })
    }
}, self)

}

function initMap() {
  ko.applyBindings(new AppViewModel())
}

var locations = [
  {
    title: 'National Congress',
    location: { lat: -15.7997118, lng: -47.8641627 },
    wikipedia: 'Congresso_Nacional_do_Brasil'
  },
  {
    title: 'Mané Garrincha Stadium',
    location: { lat: -15.7835194, lng: -47.8992105 },
    wikipedia: 'Estádio_Nacional_de_Brasília_Mané_Garrincha'
  },
  {
    title: 'Toinha Brasil Show',
    location: { lat: -15.8228551, lng: -47.9568887 },
    wikipedia: ''
  },
  {
    title: 'Cathedral of Brasília',
    location: { lat: -15.7983419, lng: -47.8755394 },
    wikipedia: 'Catedral_Metropolitana_de_Brasília'
  },
  {
    title: 'Café Cristina',
    location: { lat: -15.7833516, lng: -47.8785346 },
    wikipedia: ''
  },
  {
    title: 'City Park',
    location: { lat: -15.8003432, lng: -47.9078002 },
    wikipedia: 'Parque_da_Cidade_Dona_Sarah_Kubitschek'
  },
  {
    title: 'National Theater',
    location: { lat: -15.7922213, lng: -47.8802482 },
    wikipedia: 'Teatro_Nacional_Cláudio_Santoro'
  }
]
