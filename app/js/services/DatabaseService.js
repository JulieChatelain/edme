app.service('DBService', ['$log','EncryptionService', function($log, EncryptionService) {

	var Datastore 	= require('nedb')
	  , path 		= require('path')
	  , appDataPath = require('nw.gui').App.dataPath
	  , db 			= {};
	

	db.users = new Datastore({
		filename : path.join(appDataPath, 'users.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	EncryptionService.generateCode();
	
	db.patients = new Datastore({
		filename : path.join(appDataPath, 'patients.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	db.practitioners = new Datastore({
		filename : path.join(appDataPath, 'practitioners.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	db.observations = new Datastore({
		filename : path.join(appDataPath, 'observations.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	db.conditions = new Datastore({
		filename : path.join(appDataPath, 'conditions.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	db.diagnosticOrders = new Datastore({
		filename : path
				.join(appDataPath, 'diagnosticOrders.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	db.diagnosticReports = new Datastore({
		filename : path
				.join(appDataPath, 'diagnosticReports.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
	

	db.users.ensureIndex({ fieldName: 'login', unique: true });

	return {
		createUser : function(login, pwd, next) {
			var user = {
					login : login,
					password : pwd
			};
			db.users.insert(user, next);			
		},
		findUser  : function(login, pwd, next) {
			var user = {
					login : login,
					password : pwd
			};
			db.users.findOne(user, next);
		},
		createPatient : function(userId, firstname, lastname, gender, age, birthday, next) {			
			if(birthday == null){
				var birthday = new Date();
				birthday.setFullYear(birthday.getFullYear() - age);
			}
			var patient = {
					code: EncryptionService.generateCode(),
					name: {
				        family: [lastname],
				        given: [firstname]
				    },
				    gender : gender,
				    birthDate : birthday,
				    relatedUsers:[userId]
			};
			db.patients.insert(patient, next);			
		},
		updatePatient : function(userId, patientId, firstname, lastname, gender, age, birthday, next){
			if(birthday == null){
				var birthday = new Date();
				birthday.setFullYear(birthday.getFullYear() - age);
			}
			var patient = {
					$set:{
							name: {
								family: [lastname],
								given: [firstname]
							},
							gender : gender,
							birthDate : birthday
							
				    	}
			};
			db.patients.update({_id: patientId, "relatedUsers" : userId}, patient, next);
		},
		findPatients : function(userId, next){
			db.patients.find({"relatedUsers" : userId}, next);
		},
		findPatient : function(userId, patientId, next){
			db.patients.findOne({_id: patientId, "relatedUsers" : userId}, next);
		},
		deletePatient : function(userId, patientId, next) {
			db.patients.remove({ _id: patientId, "relatedUsers" : userId}, {}, next);
		},
		createLabResult : function(userId, patient, dataType, value, unit, dateResult, meaning, comments, next){
			var codeResult = {};
			switch (dataType){
				case 'HbA1c' : codeResult = {
						coding: [{
				            system: "http://snomed.info/sct",
				            code: "43396009",
				            display: "HbA1c - Hemoglobin A1c level"
				        }],
				        text: "Niveau de hémoglobine A1c"
				};break;
				case 'BNP ' : codeResult = {
						coding: [{
				            system: "http://snomed.info/sct",
				            code: "390917008",
				            display: "Brain natriuretic peptide level"
				        }],
				        text: "Niveau de BNP"
				}; break;
				case 'NT-proBNP' : codeResult = {
						coding: [{
				            system: "http://snomed.info/sct",
				            code: "414799001",
				            display: "N-terminal pro-brain natriuretic peptide level"
				        }],
				        text: "Niveau de NT-proBNP"
				}; break;			
			}
			var observation = {
					 category: {				
					     coding: [{
					         system: "http://hl7.org/fhir/observation-category",
					         code: "laboratory",
					         display: "Laboratoire"
					     }],
					     text: "Résultat de l'analyse au laboratoire"
					 },
				    subject: {				
						reference : patient._id, 
						display : patient.name.given[0] + " " + patient.name.family[0]
				    },
				    issued : dateResult,
				    valueQuantity: {
				        value: value,
				        units: unit
				    },
				    code: codeResult,
				    interpretation: {		
				        coding: [{
				            system: "eidmi",
				            code: (meaning == 'Bon') ? 'OK' : ((meaning == 'A surveiller') ? 'KW' : 'BAD'),
				            display: meaning
				        }],
				        text: meaning
				    },
				    comments: comments,
				};
			
			db.observations.insert(observation, next);
		}
	}
}]);