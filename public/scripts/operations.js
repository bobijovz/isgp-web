angular.module('myApp')
		.controller('operationsCtrl', ['$scope','Page','ngDialog', function($scope,Page,ngDialog) {
			Page.setTitle("Operations");


			$scope.showDialog = function(){
				ngDialog.open({
	    		template: 'views/dialog_create_operation.html',
	    		className: 'ngdialog-theme-default custom-width-750'
				});
			};



}]);