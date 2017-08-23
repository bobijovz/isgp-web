
angular.module('myApp')
.controller('mainCtrl', ['$scope', '$location','ngDialog', 'Page', 'fbApp', 'userDetails', 'mySnack', function($scope, $location,ngDialog, Page, fbApp, userDetails, mySnack) {
	

	var auth = fbApp.get().auth();
	var database = fbApp.get().database();
	mySnack.set(document.getElementById('main-snackbar'));
	var dialog = document.querySelector('dialog');
	if (! dialog.showModal) {
		dialogPolyfill.registerDialog(dialog);
	}

	
	$scope.Page = Page;

	$scope.logOut = function(){
		auth.signOut();
	}


	

	$scope.onProfileUpdate = function(data){
		console.log(data);
		if (data.$valid) {
			firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
				id: firebase.auth().currentUser.uid,
				name: data.txtRegName.$viewValue,
				email : data.txtRegEmail.$viewValue,
				contact : data.txtRegContact.$viewValue,
				birthdate : data.txtRegBirthdate.$viewValue,
				type : "admin",
				status : "active"
			});
			showSnack("Profile successfully updated.");
			dialog.close();
		} else {
			showSnack("Please complete you profile with valid inputs.");
		}
	}


	auth.onAuthStateChanged(firebaseUser => {

		if (firebaseUser) {
			
			database.ref('/users/' + firebaseUser.uid).once('value').then(function(snapshot) {
				userDetails.set(snapshot.val());
				console.log(userDetails.get());
				$scope.$apply(function() {
					//$location.path('/monitoring');
					if (snapshot.val().status == 'new') {
						$scope.txtRegEmail = userDetails.get().email;
						dialog.showModal();


					/*ngDialog.open({
						template: '../views/dialog_profiling.html',
						className: 'ngdialog-theme-default',
						controller: 'dialogProfileCtrl',
						scope: $scope,
						closeByEscape: false,
						closeByNavigation: false,
						closeByDocument: false,
						showClose: false
					});*/
				}
			});

				
				
			});
			
		} else {
			showSnack('Logging out');
			setTimeout(function() {
				window.location.href = '../index.html';
			}, 2000);
			
		}
	});

	function showSnack(msg){

		var snackbarContainer = document.getElementById('main-snackbar');
		var data = {
			message: msg,
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(data);
	}


}]);