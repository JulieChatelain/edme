app.directive("patientDataForm", ['$log','Utils', 'DBService', function($log, Utils, DBService) {
    return {
        templateUrl : "dataForm.html",
        link: function($scope, $element, $attrs) {
        	
        	
        	/**
			 * Initialize the "new data" variable
			 */
        	var newData = function(){
        		return {
	        		dataType: "",
	        		value: "",
	        		unit: "",
	        		dateResult : new Date(),
	        		comments: "",
	        		interpretation : "Bon"
        		}
        	};  
        	
        	/**
			 * 
			 */
        	var addDataForm = {
        			title : "Ajouter des données",
        			submit: "Ajouter",
        			dataTypes : [{name: "HbA1c", units: ["%", "mmol/mol"]}, 
        			             {name: "BNP", units: ["ng/l", "pg/ml"]},
        			             {name: "NT-proBNP", units: ["ng/l", "pg/ml"]}]
        			             
        	};
        	
        	/**
			 * 
			 */
        	$scope.addData = function(){  
        		$scope.newData = newData();
        		$scope.formInfo = addDataForm;
        		// Manually open the modal containing the patient form.
        		$("#dataModal").modal();
        	};
        	

        	$scope.parseData = function(data){        		
        		if(data)
        			return JSON.parse(data);
        		else
        			return null;
        	};
        	
        	/**
			 * Save the new data
			 */
        	$scope.saveData = function() {
        		if($scope.newData.dataType != '' && $scope.newData.value != ''
        			&& $scope.newData.unit != ''){
        			var dataType = JSON.parse($scope.newData.dataType).name;        		
        			DBService.createLabResult($scope.userId, $scope.patient, 
        					dataType, $scope.newData.value, $scope.newData.unit, 
        					$scope.newData.dateResult, $scope.newData.interpretation, 
        					$scope.newData.comments, 
        					function(err, savedData){
		        				if (!err) {
		    						$('#dataModal').modal('hide');    
		    						$scope.confirmation = "Les données ont été correctement sauvées.";  
		    						$scope.loadPatientData($scope.userId, $scope.patient._id);
		    						$scope.$apply();
		        				}else {
		    						$scope.error = "Une erreur a été rencontrée lors de"
										+ " l'ajout de donnée. (Erreur : "
										+ err + ")";  
		    						$scope.$apply();
		        				}        				
        			});
        		}else{
        			$scope.error = "Veuillez remplir tous les champs.";  
        		}
        	};
        	
        }
    };
}]);