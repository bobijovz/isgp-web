angular.module('myApp')
.controller('archivedCtrl', ['$scope','Page','fbApp','mySnack','userDetails', function($scope,Page,fbApp,mySnack,userDetails) {
	Page.setTitle("Archived");

	const database = fbApp.get().database();

	$scope.calamity = 'Typhoon';
	$scope.sCalamity = 'flash_on';
	$scope.filteredOp = [];
	$scope.ratings = [];

	database.ref('feedback').on('value', function(snapshot) {
		$scope.feedback = snapshot.val();
	});

	database.ref('request').on('value', function(snapshot) {
		$scope.request = [];
		angular.forEach(snapshot.val(), function(value, key) {
			if (value.status == 'sent') {
				$scope.request.push(value)
			}
		});
	});


	database.ref('affected_areas').on('value', function(snapshot) {
		$scope.allAffected = snapshot.val();
	});


	database.ref('operations').once('value', function(snapshot) {
		$scope.$apply(function(){
			$scope.operations = snapshot.val();
			filterOp();
			componentHandler.upgradeDom('MaterialMenu', 'mdl-menu');
		});
	});

	$scope.refreshList = function(){
		$scope.selectedOp = null;
		$scope.selectedFeed = [];
		$scope.filteredOp = [];
		filterOp();
	}

	function filterOp(){
		$scope.filteredOp = [];
		angular.forEach($scope.operations, function(value, key) {
			if (value.status == "in-active") {
				if ($scope.allAffected[value.area] != null && $scope.allAffected[value.area].calamity == $scope.calamity) {
					$scope.filteredOp.push(value);
				}
			}
		});
	}


	$scope.selCalamity = function(cal){
		
		$scope.calamity = cal;
		$scope.refreshList();
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

	$scope.logMe = function(data){
		console.log(data);
		$scope.selectedOp = data;
		$scope.selectedFeed = [];
		$scope.opRating = 0;
		$scope.opStatus =  "";
		var temp = [0,0,0,0];
		var tempRate = 0;
		var tempStatus = 0;
		var count = 0;
		//var reqCount = 0;
		angular.forEach($scope.feedback, function(value, key) {
			if (data.id == value.operationId) {
				$scope.selectedFeed.push(value);
				temp[0] += parseInt(value.food != "false" ? value.food : 0);
				temp[1] += parseInt(value.clothes != "false" ? value.clothes : 0);
				temp[2] += parseInt(value.medicine != "false" ? value.medicine : 0);
				temp[3] += parseInt(value.othersRate != "false" ? value.othersRate : 0);
				tempRate += parseInt(value.rating != "false" ? value.rating : 0);
				count++;
			}
		});
		/*angular.forEach($scope.request, function(value, key) {
			if (data.id == value.operationId) {
				reqCount++;
			}
		});*/
		console.log("count : " + count);
		console.log("rate : " + tempRate);
		$scope.opRating = isNaN(tempRate/count) ? 0 : (tempRate/count).toFixed(1);
		$scope.ratings[0] = isNaN(temp[0]/count) ? 0 : (temp[0]/count).toFixed(1);
		$scope.ratings[1] = isNaN(temp[1]/count) ? 0 : (temp[1]/count).toFixed(1);
		$scope.ratings[2] = isNaN(temp[2]/count) ? 0 : (temp[2]/count).toFixed(1);
		$scope.ratings[3] = isNaN(temp[3]/count) ? 0 : (temp[3]/count).toFixed(1);
		$scope.opStatus = count;
	}

	$scope.printNow = function() {
		if ($scope.selectedOp != null) {
			var innerContents = document.getElementById("printableDiv").innerHTML;
			var popupWinindow = window.open('', '_blank', 'width=700,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
			popupWinindow.document.open();
			popupWinindow.document.write('<html><head><style type="text/css"> table { border-collapse: collapse; width: 100%; margin:20px 0px;} table, th, td {	border: 1px solid gray;	} th { vertical-align: middle; background: #555555;	color: #fff;} td {	vertical-align: middle;	text-align: left; padding: 15px;}</style></head><body onload="window.print()">' + innerContents + '</html>');
			popupWinindow.document.close();
		} else {
			mySnack.show("Error, Please select an operation to print.");
		}
	}

	/*$scope.saveNow = function() {
		
		if ($scope.selectedOp != null) {
			var innerContents = document.getElementById("printableDiv").innerHTML;
			var popupWinindow = window.open('', '_blank', 'width=700,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
			popupWinindow.document.open();
			popupWinindow.document.write('<html><head><style type="text/css"> table { border-collapse: collapse; width: 100%; margin:20px 0px;} table, th, td {	border: 1px solid gray;	} th { vertical-align: middle; background: #555555;	color: #fff;} td {	vertical-align: middle;	text-align: left; padding: 15px;}</style></head><body>' + innerContents + '</body><script type="text/javascript" src="../bower_components/jspdf/dist/jspdf.min.js"></script><script type="text/javascript" src="../bower_components/jspdf/dist/jspdf.debug.js"></script><script>var doc = new jsPDF(); var source = window.document.getElementsByTagName("body")[0]; doc.fromHTML(source,15,15);  window.onload = function() { doc.save("saveInCallback.pdf"); };</script></html>');
			popupWinindow.document.close();


			
		} else {
			mySnack.show("Error, Please select an operation to print.");
		}
	}*/



}]);