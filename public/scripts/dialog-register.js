	
angular.module('myApp')
.controller('dialogRegCtrl', function($scope) {
	$scope.txtRegEmail = "";
	
	const auth = firebase.auth();
	
	$scope.onRegisterSubmit = function(data){
		console.log(data);
		if (data.$valid && data.txtRegPassword.$viewValue ==  data.txtVerify.$viewValue) {
			auth.createUserWithEmailAndPassword(data.txtRegEmail.$viewValue,data.txtRegPassword.$viewValue).then(function(){
				alert("Successfully registered, please proceed to your inbox to verify your account.");
				auth.currentUser.sendEmailVerification();
				$scope.closeThisDialog();
			}, function(e) {
				console.log(e);
			})
		} else {
			alert("Invalid inputs");
		}
	}

});