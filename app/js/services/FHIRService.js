/**
 * Prepare a resource to be send to the FHIR server.
 */
app.service('FHIR', ['$log', function($log) {
	 return {
     	 patient : function(user, patient){
     		 
			var code = patient.code;
			
			patient.identifier = [];
			
			patient.identifier.push({
				value: code,
				assigner: {
					reference: user.practitionerId,
					display: user.familyName
				}
			});	
     	 },
     	 observation : function(user, patient, observation){
     		var code = patient.code;
			
			observation.identifier = [];
			
			observation.identifier.push({
				value: code,
				assigner: {
					reference: user.practitionerId,
					display: user.familyName
				}
			});	
			
			observation.subject = {
				reference : "Patient/" + patient.idOnServer,
				display: patient.name.given[0] + " " + patient.name.family[0]
			};
     	 }
	 };
}]);