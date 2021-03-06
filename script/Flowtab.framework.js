Flowtab.framework = (function () {
    var self = {};

    self.util = {
        createUuid: function Flowtab_framework_util_createUuid() { //gist.github.com/1308368
            var a, b;

            for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');

            return b;
        }
    };

    self.service = {
        getCurrentUser: function Flowtab_framework_service_getCurrentUser(callback) {
            var data = {
                    error: null
                  , user: {
                        firstName: 'Flow'
                      , lastName: 'Tab'
                      , phoneNumber: '0000000000'
                      , emailAddress: 'flowtab@flowtab.com'
                      , creditCard: {
                            lastGroup: '1234'
                          , type: 'AMEX'
                        }
                      , credits: 1
                    }
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , createUser: function Flowtab_framework_service_createUser(firstName, lastName, phoneNumber, password, emailAddress, callback) {
            var data = {
                    error: null
                  , user: {
                        firstName: firstName
                      , lastName: lastName
                      , phoneNumber: phoneNumber
                      , emailAddress: emailAddress
                      , creditCard: null
                    }
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , saveUserCreditCard: function Flowtab_framework_service_saveUserCreditCard(token, callback) {
            var data = {
                    error: null
                  , creditCard: {
                        lastGroup: '1234'
                      , type: 'AMEX'
                    }
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , authenticateUser: function Flowtab_framework_service_authenticateUser(phoneNumber, password, callback) {
            var data = {
                    error: null
                  , user: {
                        firstName: 'Flow'
                      , lastName: 'Tab'
                      , phoneNumber: phoneNumber
                      , emailAddress: 'flowtab@flowtab.com'
                      , creditCard: null
                    }
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , resetPassword: function Flowtab_framework_service_resetPassword(phoneNumber, callback) {
            var data = {
                    error: null
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , updateUser: function Flowtab_framework_service_updateUser(firstName, lastName, phoneNumber, password, emailAddress, callback) {
            var data = {
                    error: null
                  , user: {
                        firstName: firstName
                      , lastName: lastName
                      , phoneNumber: phoneNumber
                      , emailAddress: emailAddress
                      , creditCard: null
                    }
                };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , redeemCredits: function Flowtab_framework_service_redeemCredits(voucherCode, callback) {
            var data = 1;

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , getVenues: function Flowtab_framework_service_getVenues(callback) {
      
            var data = {
				  error: null
              , venues: []
            }    
            
	      	$.getJSON("/json/venues.json", function(venues){		      	
		    	$.each(venues, function(i,value){
	                data.venues[i] = {
                        uuid: self.util.createUuid(),
	                    id: value.id,
	                    shortName: value.first,
	                    address: {
	                        streetNumber: value.address,
	                        streetName: value.street,
	                        cityName: value.city,
	                        hoodName: value.hood,
	                        stateCode: value.state,
	                        postalCode: value.zip
	                    }
	                };
	            });

                callback(data);
	         });
	         
        }
      , getMenu: function Flowtab_framework_service_getMenus(venueId, callback) {

            var response = {
				  error: null
              , menu: []
            }    

	      	$.getJSON("/json/menu.json", function(data){
		      		response.menu = data;

	                (function walk (data) {
			      		for (var i = data.length - 1, d; i !== -1; --i) {
    			      		d = data[i];
				      		d.uuid = self.util.createUuid();
				      		d.price = Number( d.price );
				      		d.prettyPrice = d.price.toFixed(2);

			      			for (var k in data[i])
				      			if (data[i][k] !== null && typeof data[i][k] === 'object')
				      				walk(data[i][k]);
			      		}
		      		})(data);
    	            
    	            callback(response);
	         });
	   }
	       
    };
    return self;
})();