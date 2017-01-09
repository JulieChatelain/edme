app.service('PatientService', ['$log', 'DBService', 'CodeService', function($log, DBService, CodeService) {
	
	this.getAllRelatedData = function(userId, patientId, next) {
		//$log.debug("all related data: userid: " +userId + " pId : " + patientId);
		DBService.findObservations(userId, patientId, 'laboratory', null, null, function(err, labResults){
			//$log.debug("data : " + JSON.stringify(labResults));
			if(!err){
				var patientData = {
						labResult: labResults
				};
				DBService.findConditions(userId, patientId, null, function(err, conditions){
					//$log.debug("conditions : " + JSON.stringify(conditions));
					if(!err){
						patientData.conditions = conditions;
						patientData.history = conditions;
						
						next(null, patientData);
						
					}else{
						next(err, patientData);
					}
				});
				
			}else{
				next(err, null);
			}
		});		
	};
	
}]);