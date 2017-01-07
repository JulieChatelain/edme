app.service('DBService', ['$log','EncryptionService', 'CodeService', 'RestService', function($log, EncryptionService, CodeService, RestService) {

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

	db.toServer = new Datastore({
		filename : path
				.join(appDataPath, 'sendToServer.db'),
		afterSerialization : EncryptionService.encrypt,
		beforeDeserialization : EncryptionService.decrypt,
		corruptAlertThreshold : 0,
		autoload : true
	});

	db.users.ensureIndex({ fieldName: 'login', unique: true });

	return {

		// --------------------------------------------------------------------
		// --------------------- To Be Sent To Server -------------------------
		addToListForServer : function(resource, resourceType, next){
			
			resource.dbId = resource._id;
			resource.resourceType = resourceType;
			var id = resource._id;
			delete resource._id;
			
			db.toServer.update({dbId: resource._id, resourceType: resourceType}
			, resource, { upsert: true }, function(err){
				resource._id = id;
				if(err){ next(false);}else{next(true);}
			});
		},
		removeFromListForServer : function(resource, resourceType, next){
			resource.dbId = resource._id;
			resource.resourceType = resourceType;
			
			db.patients.remove({dbId: resource._id, resourceType: resourceType}
			, {}, function(err, numRemoved){
				if(err){ next(false);}else{next(true);}
			});
		},
		// --------------------------------------------------------------------
		// ---------------------------- USER ----------------------------------
		
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
		addServerAccount : function(user, serverPass, serverEmail, practId
				, name, firstname, next){
			user.serverEmail = serverEmail;
			user.serverPassword = serverPass;
			user.practitionerId = practId;
			user.familyName = name;
			user.givenName = firstname;
			db.users.update({ _id: user._id }, user, {}, next);
		},
		
		// --------------------------------------------------------------------
		// -------------------------- PATIENT ---------------------------------
		
		createPatient : function(userId, firstname, lastname, gender, age
				, birthday, next) {		
			
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
				    hasBeenShared : false,
					lastUpdated : new Date()
			};
			db.patients.insert(patient, next);			
		},
		updatePatient : function(userId, patientId, firstname, lastname, gender
				, age, bday, next){
			
			var birthday = bday;
			var lastUpdated = new Date();
			
			if(birthday == null){
				birthday = new Date();
				birthday.setFullYear(birthday.getFullYear() - age);
			}
			var patient = {
					$set:{
							name: {
								family: [lastname],
								given: [firstname]
							},
							gender : gender,
							birthDate : birthday,
							lastUpdated : lastUpdated
				    	}
			};
			db.patients.update({_id: patientId, "relatedUsers" : userId}, patient
					, {}, function(err, numReplaced){
				/*		
				RestService.updateResource(user, patient, patient, 'Patient'
						, function(success, message){
					
				});*/
				
				next(err, numReplaced)
						
			});
		},
		patientSharing : function(userId, patient, share, id, lastShared, next){	
			
			var startShare = new Date();
			
			if(patient.startShare){
				startShare = patient.startShare;
			}
			var up = {
					$set:{
							idOnServer : id,
							shared : share,
							hasBeenShared : true,
							startShare : startShare,
							lastShared : lastShared
				    	}
			};
			
			db.patients.update({_id: patient._id, "relatedUsers" : userId}, up
					, {}, next);
			
		},
		findPatients : function(userId, next){
			db.patients.find({"relatedUsers" : userId}, next);
		},
		findPatient : function(userId, patientId, next){
			db.patients.findOne({_id: patientId, "relatedUsers" : userId}, next);
		},
		deletePatient : function(userId, patientId, next) {
			db.patients.remove({ _id: patientId, "relatedUsers" : userId}
			, {}, next);
		},
		
		// --------------------------------------------------------------------
		// ------------------------ OBSERVATIONS ------------------------------
		
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
				db.observations.find({"subject.reference" : patientId
					, issued: { $gte: date }}, next);
		},
		createLabResult : function(userId, patient, dataType, value
				, unit, dateResult, meaning, comments, next){
			
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
				        unit: unit
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
				    relatedUsers:[userId],
					lastUpdated : new Date()
				};
			db.observations.insert(observation, next);
		},
		deleteObservation : function(userId, id, next){
			db.observations.remove({ _id: id, "relatedUsers" : userId}
			, {}, next);
		},
		observationSharing : function(userId, observation, share, id
				, lastShared, next){
			
			var startShare = new Date();
			
			if(observation.startShare){
				startShare = observation.startShare;
			}
			var up = {
					$set:{
							idOnServer : id,
							shared : share,
							hasBeenShared : true,
							startShare : startShare,
							lastShared : lastShared
				    	}
			};
			
			db.observations.update({_id: observation._id, "relatedUsers" : userId}
			, up, {}, next);
			
		}
	}
}]);