angular.module('myApp')
.controller('adminCtrl', ['$scope', '$location','$timeout', 'Page', 'fbApp', 'userDetails','mySnack','http', function($scope,$location,$timeout,Page, fbApp, userDetails,mySnack,http) {

	Page.setTitle("Admin");

	const auth = fbApp.get().auth();
	const database = fbApp.get().database();
	var dialog_confirm = document.getElementById('dialog_confirm');
	var dialog_add = document.getElementById('dialog_add');
	$scope.selectedAdmin = null;


	database.ref('users').on('value', function(snapshot) {
		console.log(snapshot.val());
		$scope.users = [];
		angular.forEach(snapshot.val(), function(value, key) {
			if (value.type == 'admin' && value.status == 'active' || value.status == 'new') {
				$scope.users.push(value);
			}
		});
		$scope.$apply();
		

	});

	$scope.selectAdmin = function(data){
		console.log(data);
		$scope.selectedAdmin = data;
	}

	$scope.onCreateAdmin = function(data){
		console.log(data);
		if (data.$valid ) {
				http.create({
				contact: data.txtRegContact.$viewValue,
				email: data.txtRegEmail.$viewValue,
				eid: data.txtID.$viewValue,
				name: data.txtRegName.$viewValue,
				position: data.txtPosition.$viewValue
			}).then(function(resp){
				mySnack.show("User successfully created.");
				console.log(resp.data);
				dialog_add.close();
				$scope.profileForm = null;
			}).catch(function(error) {
				mySnack.show("Error creating. " + error);
			});
		} else {
			mySnack.show("Invalid inputs");
		}
	}

	$scope.showAdd = function(){

		dialog_add.showModal();

	}

	$scope.deleteUser = function(id){
		$scope.toDelete = id;
		if ($scope.toDelete != null) {
			dialog_confirm.showModal();
		}
	}

	if (! dialog_confirm.showModal) {
		dialogPolyfill.registerDialog(dialog_confirm);
	}

	dialog_confirm.querySelector('#confirm-proceed').addEventListener('click', function() {
		http.delete({id:$scope.toDelete})
		.then(function(resp){
			mySnack.show("User successfully delete.");
			console.log(resp.data);
			$scope.toDelete = null;
			$scope.selectedAdmin = null;
		}).catch(function(error) {
			mySnack.show("Data could not be done." + error);
			$scope.toDelete = null;
		});
		/*database.ref('/users/' + $scope.toDelete).update({
			status : "in-active"
		}).then(function(){
			mySnack.show("User successfully delete.");
			$scope.toDelete = null;
		}).catch(function(error) {
			mySnack.show("Data could not be done." + error);
			$scope.toDelete = null;
		});*/
		dialog_confirm.close();
	});


	dialog_confirm.querySelector('.close').addEventListener('click', function() {
		$scope.toDelete = null;
		dialog_confirm.close();
	});

	if (! dialog_add.showModal) {
		dialogPolyfill.registerDialog(dialog_add);
	}



	/*dialog_add.querySelector('#confirm-proceed').addEventListener('click', function() {
		
		dialog_add.close();
	});*/


	dialog_add.querySelector('.close').addEventListener('click', function() {
		$scope.toDelete = null;
		dialog_add.close();
	});





}]);
