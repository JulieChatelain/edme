app.directive("conditionForm", ['$log','Utils', 'DBService','RestService', function($log, Utils, DBService, RestService) {
    return {
        templateUrl : "formCondition.html",
        link: function($scope, $element, $attrs) {
        	
        	// We use the same form for creation and update of patient informations

        	var edit = false;
        	var create = false;
        	
        	/**
        	 * Initialize the "new condition" variable
        	 */
        	var newCondition = function(){
        		return {
        				patient: {
        					reference: $scope.patient._id,
    						display : $scope.patient.name.given[0] + " " + $scope.patient.name.family[0]
        				},
        				dateRecorded : new Date(),
        				clinicalStatus: 'active',
        				code: {
        					text : ''
        				},
        				onsetDateTime: new Date(),
        				abatementDateTime : null,
        				notes: '',
    				    relatedUsers:[$scope.userId],
    					lastUpdated : new Date(),
						shared : false,
						hasBeenShared : false,
        			};
        	};   
        	
        	
        	/**
        	 * 
        	 */
        	var createForm = {
        			title : "Ajouter",
        			submit: "Ajouter"
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
        	$scope.editCondition = function(condition) {
        		edit = true;
        		$scope.conditionToEdit = condition;
        		$scope.formInfo = editForm;
        		// Manually open the modal containing the condition form.
        		$("#conditionModal").modal();        		
        	};
        	
        	/**
        	 * 
        	 */
        	$scope.createCondition = function(){
        		create = true;
        		$scope.conditionToEdit = newCondition();
        		$scope.formInfo = createForm;
        		// Manually open the modal containing the patient form.
        		$("#conditionModal").modal();
        	};
        	    
        	/**
        	 * Create a condition and reload the condition list.
        	 */
        	$scope.saveCondition = function() {
        		if($scope.conditionToEdit.code.text != '' && $scope.conditionToEdit.onsetDateTime){
        			// It's a new condition
        			if(create)
	        			DBService.createCondition($scope.userId, $scope.conditionToEdit, 
	        				function(err, savedCondition) {
	        					if (!err) {
		    						$('#conditionModal').modal('hide');    
		    						$scope.confirmation = "Les données ont été correctement sauvées.";  
		    						$scope.loadPatientData($scope.userId, $scope.patient._id);
		    						$scope.$apply();
	        						   						
	        					} else {
	        						$scope.error = "Une erreur a été rencontrée lors de"
	        								+ " l'ajout de la maladie. (Erreur : "
	        								+ err + ")";
	        					}
	        			});
        			// It's an existing condition
        			else
        				// update condition
        				DBService.updateCondition($scope.userId, $scope.conditionToEdit, 
	        				function(err, numReplaced) {
	        					if (!err) {

		    						$('#conditionModal').modal('hide');    
		    						$scope.confirmation = "Les données ont été correctement sauvées.";  
		    						
        							if($scope.serverConnection && $scope.condition.shared){
		        						RestService.updateResource($scope.user, $scope.patient, $scope.conditionToEdit, 'Condition'
		        								, function(success, message){
		        							if(success){
		        								// note the date for last shared
		        								var lastShared = new Date();
		        								DBService.conditionSharing($scope.userId, $scope.conditionToEdit
		        										, true, $scope.patient.idOnServer, lastShared
		        								, function(err){
		        		    						$scope.loadPatientData($scope.userId, $scope.patient._id);
		        		    						$scope.$apply(); 
		        									});
		        							}
		        						});
        							}else{
    		    						$scope.loadPatientData($scope.userId, $scope.patient._id);
    		    						$scope.$apply();        								
        							}
	        						
	        						      						
	        					} else {
	        						$scope.error = "Une erreur a été rencontrée lors de"
	        								+ " la modification. (Erreur : "
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