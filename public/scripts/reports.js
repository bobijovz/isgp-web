	angular.module('myApp')
		.controller('reportsCtrl',['$scope', function($scope) {

		firebase.database().ref('request').once('value', function(snapshot) {
			var obj = snapshot.val();
			$scope.reports = snapshot.val();
		});
		console.log($scope.reports);

	}]);