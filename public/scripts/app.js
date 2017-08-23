angular.module('myApp',['ngRoute','ngDialog'])
.value('fbConfig', {
	apiKey: "AIzaSyBe2S2pfk22ukZvH3o-se7fN-6LFHc2MXg",
	authDomain: "isagip-d2c44.firebaseapp.com",
	databaseURL: "https://isagip-d2c44.firebaseio.com",
	projectId: "isagip-d2c44",
	storageBucket: "isagip-d2c44.appspot.com",
	messagingSenderId: "856922625497"
})
.config(function($routeProvider) {

	$routeProvider
	.when('/', {
		templateUrl : '../views/monitoring.html',
		controller  : 'monitoringCtrl'
	})
	.when('/monitoring', {
		templateUrl : '../views/monitoring.html',
		controller  : 'monitoringCtrl'
	})
	.when('/operations', {
		templateUrl : '../views/operations.html',
		controller  : 'operationsCtrl'
	})
	.when('/request', {
		templateUrl : '../views/request.html',
		controller  : 'requestCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});

})
.factory('Page', function() {
	var title = 'Dashboard';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle; }

	};
})
.factory('fbApp', function(fbConfig){
	return {
		get: function(){
			if (!firebase.apps.length) {
				return firebase.initializeApp(fbConfig);
			} else {
				return firebase;
			}
		}
	}
})
.factory('userDetails', function($location){
	var user = null;
	return {
		set: function(data){
			user = data;
			//$location.path('/monitoring');
		},
		get: function(){
			return user;
		}
	}
})
.factory('mySnack', function(){
	var snack = null;
	return {
		set: function(data){
			snack = data;
		},
		show: function(msg){
			var data = {
			message: msg,
			timeout: 2000
		};
		snack.MaterialSnackbar.showSnackbar(data);
		}
	}
});
