app.directive("patientForm", ['$log','Utils', 'DBService', function($log, Utils, DBService) {
    return {
        templateUrl : "patientForm.html",
        link: function($scope, $element, $attrs) {
        	
        	// We use the same form for creation and update of patient informations

        	var edit = false;
        	var create = false;
        	
        	/**
        	 * Initialize the "new patient" variable
        	 */
        	var newPatient = function(){
        		var birthday = new Date();
        		birthday.setFullYear(birthday.getFullYear() - 20);
        		return {
        				firstname : "",
        				lastname : "",
        				gender : "F",
        				age : 20,
        				birthDate : birthday
        			};
        	};   
        	/**
        	 * Get the infos to fill the form from the selected patient.
        	 */
        	var getPatientToEdit = function(){
        		var pAge = $scope.age($scope.patient.birthDate);
        		return {
        			id : $scope.patient._id,
        			firstname  : $scope.patient.name.given[0],
        			lastname : $scope.patient.name.family[0],
        			gender : $scope.patient.gender,
        			age : pAge,
        			birthDate : $scope.patient.birthDate
        		};
        	};
        	
        	/**
        	 * 
        	 */
        	var createForm = {
        			title : "Créer un nouveau patient",
        			submit: "Créer"
        	};
        	
        	/**
        	 * 
        	 */
        	var editForm = {
        			title : "Modifier",
        			submit: "Modifier"
        	};
        	
        	/**
        	 * 
        	 */
        	$scope.editPatient = function() {
        		edit = true;
        		$scope.patientToEdit = getPatientToEdit();
        		$scope.formInfo = editForm;
        		// Manually open the modal containing the patient form.
        		$("#patientModal").modal();        		
        	};
        	
        	/**
        	 * 
        	 */
        	$scope.createPatient = function(){
        		create = true;
        		$scope.patientToEdit = newPatient();
        		$scope.formInfo = createForm;
        		// Manually open the modal containing the patient form.
        		$("#patientModal").modal();
        	};
        	        	
        	/**
        	 * Adjust the birthday of the new patient according to his age
        	 */
        	$scope.adjustBirthDate = function(){
        		var birthday = new Date();
        		birthday.setFullYear(birthday.getFullYear() - $scope.patientToEdit.age);
        		$scope.patientToEdit.birthDate = birthday;
        	};
        	
        	/**
        	 * Adjust the age of the new patient according to his birthDate
        	 */
        	$scope.adjustAge = function(){
        		$scope.patientToEdit.age = Utils.calculateAge($scope.patientToEdit.birthDate);
        	};
        	

        	/**
        	 * Create a patient and reload the patient list.
        	 */
        	$scope.savePatient = function() {
        		if($scope.patientToEdit.firstname != '' && $scope.patientToEdit.lastname != ''
        			&& $scope.patientToEdit.gender != ''){
        			// It's a new patient
        			if(create)
	        			DBService.createPatient($scope.userId, $scope.patientToEdit.firstname,
	        				$scope.patientToEdit.lastname, $scope.patientToEdit.gender,
	        				$scope.patientToEdit.age, $scope.patientToEdit.birthDate, 
	        				function(err, savedPatient) {
	        					if (!err) {
	        						$scope.loadPatientList();
	        						$('#patientModal').modal('hide');
	        						$scope.patient = savedPatient;        						
	        					} else {
	        						$scope.error = "Une erreur a été rencontrée lors de"
	        								+ " la création du nouveau patient. (Erreur : "
	        								+ err + ")";
	        					}
	        			});
        			// It's an existing patient
        			else
        				DBService.updatePatient($scope.userId, $scope.patientToEdit.id, $scope.patientToEdit.firstname,
	        				$scope.patientToEdit.lastname, $scope.patientToEdit.gender,
	        				$scope.patientToEdit.age, $scope.patientToEdit.birthDate, 
	        				function(err, numReplaced) {
	        					if (!err) {
	        						$scope.loadPatientList();
	        						$scope.selectPatient($scope.patientToEdit.id);
	        						$('#patientModal').modal('hide');
	        						$scope.confirmation = "Le patient a été correctement modifié.";        						
	        					} else {
	        						$scope.error = "Une erreur a été rencontrée lors de"
	        								+ " la création du nouveau patient. (Erreur : "
	        								+ err + ")";
	        					}
    	        		});
        				
        		}else{
        			$scope.error = "Veuillez remplir tous les champs.";
        		}
				create = false;
				edit = false;
        	};
        	
        }
    };
}]);