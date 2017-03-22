	angular.module('myApp')
		.controller('reportsCtrl',['$scope','Page', function($scope,Page) {
			Page.setTitle( "Reports");
		firebase.database().ref('request').once('value', function(snapshot) {
			var obj = snapshot.val();
			$scope.reports = snapshot.val();
		});
		console.log($scope.reports);

	}]);