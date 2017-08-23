
angular.module('myApp')
.controller('monitoringCtrl', ['$scope', '$location','$timeout', 'Page','ngDialog', 'fbApp', 'userDetails','mySnack', function($scope,$location,$timeout,Page,ngDialog, fbApp, userDetails,mySnack) {

  Page.setTitle("Monitoring");
  const auth = fbApp.get().auth();
  const database = fbApp.get().database();
  
  $scope.affected = "test";
  $scope.isAdd = false;
  $scope.isSupAdmin = false;
  $scope.confirm = [];
  $scope.calamity = 'Typhoon';

  var card = document.getElementById('pac-card');
  var add = document.getElementById('btn_add_area');
  var dialog = document.querySelector('dialog');
  var input = document.getElementById('pac-input');
  var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');
  


  function initMap(){
    var options =  {
  types: ['(cities)'],
  componentRestrictions: {country: 'ph'}
};
    $scope.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 12.2528791, lng: 121.1052001},
      zoom: 6
    });

    $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(add);
    $scope.autocomplete = new google.maps.places.Autocomplete(input,options);

    $scope.autocomplete.bindTo('bounds', $scope.map);

    $scope.infowindow = new google.maps.InfoWindow();
    $scope.infowindowContent = document.getElementById('infowindow-content');
    $scope.infowindow.setContent($scope.infowindowContent);
    $scope.marker = new google.maps.Marker({
      setMap : $scope.map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    $scope.autocomplete.addListener('place_changed', function() {
      $scope.infowindow.close();
      $scope.marker.setVisible(false);
      var place = $scope.autocomplete.getPlace();
      if (!place.geometry) {
        mySnack.show("No details available for input: '" + place.name + "'");
        return;
      }


      if (place.geometry.viewport) {
        $scope.map.fitBounds(place.geometry.viewport);
      } else {
        $scope.map.setCenter(place.geometry.location);
        $scope.map.setZoom(17); 
      }
      $scope.marker.setPosition(place.geometry.location);
      $scope.marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      $scope.confirm = [
      'add',
      place.geometry.location.lat(),
      place.geometry.location.lng(),
      address,
      $scope.calamity];

      dialog.showModal();

      //$scope.infowindowContent.children['place-icon'].src = place.icon ;
      $scope.infowindowContent.children['place-name'].textContent = place.name;
      $scope.infowindowContent.children['place-address'].textContent = address;
      $scope.infowindow.open($scope.map, $scope.marker);
    });

    $scope.autocomplete.setTypes([]);
    
  }

    

  if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }

  dialog.querySelector('#confirm-proceed').addEventListener('click', function() {
    if ($scope.confirm[0] == 'add') {
      saveLocation(
        $scope.confirm[1],
        $scope.confirm[2],
        $scope.confirm[3],
        $scope.confirm[4]
        );
    } else {
      database.ref('affected_areas/' + $scope.confirm[1]).remove();
      mySnack.show("Successfully removed!");
    }
    dialog.close();
  });
  dialog.querySelector('.close').addEventListener('click', function() {
    dialog.close();
  });


  function uniqId() {
    return Math.round(new Date().getTime() + (Math.random() * 100));
  }

  function saveLocation(lat,lng,loc,cal){ 
    database.ref('affected_areas/' + uniqId()).set({
      latitude: lat,
      location: loc,
      longitude : lng,
      calamity : cal
    });
    mySnack.show("Successfully added!");
  }

  $scope.deleteArea = function(id){
    $scope.confirm = ['delete',id];

    dialog.showModal();
  }


  $scope.initSearchMap = function(){
    $scope.isAdd = true;
  };

  $scope.initDataMap = function(){
   $scope.isAdd = false;
 };




$timeout(function() {
  $scope.userData = userDetails.get();
  if ($scope.userData != null && $scope.userData.type == 'super-admin') {
    $scope.isSupAdmin = true;
  } else {
    $scope.isSupAdmin = false;
    add.style.display = 'none';
  }
  console.log(userDetails.get().type);
}, 2000);

database.ref('affected_areas').on('value', function(snapshot) {
  $scope.affected = snapshot.val();
  initMap();

  angular.forEach($scope.affected, function(value, key) {
    $scope.marker = new google.maps.Marker({
      animation: google.maps.Animation.BOUNCE,
      position: new google.maps.LatLng(value.latitude, value.longitude),
      map: $scope.map
    });

    google.maps.event.addListener($scope.marker, 'click', (function(marker) {
      return function() {
        $scope.infowindow.setContent(value.location);
        $scope.infowindow.open($scope.map, $scope.marker);
      }
    })($scope.marker));
  });
  $scope.initDataMap();
  $scope.$apply();
});


}]);
