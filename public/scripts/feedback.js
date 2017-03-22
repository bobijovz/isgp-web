angular.module('myApp')
		.controller('feedbackCtrl', ['$scope','Page', function($scope, Page) {
			Page.setTitle("Feedback");

		}]);