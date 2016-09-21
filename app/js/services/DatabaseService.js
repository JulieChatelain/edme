app.service('DBService', ['$log','EncryptionService', function($log, EncryptionService) {

	var Datastore 	= require('nedb')
	  , path 		= require('path')
	  , appDataPath = require('nw.gui').App.dataPath
	  , db 			= {}
	

	db.users = new Datastore({
		filename : path.join(appDataPath, 'users.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});
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
	

	db.users.ensureIndex({ fieldName: 'login', unique: true });

	return {
		getDB : function() {
			return db;
		},
		getUsers : function() {
			return db.users;
		},
		getPatients : function() {
			return db.patients;
		},
		getPractitioners : function() {
			return db.practitioners;
		},
		getObservations : function() {
			return db.observations;
		},
		getConditions : function() {
			return db.conditions;
		},
		getDiagnosticOrders : function() {
			return db.diagnosticOrders;
		},
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
		createPatient : function(userId, firstname, lastname, gender, age, next) {			
			var birthday = new Date();
			birthday.setFullYear(birthday.getFullYear - age);
			var patient = {
					name: {
				        family: [lastname],
				        given: [firstname]
				    },
				    gender : gender,
				    birthDate : birthday,
				    relatedUsers:[userId]
			}
			console.log("patient " + JSON.stringify(patient));
			db.patients.insert(patient, next);			
		},
		findPatients : function(userId, next){
			db.patients.find({"relatedUsers" : userId}, next);
		}
	}
}]);