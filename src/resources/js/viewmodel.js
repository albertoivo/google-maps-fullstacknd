function AppViewModel() {
  var self = this

  var markers = []

  self.locations = ko.observableArray(locations)

  self.map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -15.8012908, lng: -47.8675807 },
    zoom: 13
  })

  var largeInfowindow = new google.maps.InfoWindow()
  var defaultIcon = makeMarkerIcon('0091ff')
  var highlightedIcon = makeMarkerIcon('FFFF24')
  var bounds = new google.maps.LatLngBounds()

  const CLIENT_ID = '1YBQ5MRZ2OAFCBWN4D5VA0BO4JFIK5HHWOO0U1O5XKR2RBNB'
  const CLIENT_SECRET = 'EMETHNPTZRNMB4HRJF4YNK3SSRE431RXOQKZT3HDLJ1AODOZ'

  for (var i = 0; i < self.locations().length; i++) {
    var position = self.locations()[i].location
    var title = self.locations()[i].title
    var foursquare_id = self.locations()[i].foursquare
    var foursquare_html = ''

    var marker = new google.maps.Marker({
      map: self.map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      icon: defaultIcon
    })

    $.ajax({
      url: 'https://api.foursquare.com/v2/venues/' + foursquare_id,
      type: 'GET',
      async: true,
      datatype: 'json',
      data:
        'client_id=' +
        CLIENT_ID +
        '&client_secret=' +
        CLIENT_SECRET +
        '&v=20180201',
      success: function(data) {
        foursquare_html = '<br>Name: ' + '<br>Address: ' + '<br>Phone: '
      },
      error: function() {}
    })

    markers.push(marker)

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow)
      self.toggleBounce(this)
    })

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon)
    })

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon)
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
      var radius = 500

      var infoWindowContent =
        '<div>' +
        marker.title +
        '</div><div id="pano"></div><br />' +
        foursquare_html

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation,
            marker.position
          )
          infowindow.setContent(infoWindowContent)

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

  self.toggleBounce = function(selectedMarker) {
    self.stopToggleBounce(markers)
    if (selectedMarker.getAnimation() !== null) {
      selectedMarker.setAnimation(null)
    } else {
      selectedMarker.setAnimation(google.maps.Animation.BOUNCE)
    }
  }

  self.stopToggleBounce = function(markers) {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].getAnimation() !== null) {
        markers[i].setAnimation(null)
      }
    }
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

  self.showOnlyFilteredMarkers = function(filteredMarkers) {
    for (var i = 0; i < filteredMarkers.length; i++) {
      filteredMarkers[i].setMap(self.map)
    }
  }

  self.filter = ko.observable()

  self.filteredLocations = ko.computed(function() {
    var filter = self.filter()
    if (!filter) {
      self.showMarkers()
      return self.locations(locations)
    } else {
      self.hideMarkers()
      var filteredMarkers = []
      var filteredlocations = []

      for (let i = 0; i < markers.length; i++) {
        if (markers[i].title.toUpperCase().includes(filter.toUpperCase())) {
          filteredMarkers.push(markers[i])
        }
      }

      for (let i = 0; i < locations.length; i++) {
        if (locations[i].title.toUpperCase().includes(filter.toUpperCase())) {
          filteredlocations.push(locations[i])
        }
      }

      self.showOnlyFilteredMarkers(filteredMarkers)
      self.locations(filteredlocations)
    }
  })

  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
        markerColor +
        '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34)
    )
    return markerImage
  }
}

function initMap() {
  ko.applyBindings(new AppViewModel())
}

var locations = [
  {
    title: 'National Congress',
    location: { lat: -15.7997118, lng: -47.8641627 },
    wikipedia: 'Congresso_Nacional_do_Brasil',
    foursquare: '4c0b9644340720a1a94c8893'
  },
  {
    title: 'Mané Garrincha Stadium',
    location: { lat: -15.7835194, lng: -47.8992105 },
    wikipedia: 'Estádio_Nacional_de_Brasília_Mané_Garrincha',
    foursquare: '4e68bac3152001e1f73bbc72'
  },
  {
    title: 'Toinha Brasil Show',
    location: { lat: -15.8228551, lng: -47.9568887 },
    wikipedia: '',
    foursquare: '5ace9a8fa879213b87f20d36'
  },
  {
    title: 'Cathedral of Brasília',
    location: { lat: -15.7983419, lng: -47.8755394 },
    wikipedia: 'Catedral_Metropolitana_de_Brasília',
    foursquare: '4bd9e2a32a3a0f471fb7a8b6'
  },
  {
    title: 'Café Cristina',
    location: { lat: -15.7833516, lng: -47.8785346 },
    wikipedia: '',
    foursquare: '4c0684e0cf8c76b0b6963a65'
  },
  {
    title: 'City Park',
    location: { lat: -15.8003432, lng: -47.9078002 },
    wikipedia: 'Parque_da_Cidade_Dona_Sarah_Kubitschek',
    foursquare: '4b816f4bf964a520cfa530e3'
  },
  {
    title: 'National Theater',
    location: { lat: -15.7922213, lng: -47.8802482 },
    wikipedia: 'Teatro_Nacional_Cláudio_Santoro',
    foursquare: '4bc24e154cdfc9b65cf39521'
  }
]
