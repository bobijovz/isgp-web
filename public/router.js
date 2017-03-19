angular.module('myApp',['ngRoute','ngDialog'])
.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl : 'views/monitoring.html',
				controller  : 'monitoringCtrl'
			})
			.when('/monitoring', {
				templateUrl : 'views/monitoring.html',
				controller  : 'monitoringCtrl'
			})
			.when('/reports', {
				templateUrl : 'views/reports.html',
				controller  : 'reportsCtrl'
			})
			.when('/map', {
				templateUrl : 'views/map.html',
				controller  : 'mapCtrl'
			});
		
})
.controller('loginCtrl', function($scope, $window, ngDialog) {

	//var firebaseObj = new Firebase("https://isagip-d2c44.firebaseio.com"); 
	var config = {
		apiKey: "AIzaSyBe2S2pfk22ukZvH3o-se7fN-6LFHc2MXg",
		authDomain: "isagip-d2c44.firebaseapp.com",
		databaseURL: "https://isagip-d2c44.firebaseio.com",
		storageBucket: "isagip-d2c44.appspot.com",
		messagingSenderId: "856922625497"
	};
	firebase.initializeApp(config);
	const auth = firebase.auth();
	const loading = document.getElementById('progressBar');
	const txtEmail = document.getElementById('txtEmail');
	const txtPassword = document.getElementById('txtPassword');
	var dialog = document.querySelector('dialog');



	$scope.logIn = function(){
		if (txtEmail.value != null && txtPassword.value != null) {
			loading.classList.add('is-active');
			
			const promise = auth.signInWithEmailAndPassword(txtEmail.value,txtPassword.value);
			promise.catch(e => {
				alert(e.message)
				loading.classList.remove('is-active');
			});
		}
	}

	$scope.signUp = function(){
		ngDialog.open({
	    template: 'views/dialog_register.html',
	    className: 'ngdialog-theme-default',
	    controller: 'dialogRegCtrl'
		});
	}

	firebase.auth().onAuthStateChanged(firebaseUser => {
		if (firebaseUser) {
			if(firebaseUser.emailVerified){
				alert("Logged in");
				$window.location.href = '/main.html';
			} else {
				alert("Account not yet verified.");

			}
			console.log(firebaseUser);
			loading.classList.remove('is-active');
		} else {
			loading.classList.remove('is-active');
		}
	})


})
.controller('mainCtrl', function($scope, $window, ngDialog) {
	var config = {
		apiKey: "AIzaSyBe2S2pfk22ukZvH3o-se7fN-6LFHc2MXg",
		authDomain: "isagip-d2c44.firebaseapp.com",
		databaseURL: "https://isagip-d2c44.firebaseio.com",
		storageBucket: "isagip-d2c44.appspot.com",
		messagingSenderId: "856922625497"
	};
	firebase.initializeApp(config);
	const auth = firebase.auth();

	$scope.logOut = function(){
		auth.signOut();
	}

	function isExisting(){
		var userId = firebase.auth().currentUser.uid;
		return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
		  //txtRegEmail.value = firebase.auth().currentUser.email;
		  if (snapshot.val() == null) {

			ngDialog.open({
			    template: 'views/dialog_profiling.html',
			    className: 'ngdialog-theme-default',
			    controller: 'dialogProfileCtrl',
 				scope: $scope,
 				closeByEscape: false,
 				closeByNavigation: false,
 				closeByDocument: false,
 				showClose: false
				});
		  }
		});
	}

	/*function writeUserData(name, email, contact, birthdate, org, position, type, status) {
	  firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
	    id: firebase.auth().currentUser.uid,
	    name: name,
	    email : email,
	    contact : contact,
	    birthdate : birthdate,
	    org : org,
	    position : position,
	    type : "admin",
	    status : "active"
	  });
	}*/

	firebase.database().ref('users').once('value', function(snapshot) {
		  snapshot.forEach(function(childSnapshot) {
			   	console.log(childSnapshot.val());
		  });
	});

	firebase.auth().onAuthStateChanged(firebaseUser => {
		if (firebaseUser) {
			$scope.user = firebaseUser;
			isExisting();
			console.log(firebaseUser);
		} else {
			alert('Logging out');
			window.location.replace('index.html');
		}
	})

});