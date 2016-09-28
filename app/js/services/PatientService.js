app.service('PatientService', ['$log', 'DBService', 'CodeService', function($log, DBService, CodeService) {
	
	this.getAllRelatedData = function(userId, patientId, next) {
		DBService.findObservations(userId, patientId, 'laboratory', null, null, function(err, labResults){
			if(!err){
				var patientData = {
						labResult: labResults
				};
				
				next(null, patientData);
				
			}else{
				next(err, null);
			}
		});		
	};
	
}]);