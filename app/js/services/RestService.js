app.service('RestService', ['$log', '$http', 'FHIR', function($log, $http, FHIR) {

    var url = "http://localhost:3000";
    
    return {
    	register: function(password, email, givenName, familyName, next){
    		
    		var data = {
    				email: email,
    				password: password,
    				givenName: givenName,
    				familyName: familyName,
    				userKind: 'practitioner'
    		};
    		$http.post(url + '/register', data).then(function(res){
    			next(res.data.success, res.data.message, res.data.user, res.data.token)
    		});
    	},
    	login: function(password, email, next){
    		var data = {
    				email: email,
    				password: password
    		};
    		$http.post(url + '/login', data).then(function(res){
    			next(res.data.success, res.data.message, res.data.user, res.data.token)
    		});
    	},
    	sendPatientRecord: function(user, patient, next){
    		FHIR.patient(user, patient);
    		$http.post(url + '/rest/Patient', patient).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
    	sendObservation: function(user, patient, observation, next){
    		FHIR.observation(user, patient, observation);
    		$http.post(url + '/rest/patientId/' + patient.idOnServer 
    				+ '/Observation', observation).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
        patients: function(next) {
            $http.get(url + '/rest/Patient').then(next);
        },
        patient: function(patientId, next) {
            $http.get(url + '/rest/patientId/' + patientId + '/Patient').then(next);
        },
        getResource: function(resource, next) {
            $http.get(url + '/rest/patientId/' + patientId + '/' + resource).then(next);
        },
        requestAccess: function(next) {
        	$http.post(url + '/requestAccess', data).then(next);
        }
    }
}]);