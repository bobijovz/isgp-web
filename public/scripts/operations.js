angular.module('myApp')
.controller('operationsCtrl', ['$scope','Page','fbApp','mySnack','userDetails','$location','$timeout', function($scope,Page,fbApp,mySnack,userDetails,$location,$timeout) {
	Page.setTitle("Operations");

	$scope.operationForm = null;
	$scope.selectedOp = null;
	$scope.listOption = "active";
	$scope.opRating = 0;
	$scope.opStatus = "";
	$scope.ratings = [];
	$scope.calamity = 'Typhoon';
	$scope.sCalamity = 'flash_on';
	$scope.allAffected = [];
	$scope.filteredOp = [];
	$scope.foodRate = [];
	$scope.clothesRate = [];
	$scope.medicineRate = [];
	$scope.otherRate = [];
	$scope.dateToday = new Date();
	console.log($scope.dateToday);
	google.charts.load('current', {'packages':['bar']});
    //google.charts.setOnLoadCallback(drawChart);

    

    const auth = fbApp.get().auth();
    const database = fbApp.get().database();
    const messaging = fbApp.get().messaging();
    var input = document.getElementById('txtWhere');


    function refreshList(){
    	$scope.selectedOp = null;
    	$scope.selectedFeed = [];
    	$scope.filteredOp = [];
    }

    database.ref('affected_areas').once('value', function(snapshot) {
    	$scope.affected = [];
    	$scope.allAffected = snapshot.val();
		//console.log($scope.allAffected[1502788884676]);
		angular.forEach(snapshot.val(), function(value, key) {

			if (value.status == 'active') {
				var temp = value;
				temp['id'] = key;
				$scope.affected.push(temp);
			}
		});
		console.log($scope.affected);
	});

    database.ref('feedback').once('value', function(snapshot) {
    	$scope.feedback = snapshot.val();
    });

    database.ref('request').once('value', function(snapshot) {
    	$scope.request =  [];
    	angular.forEach(snapshot.val(), function(value, key) {
    		if (Date.daysBetween(new Date(value.date), new Date()) < 31) {
    			$scope.request.push(value);
    		}	
    	})
    });

    database.ref('operations').on('value', function(snapshot) {
		//$scope.$apply(function(){
			$scope.operations = snapshot.val();
			filterOp();
			componentHandler.upgradeDom('MaterialMenu', 'mdl-menu');
			console.log($scope.operations);

		//});
	});


    function filterOp(){
    	refreshList();
    	angular.forEach($scope.operations, function(value, key) {
    		if (value.status == "active") {
    			if ($scope.allAffected[value.area] != null && $scope.allAffected[value.area].calamity == $scope.calamity) {
    				$scope.filteredOp.push(value);
    			}
    		}
    	});
    	console.log($scope.filteredOp);
    }

	/*
	function refreshOps(){
		$scope.selectedOp = null;
		$scope.selectedFeed = [];
		$scope.refreshList();
	}
	refreshOps();*/

	$scope.selCalamity = function(cal){
		
		$scope.calamity = cal;
		filterOp();
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


	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(12.2528791, 121.1052001));
	var options = {
		bounds: defaultBounds
	};


	$scope.autocomplete = new google.maps.places.Autocomplete(input,options);


	$scope.autocomplete.addListener('place_changed', function() {

		var place = $scope.autocomplete.getPlace();

		if (!place.geometry) {
			mySnack.show("No details available for input: '" + place.name + "'");
			return;
		}

		var address = '';
		if (place.address_components) {

			address = [
			(place.address_components[0] && place.address_components[0].short_name || ''),
			(place.address_components[1] && place.address_components[1].short_name || ''),
			(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		$scope.deploymentData = [
		place.geometry.location.lat(),
		place.geometry.location.lng(),
		address,
		txtWhere.value];

		$scope.$apply();
		$scope.showDialog();

	});


	var dialogCreate = document.getElementById('dialogCreate');
	var dialogConfirm = document.getElementById('dialogConfirm');
	if (!dialogCreate.showModal) {
		dialogPolyfill.registerDialog(dialogCreate);
	}
	if (!dialogConfirm.showModal) {
		dialogPolyfill.registerDialog(dialogConfirm);
	}
	$scope.showDialog = function(){
		dialogCreate.showModal();
	};

	$scope.showConfirm = function(){
		if ($scope.selectedOp.created_by == userDetails.get().id) {
			dialogConfirm.showModal();
		} else {
			mySnack.show('Error, Only the creator can archive this.');
		}
	}

	dialogCreate.querySelector('.close').addEventListener('click', function() {
		$scope.txtWhere.value = "";
		$scope.textArea = {};
		$scope.txtWhen = {};
		$scope.txtDesc = {};
		$scope.txtCount = {};
		$scope.txtWhat = {};
		dialogCreate.close();

	});
	dialogConfirm.querySelector('.close').addEventListener('click', function() {
		dialogConfirm.close();

	});

	$scope.logMe = function(data){
		console.log(data);
		$scope.selectedOp = data;
		$scope.selectedFeed = [];
		$scope.opRating = 0;
		$scope.opStatus =  "";
		$scope.foodRate = [0,0,0,0,0,0];
		$scope.clothesRate = [0,0,0,0,0,0];
		$scope.medicineRate = [0,0,0,0,0,0];
		$scope.otherRate = [0,0,0,0,0,0];
		var temp = [0,0,0,0];
		var tempRate = 0;
		var tempStatus = 0;
		var count = 0;
		var reqCount = 0;
		angular.forEach($scope.feedback, function(value, key) {
			if (data.id == value.operationId) {
				$scope.selectedFeed.push(value);
				temp[0] += parseInt(value.food != "false" ? value.food : 0);
				temp[1] += parseInt(value.clothes != "false" ? value.clothes : 0);
				temp[2] += parseInt(value.medicine != "false" ? value.medicine : 0);
				temp[3] += parseInt(value.othersRate != "false" ? value.othersRate : 0);
				tempRate += parseInt(value.rating != "false" ? value.rating : 0);
				count++;

				$scope.foodRate[parseInt(value.food != "false" ? value.food : 0)]++;
				$scope.clothesRate[parseInt(value.clothes != "false" ? value.clothes : 0)]++;
				$scope.medicineRate[parseInt(value.medicine != "false" ? value.medicine : 0)]++;
				$scope.otherRate[parseInt(value.othersRate != "false" ? value.othersRate : 0)]++

				//Compute Rating and operation status here
			}
		});
		angular.forEach($scope.request, function(value, key) {
			if (getDistance(
				data.latitude,
				data.longitude,
				value.latitude,
				value.longitude
				) < 20 ) {
				reqCount++;
		}
	});
		console.log("count : " + count);
		console.log("rate : " + tempRate);
		$scope.opRating = isNaN(tempRate/count) ? 0 : (tempRate/count).toFixed(1);
		$scope.ratings[0] = isNaN(temp[0]/count) ? 0 : (temp[0]/count).toFixed(1);
		$scope.ratings[1] = isNaN(temp[1]/count) ? 0 : (temp[1]/count).toFixed(1);
		$scope.ratings[2] = isNaN(temp[2]/count) ? 0 : (temp[2]/count).toFixed(1);
		$scope.ratings[3] = isNaN(temp[3]/count) ? 0 : (temp[3]/count).toFixed(1);
		$scope.opStatus = count + "/" + reqCount;
		drawChart();
	}

	

	function drawChart() {
		var data1 = google.visualization.arrayToDataTable([
			["Food", "5 stars","4 stars","3 stars","2 stars","1 star"],
			["*", $scope.foodRate[5],$scope.foodRate[4],$scope.foodRate[3],$scope.foodRate[2],$scope.foodRate[1]]
			]);
		var data2 = google.visualization.arrayToDataTable([
			["Clothes", "5 stars","4 stars","3 stars","2 stars","1 star"],
			["*", $scope.clothesRate[5],$scope.clothesRate[4],$scope.clothesRate[3],$scope.clothesRate[2],$scope.clothesRate[1]]
			]);
		var data3 = google.visualization.arrayToDataTable([
			["Medicine", "5 stars","4 stars","3 stars","2 stars","1 star"],
			["*", $scope.medicineRate[5],$scope.medicineRate[4],$scope.medicineRate[3],$scope.medicineRate[2],$scope.medicineRate[1]]
			]);
		var data4 = google.visualization.arrayToDataTable([
			["Others", "5 stars","4 stars","3 stars","2 stars","1 star"],
			["*", $scope.otherRate[5],$scope.otherRate[4],$scope.otherRate[3],$scope.otherRate[2],$scope.otherRate[1]]
			]);

		var options = {

			legend: { position: "none" },
          	bars: 'horizontal' // Required for Material Bar Charts.
          };

          var chart1 = new google.charts.Bar(document.getElementById('barchart_food'));
          var chart2 = new google.charts.Bar(document.getElementById('barchart_clothes'));
          var chart3 = new google.charts.Bar(document.getElementById('barchart_medicine'));
          var chart4 = new google.charts.Bar(document.getElementById('barchart_others'));

          chart1.draw(data1, google.charts.Bar.convertOptions(options));
          chart2.draw(data2, google.charts.Bar.convertOptions(options));
          chart3.draw(data3, google.charts.Bar.convertOptions(options));
          chart4.draw(data4, google.charts.Bar.convertOptions(options));
      }



      $scope.archiveThis = function(){
      	if ($scope.selectedOp.created_by == userDetails.get().id) {
      		database.ref().child('operations/' + $scope.selectedOp.id)
      		.update({ status: "in-active"});
      		mySnack.show('Successfully archived');
      		dialogConfirm.close();
      		refreshList();
      	} 

      }


      Date.daysBetween = function( date1, date2 ) {
      	var one_day=1000*60*60*24;

      	var date1_ms = date1.getTime();
      	var date2_ms = date2.getTime();

      	var difference_ms = date2_ms - date1_ms;

      	return Math.round(difference_ms/one_day); 
      }



      function uniqId() {
      	return Math.round(new Date().getTime() + (Math.random() * 100));
      }

      $scope.onAddOp = function(data){
      	console.log(data);
      	if (data.$valid) {
      		var geneneratedId = uniqId();
      		console.log(data.textArea.$viewValue);
      		database.ref('operations/' + geneneratedId).set({
      			id: geneneratedId,
      			area: data.textArea.$viewValue,
      			created_by: auth.currentUser.uid,
      			date: data.txtWhen.$viewValue,
      			description: data.txtDesc.$viewValue,
      			location: $scope.deploymentData[2],
      			latitude: $scope.deploymentData[0],
      			longitude: $scope.deploymentData[1],
      			relief_count: data.txtCount.$viewValue,
      			status: "active",
      			title: data.txtWhat.$viewValue
      		});
      		;
      		$scope.txtWhere.value = "";
      		$scope.operationForm = {};
      		mySnack.show("Successfully added!");
      		dialogCreate.close();
      		$scope.textArea = {};
      		$scope.txtWhen = {};
      		$scope.txtDesc = {};
      		$scope.txtCount = {};
      		$scope.txtWhat = {};
			 /*$timeout(function() {
		        location.reload();
		    },2000);*/
		} else {
			mySnack.show("Please complete you profile with valid inputs.");
		}
	}


	$scope.sendNotif = function(token,message){
		var payload = {
			notification: {
				title: "Relief operation near you",
				body: message
			}
		};

		messaging.sendToDevice(token, payload)
		.then(function(response) {
			console.log("Successfully sent message:", response);
		})
		.catch(function(error) {
			console.log("Error sending message:", error);
		});
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