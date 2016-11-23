app.service('DBService', ['$log','EncryptionService', 'CodeService', function($log, EncryptionService, CodeService) {

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
		findUserById  : function(id, next) {
			var user = {
					_id : id
			};
			db.users.findOne(user, next);
		},
		addServerAccount : function(user, serverPass, serverEmail, practId, name, firstname, next){
			user.serverEmail = serverEmail;
			user.serverPassword = serverPass;
			user.practitionerId = practId;
			user.familyName = name;
			user.givenName = firstname;
			db.users.update({ _id: user._id }, user, {}, next);
		},
		createPatient : function(userId, firstname, lastname, gender, age, birthday, next) {			
			if(birthday == null){
				var birthday = new Date();
				birthday.setFullYear(birthday.getFullYear() - age);
			}
			
			var patient = {
					code: ""+EncryptionService.generateCode()+"",
					name: {
				        family: [lastname],
				        given: [firstname]
				    },
				    gender : gender,
				    birthDate : birthday,
				    relatedUsers:[userId],
				    shared : false,
				    hasBeenShared : false
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
			db.patients.update({_id: patientId, "relatedUsers" : userId}, patient, {}, next);
		},
		patientSharing : function(userId, patient, share, id, next){
			var up = {
					$set:{
							idOnServer : id,
							shared : share,
							hasBeenShared : true,
							
				    	}
			};
			
			db.patients.update({_id: patient._id, "relatedUsers" : userId}, up, {}, next);
			
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
		findObservations : function(userId, patientId, category, code, date, next) {		
			
			var longAgo = new Date();
			longAgo.setFullYear(longAgo.getFullYear() - 500);
			
			date = date || longAgo;
			
			if(category && code)
				db.observations.find({"subject.reference" : patientId, 
					"category.coding.code" : category, 
					"code.coding.code" : code, issued: { $gte: date }}, next);
			else if (category && ! code)
				db.observations.find({"subject.reference" : patientId,
					"category.coding.code" : category, 
					issued: { $gte: date }}, next);
			else if (!category && code)
				db.observations.find({"subject.reference" : patientId,
					"code.coding.code" : code, issued: { $gte: date }}, next);
			else
				db.observations.find({"subject.reference" : patientId, issued: { $gte: date }}, next);
		},
		createLabResult : function(userId, patient, dataType, value, unit, dateResult, meaning, comments, next){
			var observation = {
					 category: {				
					     coding: [CodeService.labResult()],
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
				    code: CodeService.findCodeLabResult(dataType),
				    interpretation: {		
				        coding: [{
				            system: "eidmi",
				            code: (meaning == 'Bon') ? 'OK' : ((meaning == 'A surveiller') ? 'KW' : 'BAD'),
				            display: meaning
				        }],
				        text: meaning
				    },
				    comments: comments,
				    relatedUsers:[userId]
				};
			db.observations.insert(observation, next);
		},
		deleteObservation : function(userId, id, next){
			db.observations.remove({ _id: id, "relatedUsers" : userId}, {}, next);
		},
		observationSharing : function(userId, observation, share, id, next){
			
			var up = {
					$set:{
							idOnServer : id,
							shared : share,
							hasBeenShared : true
				    	}
			};
			
			db.observations.update({_id: observation._id, "relatedUsers" : userId}, up, {}, next);
			
		}
	}
}]);