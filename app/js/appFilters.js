app.filter('patientFilter',function($log) {
	return function(patients, name) {
		var filtered = [];
		if (patients != null && name != null
				&& patient != 'undefined'
				&& name != 'undefined') {
			var name = name.toLowerCase();
			for (var i = 0; i < patients.length; i++) {
				var patient = patients[i];
				console.log("patient: " + JSON.stringify(patient));
				if (patient.name.family[0].toLowerCase()
						.indexOf(name) > -1)
					filtered.push(patient);
				else if (patient.name.given[0].toLowerCase()
						.indexOf(name) > -1)
					filtered.push(patient);
				else if ((patient.name.family[0].toLowerCase()
						+ " " + patient.name.given[0]
						.toLowerCase()).indexOf(name) > -1)
					filtered.push(patient);
			}
		}
		return filtered;
	};
});