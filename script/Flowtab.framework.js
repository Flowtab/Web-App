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
      , getVenues: function Flowtab_framework_service_getVenues(callback) {
            var data = {
                    error: null
                  , venues: []
                };

            for (var i = 5; i >= 0; i--) {
                data.venues[i] = {
                    id: self.util.createUuid(),
                    fullName: 'Full Bar Name ' + i,
                    shortName: 'Bar ' + i,
                    address: {
                        streetNumber: (i * 100),
                        streetName: 'Flowtab St.',
                        cityName: 'San Francisco',
                        hoodName: 'Mission',
                        stateName: 'California',
                        stateCode: 'CA',
                        postalCode: '9410' + i
                    }
                };
            };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);
        }
      , getMenu: function Flowtab_framework_service_getMenus(venueId, callback) {
            var data = {
                error: null
              , menu: [
                    {
                        id: self.util.createUuid()
                      , name: 'Catgegory 1'
                      , kind: ''
                      , description: ''
                      , products: [
                            {
                                id: self.util.createUuid()
                              , name: ''
                              , price: 7.0
                              , salePrice: 5.0
                              , description: ''
                            }
                          , {
                                id: self.util.createUuid()
                              , name: ''
                              , price: 7.0
                              , salePrice: 5.0
                              , description: ''
                            }
                        ]
                    }
                  , {
                        id: self.util.createUuid()
                      , name: 'Catgegory 2'
                      , kind: ''
                      , description: ''
                      , products: [
                            {
                                id: self.util.createUuid()
                              , name: ''
                              , price: 7.0
                              , salePrice: 5.0
                              , description: ''
                            }
                          , {
                                id: self.util.createUuid()
                              , name: ''
                              , price: 7.0
                              , salePrice: 5.0
                              , description: ''
                            }
                        ]
                    }
                  , {
                        id: self.util.createUuid()
                      , name: 'Catgegory 3'
                      , kind: ''
                      , description: ''
                      , categories: [
                            {
                                id: self.util.createUuid()
                              , name: 'Catgegory 3-1'
                              , kind: ''
                              , description: ''
                              , categories: [
                                    {
                                        id: self.util.createUuid()
                                      , name: 'Catgegory 3-1-1'
                                      , kind: ''
                                      , description: ''
                                      , products: [
                                            {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                          , {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                        ]
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: 'Catgegory 3-1-2'
                                      , kind: ''
                                      , description: ''
                                      , products: [
                                            {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                          , {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                        ]
                                    }
                                ]
                            }
                          , {
                                id: self.util.createUuid()
                              , name: 'Catgegory 3-2'
                              , kind: ''
                              , description: ''
                              , categories: [
                                    {
                                        id: self.util.createUuid()
                                      , name: 'Catgegory 3-2-1'
                                      , kind: ''
                                      , description: ''
                                      , products: [
                                            {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                          , {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                        ]
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: 'Catgegory 3-2-2'
                                      , kind: ''
                                      , description: ''
                                      , products: [
                                            {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                          , {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                        ]
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: 'Catgegory 3-2-3'
                                      , kind: ''
                                      , description: ''
                                      , products: [
                                            {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                          , {
                                                id: self.util.createUuid()
                                              , name: ''
                                              , price: 7.0
                                              , salePrice: 5.0
                                              , description: ''
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                  , {
                        id: self.util.createUuid()
                      , name: 'Catgegory 4'
                      , kind: ''
                      , description: ''
                      , categories: [
                            {
                                id: self.util.createUuid()
                              , name: 'Catgegory 4-1'
                              , kind: ''
                              , description: ''
                              , products: [
                                    {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                ]
                            }
                          , {
                                id: self.util.createUuid()
                              , name: 'Catgegory 4-2'
                              , kind: ''
                              , description: ''
                              , products: [
                                    {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                ]
                            }
                        ]
                    }
                  , {
                        id: self.util.createUuid()
                      , name: 'Catgegory 5'
                      , kind: ''
                      , description: ''
                      , categories: [
                            {
                                id: self.util.createUuid()
                              , name: 'Catgegory 5-1'
                              , kind: ''
                              , description: ''
                              , products: [
                                    {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                ]
                            }
                          , {
                                id: self.util.createUuid()
                              , name: 'Catgegory 5-2'
                              , kind: ''
                              , description: ''
                              , products: [
                                    {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                  , {
                                        id: self.util.createUuid()
                                      , name: ''
                                      , price: 7.0
                                      , salePrice: 5.0
                                      , description: ''
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            setTimeout(function () {
                if (callback)
                    callback(data);
            }, 1000);   
        }
    };

    return self;
})();