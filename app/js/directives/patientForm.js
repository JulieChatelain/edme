app.directive("patientForm", ['$log','Utils', 'DBService', function($log, Utils, DBService) {
    return {
        templateUrl : "patientForm.html",
        link: function($scope, $element, $attrs) {

        	/**
        	 * Initialize the "new patient" variable
        	 */
        	var initNewPatient = function(){
        		var birthday = new Date();
        		birthday.setFullYear(birthday.getFullYear() - 20);
        		$scope.newPatient = {
        				firstname : "",
        				lastname : "",
        				gender : "F",
        				age : 20,
        				birthDate : birthday
        			};
        	}
        	
        	initNewPatient();
        	
        	/**
        	 * Adjust the birthday of the new patient according to his age
        	 */
        	$scope.adjustBirthDate = function(){
        		var birthday = new Date();
        		birthday.setFullYear(birthday.getFullYear() - $scope.newPatient.age);
        		$scope.newPatient.birthDate = birthday;
        	};
        	
        	/**
        	 * Adjust the age of the new patient according to his birthDate
        	 */
        	$scope.adjustAge = function(){
        		$scope.newPatient.age = Utils.calculateAge($scope.newPatient.birthDate);
        	};
        	

        	/**
        	 * Create a new patient and reload the patient list.
        	 */
        	$scope.createNewPatient = function() {
        		if($scope.newPatient.firstname != '' && $scope.newPatient.lastname != ''
        			&& $scope.newPatient.gender != ''){
        			DBService.createPatient($scope.userId, $scope.newPatient.firstname,
        				$scope.newPatient.lastname, $scope.newPatient.gender,
        				$scope.newPatient.age, $scope.newPatient.birthDate, function(err, savedPatient) {
        					if (!err) {
        						$scope.loadPatientList();
        						initNewPatient();
        						$('#patientModal').modal('hide');
        						$scope.patient = savedPatient;
        						
        					} else {
        						$scope.error = "Une erreur a été rencontrée lors de"
        								+ " la création du nouveau patient. (Erreur : "
        								+ err + ")";
        					}
        			});
        		}else{
        			$scope.error = "Veuillez remplir tous les champs.";
        		}
        	};
        	
        }
    };
}]);