angular.module('myApp')
		.controller('dialogProfileCtrl',['$scope', function($scope) {
			$scope.txtRegEmail = $scope.user.email;

			$scope.onProfileUpdate = function(data){
				console.log(data);
				if (data.$valid) {
					firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
					    id: firebase.auth().currentUser.uid,
					    name: data.txtRegName.$viewValue,
					    email : data.txtRegEmail.$viewValue,
					    contact : data.txtRegContact.$viewValue,
					    birthdate : data.txtRegBirthdate.$viewValue,
					    org : data.txtRegOrganization.$viewValue,
					    position : data.txtRegPosition.$viewValue,
					    type : "admin",
					    status : "active"
					});
					$scope.closeThisDialog();
				} else {
					alert("Please complete you profile with valid inputs.");
				}
			}



}]);