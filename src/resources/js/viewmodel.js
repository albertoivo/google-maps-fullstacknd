function AppViewModel() {
  var self = this

  self.map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -15.8012908, lng: -47.8675807 },
    zoom: 13
  })
}

function initMap() {
  ko.applyBindings(new AppViewModel())
}
