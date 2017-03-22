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
			.when('/feedback', {
				templateUrl : 'views/feedback.html',
				controller  : 'feedbackCtrl'
			})
			.when('/sender', {
				templateUrl : 'views/sender.html',
				controller  : 'senderCtrl'
			})
			.when('/operations', {
				templateUrl : 'views/operations.html',
				controller  : 'operationsCtrl'
			})
			.when('/map', {
				templateUrl : 'views/map.html',
				controller  : 'mapCtrl'
			});
		
})
.factory('Page', function() {
   var title = 'Dashboard';
   return {
     title: function() { return title; },
     setTitle: function(newTitle) { title = newTitle }
   };
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
		console.log(firebaseUser);
		if (firebaseUser) {
			if(firebaseUser.emailVerified){
				firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
					if (snapshot.val().type == 'admin') {
						alert("Logged in");
						$window.location.href = '/main.html';
					} else {
						alert("Need an admin accout to proceed.");
						firebase.auth().signOut();
					}
				});
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
.controller('mainCtrl', function($scope, $window, ngDialog, Page) {
	$scope.Page = Page;
	$scope.reports;
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

	$scope.showNotif = function(){
		alert("Underconstruction");
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

	firebase.database().ref('request').once('value', function(snapshot) {
		var obj = snapshot.val();
		$scope.reports = snapshot.val();
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