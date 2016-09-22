app.service('Utils', function() {
	/**
	 * -----------------------------------------------------------------------
	 * Compute the age from the birthday
	 * -----------------------------------------------------------------------
	 */
	this.calculateAge = function(birthday) {
		var ageDifMs = Date.now() - new Date(birthday);
		var ageDate = new Date(ageDifMs);
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	}

	/**
	 * -----------------------------------------------------------------------
	 * Convert a date to a string in format dd-mm-yyyy.
	 * -----------------------------------------------------------------------
	 */
	this.dateToString = function(d) {
		var date = new Date(d);
		var d = date.getDate();
		
		if(Number(d) < 10) 
			d = "0" + d;
		
		var m = date.getMonth() + 1;
		
		if(Number(m) < 10) 
			m = "0" + m;
		
		var yyyy = date.getFullYear() 
		
		return d + "-" + m + "-" + yyyy;
	}
	
	/**
	 * -----------------------------------------------------------------------
	 * Compute the duration in years, month and days between two dates.
	 * -----------------------------------------------------------------------
	 */
	this.computeDuration = function(dateStart, dateEnd) {
		var ageDif 	= new Date(dateEnd) - new Date(dateStart);
		var ageDate = new Date(ageDif);
		var years 	= Math.abs(ageDate.getUTCFullYear() - 1970);
		var ageDate = new Date(ageDate - new Date(years,0,0));
		var months 	= ageDate.getUTCMonth();
		var ageDate = new Date(ageDate - new Date(0,months,0));
		var days = ageDate.getUTCDate();
		return "" + years + " an(s), " + months + " mois, " + days + " jour(s)";
	}
});