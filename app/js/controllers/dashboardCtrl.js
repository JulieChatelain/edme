app.controller('dashboardCtrl', function($scope, $log, $state, $window,
		DBService) {

	var userId = "";
	$scope.error = "";

	if (!$window.localStorage.token) {
		$scope.loggedIn = false;
		$state.transitionTo('login');
	} else {
		$scope.loggedIn = true;
		userId = $window.localStorage.token;
	}
	
	$scope.patientsNameFilter = "";

	$scope.newPatient = {
		firstname : "",
		lastname : "",
		gender : "F",
		age : 20
	};

	$scope.loadPatientList = function() {
		DBService.findPatients(userId, function(err, patients) {
			if (!err) {
				$scope.patients = patients;
				$scope.$apply();
			} else {
				$scope.error = "Une erreur a été rencontrée lors du"
						+ " chargement de la liste des patients. (Erreur : "
						+ err + ")";
			}
		});
	};

	$scope.loadPatientList();

	$scope.openModal = function(){
		$("#patientModal").modal() 
		$scope.$apply();
	};
	
	$scope.createNewPatient = function() {
		DBService.createPatient(userId, $scope.newPatient.firstname,
			$scope.newPatient.lastname, $scope.newPatient.gender,
			$scope.newPatient.age, function(err, savedPatient) {
				if (!err) {
					$scope.loadPatientList();
					$('#patientModal').modal('hide');
				} else {
					$scope.error = "Une erreur a été rencontrée lors de"
							+ " la création du nouveau patient. (Erreur : "
							+ err + ")";
				}
		});
	};

});