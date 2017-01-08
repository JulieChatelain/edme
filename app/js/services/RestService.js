
app.service('RestService', ['$log', '$http', 'FHIR',  function($log, $http, $window, FHIR) {


    var url = "http://localhost:3000/ehr";
    
    var decode = function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    };
    
    var patientFHIR = function(user, patient){
		 
		var code = patient.code;
		
		patient.identifier = [];
		
		patient.identifier.push({
			value: code,
			assigner: {
				reference: user.reference.practitionerId,
				display: user.reference.familyName
			}
		});	
 	 };
 	 var observationFHIR = function(user, patient, observation){
 		var code = patient.code;
		
		observation.identifier = [];
		
		observation.identifier.push({
			value: code,
			assigner: {
				reference: user.reference.practitionerId,
				display: user.familyName
			}
		});	
		
		observation.subject = {
			reference : "Patient/" + patient.idOnServer,
			display: patient.name.given[0] + " " + patient.name.family[0]
		};
 	 };
    
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
    		patientFHIR(user, patient);
    		//$log.debug("sending record : " + JSON.stringify(patient));
    		$http.post(url + '/rest/Patient', patient).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
    	sendObservation: function(user, patient, observation, next){
    		observationFHIR(user, patient, observation);
    		$http.post(url + '/rest/patientId/' + patient.idOnServer 
    				+ '/Observation', observation).then(function(res){
    			next(res.data.success, res.data.message, res.data.id)
    		});
    	},
    	updateResource: function(user, patient, resource, resourceType, next){
    		switch(resourceType){
    		case 'Observation': FHIR.observation(user, patient, resource); break;
    		case 'Patient': FHIR.patient(user, patient); break;
    		}
    		$http.put(url + '/rest/patientId/' + patient.idOnServer 
    				+ '/' + resourceType + '/' + resource.idOnServer, resource).then(function(res){
    			next(res.data.success);
    		});
    	},
        patients: function(next) {
            $http.get(url + '/rest/Patient').then(next);
        },
        patient: function(patientId, next) {
            $http.get(url + '/rest/patientId/' + patientId + '/Patient').then(next);
        },
		getResources : function(patientId, resourceType, next) {
			$http.get(url + '/rest/patientId/' + patientId + '/'
							+ resourceType).then(next);
		},
		getResource : function(patientId, resourceType, resourceId, next) {
			$http.get(url + '/rest/patientId/' + patientId + '/'
							+ resourceType + '/' + resourceId).then(next);
		},
		requestAccess : function(code, doctorName, givenName, familyName, next) {
			var data = {
				code : code,
				practitionerName : doctorName,
				givenName : givenName,
				familyName : familyName
			};
			$http.post(url + '/requestAccess', data).then(function(res){
				//$log.debug("request Access response : " + JSON.stringify(res));
				next(res.data.success, res.data.message);
			});
		},
		listAccesses : function(next){			
			$http.get(url + '/listAccess').then(function(res){
				//$log.debug("access: " + JSON.stringify(res));
				next(res.data.success, res.data.message, res.data.data);
			});
		},
		revokeOwnAccess : function(recordId, next){
			var data = {
					recordId : recordId
				};
			$http.post(url + '/revokeOwnAccess', data).then(function(res){
				//$log.debug("request Access response : " + JSON.stringify(res));
				next(res.data.success, res.data.message);
			});
		},
    	decodeToken: function(token){
    		/*
    		var decoded = null;
            if (token) {
                decoded = jwtHelper.decodeToken(token);
            }
            return decoded;
            */
	        var user = {};
	        if (typeof token !== 'undefined') {
	            var encoded = token.split('.')[1];
	            user = JSON.parse(decode(encoded));
	        }
	        return user;
    	},
    }
}]);
