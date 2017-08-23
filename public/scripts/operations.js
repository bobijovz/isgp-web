angular.module('myApp')
.controller('operationsCtrl', ['$scope','Page','fbApp','mySnack','userDetails', function($scope,Page,fbApp,mySnack,userDetails) {
	Page.setTitle("Operations");

	$scope.operationForm = null;
	$scope.selectedOp = null;
	$scope.listOption = "active";
	$scope.opRating = 0;
	$scope.opStatus = "";

	const auth = fbApp.get().auth();
	const database = fbApp.get().database();
	const messaging = fbApp.get().messaging();
	var input = document.getElementById('txtWhere');


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
		var tempRate = 0;
		var tempStatus = 0;
		var count = 0;
		var reqCount = 0;
		angular.forEach($scope.feedback, function(value, key) {
			if (data.id == value.operationId) {
				$scope.selectedFeed.push(value);
				tempRate += parseInt(value.rating != null ? value.rating : 0);
				count++;
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
		$scope.opStatus = count + "/" + reqCount;
	}

	$scope.refreshList = function(){
		$scope.selectedOp = null;
		$scope.selectedFeed = [];
		$scope.filteredOp = [];
		angular.forEach($scope.operations, function(value, key) {
			if (value.status == $scope.listOption || $scope.listOption == "all") {
				$scope.filteredOp.push(value);
			}
		});
	}

	$scope.archiveThis = function(){
		if ($scope.selectedOp.created_by == userDetails.get().id) {
			firebase.database().ref().child('operations/' + $scope.selectedOp.id)
			.update({ status: "in-active"});
			mySnack.show('Successfully archived');
			dialogConfirm.close();
			refreshOps();
		} 
		
	}

	database.ref('feedback').on('value', function(snapshot) {
		$scope.feedback = snapshot.val();
	});

	database.ref('request').on('value', function(snapshot) {
		$scope.request = snapshot.val();
	});


	database.ref('affected_areas').on('value', function(snapshot) {
		$scope.affected = snapshot.val();
	});


	function refreshOps(){
	database.ref('operations').once('value', function(snapshot) {
		$scope.$apply(function(){
			$scope.operations = snapshot.val();
			$scope.selectedOp = null;
			$scope.selectedFeed = [];
			$scope.refreshList();
		});
	});
	}
	refreshOps();

	function uniqId() {
		return Math.round(new Date().getTime() + (Math.random() * 100));
	}

	$scope.onAddOp = function(data){
		console.log(data);
		if (data.$valid) {
			var geneneratedId = uniqId();
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
			$scope.operationForm = null;
			$scope.txtWhere.value = "";
			mySnack.show("Successfully added!");
			dialogCreate.close();
			refreshOps();
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