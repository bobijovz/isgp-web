angular.module('myApp')
.controller('requestCtrl', ['$scope','Page','fbApp', function($scope,Page,fbApp) {
	Page.setTitle("Request");
	var database = fbApp.get().database();
	$scope.selectedArea = "All Affected Area ";

	$scope.filteredRequest = [];

	function initNeeds(){
		$scope.Medicine = 0;
		$scope.Water = 0;
		$scope.Food = 0;
		$scope.Clothes = 0;
		$scope.Others = 0;
	}
	initNeeds();
	
	function fetchReport(){
	database.ref('request').once('value', function(snapshot) {
		$scope.$apply(function(){
			$scope.request = snapshot.val();
			$scope.filteredRequest = $scope.request;
			console.log($scope.request);
			$scope.generateReport();
		});
	});
	}
	fetchReport();

	database.ref('affected_areas').once('value', function(snapshot) {
		$scope.affected = snapshot.val();
	});

	$scope.generateReport = function(data){
		initNeeds();
		$scope.filteredRequest = [];
		if (data != null) {
			$scope.selectedArea = data.location;
			
			angular.forEach($scope.request, function(value, key) {

				if (getDistance(
					data.latitude,
					data.longitude,
					value.latitude,
					value.longitude
					) < 20 && value.status == "requested") {
					$scope.filteredRequest.push(value);
				var count = $scope.countHead(value);
				$scope.Medicine += value.medicine ? (1 * count) : 0;
				$scope.Water += value.water ? (1 * count) : 0;
				$scope.Food += value.food ? (1 * count) : 0;
				$scope.Clothes += value.clothes ? (1 * count) : 0;
				$scope.Others += value.others != 'false' ? (1 * count) : 0;

			}
		});
		} else {

			angular.forEach($scope.request, function(value, key) {
				if (value.status == "requested") {
					$scope.filteredRequest.push(value);
					var count = $scope.countHead(value);
					$scope.Medicine += value.medicine ? (1 * count) : 0;
					$scope.Water += value.water ? (1 * count) : 0;
					$scope.Food += value.food ? (1 * count): 0;
					$scope.Clothes += value.clothes ? (1 * count) : 0;
					$scope.Others += value.others != 'false' ? (1 * count) : 0;
				}
			});
			
			$scope.selectedArea = "All Affected Area ";
		}
		drawChart();
	}


	$scope.countHead = function(data){

		var maleCount = 0;
		var femaleCount = 0;
		if (data.requester1 != 'n/a') {
			if (data.requester1Gender == "Male") {
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		if (data.requester2 != 'n/a') {
			if ($scope.request.requester2Gender == "Male") {
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		if (data.requester3 != 'n/a') {
			if ($scope.request.requester3Gender == "Male") {
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		if (data.requester4 != 'n/a') {
			if (data.requester4Gender == "Male") {
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		if (data.requester5 != 'n/a') {
			if ($scope.request.requester5Gender == "Male") {
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		$scope.femaleCount += femaleCount;
		$scope.maleCount += maleCount;
		return femaleCount + maleCount;
	}


	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);


	function drawChart() {

		var data = google.visualization.arrayToDataTable([
			['Needs', 'Request count'],
			['Medicine : '+ $scope.Medicine,     $scope.Medicine],
			['Water : ' +  $scope.Water,      $scope.Water],
			['Food : ' + $scope.Food, $scope.Food],
			['Clothes : ' + $scope.Clothes, $scope.Clothes],
			['Others : ' + $scope.Others,    $scope.Others]
			]);

		var options = {
			width: 900,
			height: 500,
			title: $scope.selectedArea + ' Needs',
		};

		var chart = new google.visualization.PieChart(document.getElementById('piechart'));

		chart.draw(data, options);
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