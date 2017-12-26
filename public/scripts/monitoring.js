
angular.module('myApp')
.controller('monitoringCtrl', ['$scope', '$location','$timeout', 'Page','ngDialog', 'fbApp', 'userDetails','mySnack', function($scope,$location,$timeout,Page,ngDialog, fbApp, userDetails,mySnack) {

  Page.setTitle("Monitoring");
  const auth = fbApp.get().auth();
  const database = fbApp.get().database();
  
  $scope.affected = [];
  $scope.filteredAreas = [];
  $scope.isAdd = false;
  $scope.isSupAdmin = false;
  $scope.confirm = [];
  $scope.selectedArea = "Philippines";
  $scope.filteredRequest = [];
  $scope.calamity = 'Typhoon';
  $scope.sCalamity = 'flash_on';
  $scope.heatdata =[];

  var card = document.getElementById('pac-card');
  //var add = document.getElementById('btn_add_area');
  var dialog = document.querySelector('dialog');
  //var input = document.getElementById('pac-input');
  //var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');

  database.ref('affected_areas').on('value', function(snapshot) {
    $scope.affected = [];
   
    angular.forEach(snapshot.val(), function(value, key) {
      if (value.status == 'active') {
        var temp = value;
        temp['id'] = key;
        $scope.affected.push(temp);
        
     }
   });

    
    console.log($scope.affected);
    filterAreas();
  });

  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  $scope.selCalamity = function(cal){
    $scope.selectArea();
    $scope.calamity = cal;
    filterAreas();
    if (cal == 'Fire') {
      $scope.sCalamity = 'whatshot';
    } else if (cal == 'Typhoon') {
      $scope.sCalamity = 'flash_on';
    } else if (cal == 'Earthquake') {
      $scope.sCalamity = 'broken_image';
    } else {
      $scope.sCalamity = 'warning';
    }
  }

  function filterAreas(){
    $scope.filteredAreas = [];
    angular.forEach($scope.affected, function(value, key) {
      if (value.calamity == $scope.calamity) {

      //if (value.status == 'active') {
        //  var temp = value;
          //temp['id'] = key;
          $scope.filteredAreas.push(value);
        //}
        
      }
    });
    console.log($scope.filteredAreas);
  }

  function initNeeds(){
    $scope.Medicine = [0,0];
    $scope.Food = [0,0];
    $scope.Clothes = [0,0];
    $scope.Others = [0,0];
    $scope.familySmall = 0;
    $scope.familyBig = 0;
  }
  initNeeds();
  
  function fetchReport(){
    database.ref('request').once('value', function(snapshot) {
      $scope.$apply(function(){
        $scope.heatdata = [];
        $scope.request = snapshot.val();
        $scope.filteredRequest = $scope.request;
        $scope.initMap();

        angular.forEach($scope.request, function(value, key) {
          var point = new google.maps.LatLng(value.latitude, value.longitude);
          $scope.heatdata.push(point);
        });
        //$scope.initDataMap();
        $scope.generateReport();
        componentHandler.upgradeDom('MaterialMenu', 'mdl-menu');
         $scope.heatmap = new google.maps.visualization.HeatmapLayer({
          data: $scope.heatdata,
          radius: 20
        });
        $scope.heatmap.setMap($scope.map);
        angular.forEach($scope.affected, function(value, key) {
          $scope.marker = new google.maps.Marker({
            position:  new google.maps.LatLng(value.latitude, value.longitude),
            title: value.description,
            map: $scope.map
          });
        });

        //$scope.$apply();
      });
    });
  }
  //fetchReport();



  $scope.generateReport = function(data){
    initNeeds();
    $scope.filteredRequest = [];
    if (data != null) {
      $scope.selectedArea = data.location;
      angular.forEach($scope.request, function(value, key) {
        if (getDistance(data.latitude,data.longitude,value.latitude,value.longitude) < 20) {
          processNeeds(value);
        }
      });
    } else {
      $scope.selectedArea = "Philippines";
      angular.forEach($scope.request, function(value, key) {
        processNeeds(value);
      });
    }
    drawChart();
    //$scope.$apply();
  }

  function processNeeds(value){
    if (value.status == "requested" && Date.daysBetween(new Date(value.date), new Date()) < 31) {

      var index = value.familySize == 'small' ? 0 : 1;
      $scope.familySmall += value.familySize == 'small' ? 1 : 0;
      $scope.familyBig += value.familySize == 'big' ? 1 : 0;
      $scope.filteredRequest.push(value);
      $scope.Medicine[index] += value.medicine == 'true' ? 1  : 0;
      $scope.Food[index] += value.food == 'true' ? 1 : 0;
      $scope.Clothes[index] += value.clothes == 'true' ? 1  : 0;
      $scope.Others[index] += value.others != 'false' ? 1  : 0;
    }
  }

  Date.daysBetween = function( date1, date2 ) {
    var one_day=1000*60*60*24;

    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    var difference_ms = date2_ms - date1_ms;

    return Math.round(difference_ms/one_day); 
  }




  function drawChart() { 
    var totalCount = $scope.Food[0] + $scope.Food[1] + $scope.Clothes[0] + $scope.Clothes[1] + $scope.Medicine[0] + $scope.Medicine[1] + $scope.Others[0] + $scope.Others[1];

    var food = google.visualization.arrayToDataTable([
      ['Needs', 'Percentage'],
      ['Food',     $scope.Food[0] + $scope.Food[1]],
      ['Others',     totalCount - ($scope.Food[0] + $scope.Food[1])],
      ]);
    var clothes = google.visualization.arrayToDataTable([
      ['Needs', 'Percentage'],
      ['Clothes',     $scope.Clothes[0] + $scope.Clothes[1]],
      ['Others',     totalCount - ($scope.Clothes[0] + $scope.Clothes[1])],
      ]);
    var medicine = google.visualization.arrayToDataTable([
     ['Needs', 'Percentage'],
     ['Medicine',     $scope.Medicine[0] + $scope.Medicine[1]],
     ['Others',     totalCount - ($scope.Medicine[0] + $scope.Medicine[1])],
     ]);
    var others = google.visualization.arrayToDataTable([
      ['Needs', 'Percentage'],
      ['Others',     $scope.Others[0] + $scope.Others[1]],
      ['All',     totalCount - ($scope.Others[0] + $scope.Others[1])],
      ]);
    var pieData = google.visualization.arrayToDataTable([
      ['Needs', 'Request'],
      ['Medicine',     $scope.Medicine[0] + $scope.Medicine[1]],
      ['Food', $scope.Food[0] + $scope.Food[1]],
      ['Clothes', $scope.Clothes[0] + $scope.Clothes[1]],
      ['Others', $scope.Others[0] + $scope.Others[1]]
      ]);

    var pieOptions = {
      width: '100%',
      height: '100%',
      legend: 'none'
      /*title: $scope.selectedArea + ' Needs',*/
    };

    var options = {
      pieHole: 0.8,
      pieSliceText: 'percentage',
      pieSliceTextStyle: { color: 'black', fontName: 'Arial', fontSize: 14 },
      tooltip: { trigger: 'none' },
      slices: {
        0: { color: 'lightblue' },
        1: { color: 'lightgray', textStyle : {color:'transparent'} }
      },
      legend: 'none',
      animation:{
        duration: 1000,
        easing: 'in',
      }
    };

    var foodchart = new google.visualization.PieChart(document.getElementById('graph_food'));
    var clotheschart = new google.visualization.PieChart(document.getElementById('graph_clothes'));
    var medicinechart = new google.visualization.PieChart(document.getElementById('graph_medicine'));
    var otherchart = new google.visualization.PieChart(document.getElementById('graph_other'));
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(pieData, pieOptions);
    foodchart.draw(food, options);
    clotheschart.draw(clothes, options);
    medicinechart.draw(medicine, options);
    otherchart.draw(others, options);
  }



  $scope.selectArea = function (item) {
    var lat = item != null ? item.latitude : 12.2528791; 
    var lng = item != null ? item.longitude : 121.1052001;
    var zoom = item != null ? 10 : 5;
    var pt = new google.maps.LatLng(lat, lng);
    $scope.map.setCenter(pt);
    $scope.map.setZoom(zoom);
    $scope.generateReport(item);
  }



  $scope.initMap = function(){
    var options =  {
      types: ['(cities)'],
      componentRestrictions: {country: 'ph'}
    };
    $scope.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 12.2528791, lng: 121.1052001},
      zoom: 5,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      disableDefaultUI: true,
      gestureHandling: 'none',
      zoomControl: false
    });



    //$scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    //$scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(add);
    //$scope.autocomplete = new google.maps.places.Autocomplete(input,options);

    //$scope.autocomplete.bindTo('bounds', $scope.map);

    $scope.infowindow = new google.maps.InfoWindow();
    $scope.infowindowContent = document.getElementById('infowindow-content');
    $scope.infowindow.setContent($scope.infowindowContent);
    $scope.marker = new google.maps.Marker({
      setMap : $scope.map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    /*$scope.autocomplete.addListener('place_changed', function() {
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
      console.log(place);

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

    $scope.autocomplete.setTypes([]);*/

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
      database.ref().child('affected_areas/' + $scope.confirm[1])
      .update({ status: "in-active"});
        database.ref('operations').once('value', function(snapshot) {
            angular.forEach(snapshot.val(), function(value, key) {
              if (value.area == $scope.confirm[1]) {
                database.ref().child('operations/' +value.id).update({ status: "in-active"});
              }
            });
        });


      mySnack.show("Area successfully removed.");
      
    }
    dialog.close();
  });
  dialog.querySelector('.close').addEventListener('click', function() {
    location.reload();
    dialog.close();
  });


  function uniqId() {
    return Math.round(new Date().getTime() + (Math.random() * 100));
  }

  function saveLocation(lat,lng,loc,cal){ 
    if($scope.calamity_title != null && lat != null && lng != null){

      database.ref('affected_areas/' + uniqId()).set({
        description: $scope.calamity_title,
        latitude: lat,
        location: loc,
        longitude : lng,
        calamity : cal,
        status: 'active',
        date: new Date(Date.now()).toLocaleString()
      });

      mySnack.show("Successfully added!");
      /*$timeout(function() {
        location.reload();
      },2000);*/
    } else {
      mySnack.show("Error! Calamity title missing.");
      /*$timeout(function() {
        location.reload();
      },2000);*/

    }
  }

  $scope.deleteArea = function(id){
    $scope.confirm = ['delete',id];
    console.log($scope.confirm);
    dialog.showModal();
  }


  /*$scope.initSearchMap = function(){
    $scope.isAdd = true;
  };

  $scope.initDataMap = function(){
   $scope.isAdd = false;
 };*/




 $timeout(function() {

  try {
    checkUser();
  } catch(err) {
    console.log(err);
    mySnack.show("Something went wrong, refreshing the page.. ");

    $timeout(function() {
      location.reload();
    }, 2000);
  }
  
}, 5000);

 function checkUser(){
  $scope.userData = userDetails.get();
  if ($scope.userData != null && $scope.userData.type == 'super-admin') {
    $scope.isSupAdmin = true;
  } else {
    $scope.isSupAdmin = false;
    add.style.display = 'none';
  }
  fetchReport();
  console.log(userDetails.get().type);
}

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }




}]);
