angular.module('myApp')

.controller('loginCtrl', function($scope, ngDialog, fbApp) {


	var auth = fbApp.get().auth();
	var database = fbApp.get().database();
	
	var loading = document.getElementById('progressBar');
	var txtEmail = document.getElementById('txtEmail');
	var txtPassword = document.getElementById('txtPassword');
	var dialog = document.querySelector('dialog');
	var snackbarContainer = document.getElementById('login-snackbar');
	if (! dialog.showModal ) {
      dialogPolyfill.registerDialog(dialog);
    }

	$scope.logIn = function(){
		if (txtEmail.value != null && txtPassword.value != null) {
			loading.classList.add('is-active');

			auth
			.signInWithEmailAndPassword(txtEmail.value,txtPassword.value)
			.catch(e => {
				showSnack(e.message)
				loading.classList.remove('is-active');
			});
		}
	}

	$scope.signUp = function(){
		dialog.showModal();
	}
	dialog.querySelector('.close').addEventListener('click', function() {
      dialog.close();
    });

    $scope.txtRegEmail = txtEmail.value;
	
	$scope.onRegisterSubmit = function(data){
		console.log(data);
		if (data.$valid && txtRegPassword.value ==  txtVerify.value) {
			auth.createUserWithEmailAndPassword(txtRegEmail.value,txtRegPassword.value).then(function(){
				showSnack("Successfully registered, please proceed to your inbox to verify your account.");
				auth.currentUser.sendEmailVerification();
				dialog.close();
			}, function(e) {
				console.log(e);
				showSnack(e.message);
			})
		} else {
			showSnack("Invalid inputs");
		}
	}

	auth.onAuthStateChanged(firebaseUser => {
		if (firebaseUser) {
			if(firebaseUser.emailVerified){

				database.ref('/users/' + auth.currentUser.uid).once('value').then(function(snapshot) {
					//userDetails.set(snapshot.val());
					if (snapshot.val() != null && snapshot.val().type != 'user' && snapshot.val().status != 'in-active') {
						showSnack("Logging in");
						setTimeout(function() {
							window.location.href = 'views/main.html';
						}, 2000);
					} else if (snapshot.val() == null) {
						showSnack("Welcome new user!");
						database.ref('/users/' + auth.currentUser.uid).set({
							id: auth.currentUser.uid,
							email : auth.currentUser.email,
							type : "admin",
							status : "new"
						});
						setTimeout(function() {
							window.location.href = 'views/main.html';
						}, 2000);
					} else {
						showSnack("Need an admin account to proceed.");
						auth.signOut();
					}
				});
			} else {
				showSnack("Account not yet verified.");

			}
			//console.log(firebaseUser);
			loading.classList.remove('is-active');
		} else {
			loading.classList.remove('is-active');
		}
	})

	function showSnack(msg){
		var data = {
			message: msg,
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(data);
	}

});