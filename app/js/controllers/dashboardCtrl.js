app.controller('dashboardCtrl', function($scope, $log, $state, $window,
		DBService, PatientService, Utils) {
	
	$scope.userId = "";
	
	$scope.confirmation = ""; 	// Confirmation messages go there.
	$scope.error = ""; 			// Error messages go there.

	// Check if the user is correctly connected.
	// Get the user id
	if (!$window.localStorage.token) {
		$scope.loggedIn = false;
		$state.transitionTo('login');
	} else {
		$scope.loggedIn = true;
		$scope.userId = $window.localStorage.token;
	}
	
	// Filters for the patient list
	$scope.patientsNameFilter = "";
	
	$scope.patientsGenderFilter = {
			women: true,
			men: true
	};
	
	/**
	 * Load the user's patient list from the database.
	 */
	$scope.loadPatientList = function() {
		DBService.findPatients($scope.userId, function(err, patients) {
			if (!err) {
				$scope.patients = patients;
				if($scope.patient){
					$scope.selectPatient($scope.patient._id);
				}
				$scope.$apply();
			} else {
				$scope.error = "Une erreur a été rencontrée lors du"
						+ " chargement de la liste des patients. (Erreur : "
						+ err + ")";
			}
		});
	};
	
	$scope.loadPatientList();
	
	$scope.loadPatientData = function(userId, patientId) {
		PatientService.getAllRelatedData(userId, patientId, function(err, patientData){
			if(!err){
				$scope.patientData = patientData;
				$scope.$apply();
			}
			else{
				$scope.error = "Erreur lors du chargenement des données du patient. ("+err+")";
				$scope.$apply();
			}
		});
	};
		
	/**
	 * Compute the age of the patient from his birthdate.
	 */
	$scope.age = function(birthdate){
		return Utils.calculateAge(birthdate);
	};
			
	/**
	 * Change the background color of the selected element in the list.
	 */
	$scope.bgColor= function(patientId){
		if($scope.patient){
			if($scope.patient._id == patientId)
				return '#e8f5e9';
			else
				return 'white';
		}else{
			return 'white';
		}
	};
	
	/**
	 * Find a specific patient in the list via his id and
	 * get all his data.
	 */
	$scope.selectPatient = function(patientId) {
		var len = $scope.patients.length;
		for(var i = 0 ; i < len; ++i){
			if($scope.patients[i]._id == patientId){
				$scope.patient = $scope.patients[i];
				$scope.loadPatientData($scope.userId, patientId);
			}
		}
	};
	
	/**
	 * Remove a patient
	 */
	$scope.deletePatient = function(){
		// First, ask for confirmation
		BootstrapDialog.show({
            title: 'Supprimer ce dossier?',
            message: 'Êtes-vous certain de vouloir supprimer ce dossier?'
            	+ '<br>Il ne pourra pas être récupéré.',
            buttons: [{
                label: 'Supprimer',
                action: function(dialog) {
                	// then delete it
            		DBService.deletePatient($scope.userId, $scope.patient._id, function(err, numRemoved){
            			if(!err && numRemoved == 1) {
            				$scope.confirmation = "Le patient a été correctement supprimé.";
            				$scope.loadPatientList();
            				$scope.patient = null;
            			}else{
            				$scope.error = "Une erreur s'est produite lors de" 
            					+ " la suppression du patient. Veuillez réessayer.";
            			}
            		});
                    dialog.close();
                },
                cssClass: 'btn-danger'
            }, {
                label: 'Annuler',
                action: function(dialog){
                    dialog.close();
                }
            }]
        });
		
		
	};

});