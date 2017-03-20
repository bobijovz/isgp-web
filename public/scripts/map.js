var locations = [
		    
		    ['10.115111, 123.639954, 15',  10.115111, 123.639954, 15],//Carcar City, Cebu
		    ['10.115111, 123.639954, 15',  10.115111, 123.639954, 15],//Carcar City, Cebu
		    ['10.243889, 123.833336, 15',  10.243889, 123.833336, 15],//Talisay City, Cebu
		    ['10.243889, 123.833336, 14',  10.243889, 123.833336, 14],//Talisay City, Cebu
		    ['14.733050, 121.145554, 13',  14.733050, 121.145554, 13],//Rodriguez, Quezon City
		    ['14.408133, 121.041466, 12',  14.408133, 121.041466, 12],//Muntinlupa, Metro Manila
		    ['9.740696, 118.730072, 11',  9.740696, 118.730072, 11],//Puerto Princesa, Palawan
		    [' 9.757131, 125.513763, 10',  9.757131, 125.513763, 10],//Surigao City, Surigao del Norte
		    ['15.090024, 120.662842, 9', 15.090024, 120.662842, 9],//City of San Fernando
		    ['10.333333, 123.933334, 8', 10.333333, 123.933334, 8],//Mandaue City, Cebu
		    ['14.852739, 120.816040, 7', 14.852739, 120.816040, 7],//Malolos
		    ['14.676182, 121.156601, 6', 14.676182, 121.156601, 6],//San Mateo, Rizal
		    ['14.187671, 121.125084, 1', 14.187671, 121.125084, 1],//Calamba, Laguna
		      ['14.651894, 121.121567, 4', 14.651894, 121.121567, 4],//Marikina
		      ['14.796128, 120.877419, 5',14.796128, 120.877419, 5],//Bulacan
		      ['14.582919, 120.979683, 3',14.582919, 120.979683, 3],//Rizal Park, Roxas Boulevard, Manila
		      ['14.651489, 121.049309, 2', 14.651489, 121.049309, 2],//Quezon Memorial Circle, Quezon City, Metro Manila
		    ];


angular.module('myApp')
	.controller('mapCtrl',['$scope', function($scope) {
		console.log("Map");

		var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(12.355346, 121.060509),
        mapTypeId: google.maps.MapTypeId.ROADMAP
	    }

	    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

	    var marker, i;
	    
	    var infoWindow = new google.maps.InfoWindow();
	    
		    for (i = 0; i < locations.length; i++) {  
		        marker = new google.maps.Marker({
		        animation: google.maps.Animation.BOUNCE,
		        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
		        map: $scope.map
	    	});

	      google.maps.event.addListener(marker, 'click', (function(marker, i) {
	        return function() {
	          infowindow.setContent(locations[i][0]);
	          infowindow.open(map, marker);
	        }
	      })(marker, i));
	    } 
		/*function initMap() {

		

		  var map = new google.maps.Map(document.getElementById('map'), {
		    zoom: 4,
		    center: new google.maps.LatLng(12.355346, 121.060509),
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		  });
		  var infowindow = new google.maps.InfoWindow();
		  var marker, i;

		    for (i = 0; i < locations.length; i++) {  
		      marker = new google.maps.Marker({
		    animation: google.maps.Animation.BOUNCE,
		        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
		        map: map
		      });

		      google.maps.event.addListener(marker, 'click', (function(marker, i) {
		        return function() {
		          infowindow.setContent(locations[i][0]);
		          infowindow.open(map, marker);
		        }
		      })(marker, i));
		    } 
	};*/
	
	
}]);

