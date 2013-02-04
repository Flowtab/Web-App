Flowtab.wallet = (function () {
    var STRIPE_PUBLISHABLE_KEY = 'pk_0DqYGS5XKylBAqcUtb5PetXFkvKQk'
      , self = { element: {} }
      , element = self.element
      , framework = Flowtab.framework
      , currentUser = null
      , currentView = null
      , venues = null
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false;

    function initialize() {
        if (!hasLoadedDocument || !hasLoadedUser)
            return;

        hideSpinner();

        if (currentUser === null)
            self.showWelcomeView();
        else
            self.showVenuesView();
    }

    function showSignUpFailureMessage(error) {
        // body...
    }

    function hideSignUpFailureMessage() {
        // body...
    }

    function showSignUpSuccessMessage() {
        // body...
    }

    function hideSignUpSuccessMessage() {
        // body...
    }

    function showSignInFailureMessage(error) {
        // body...
    }

    function hideSignInFailureMessage() {
        // body...
    }

    function showSpinner() {
        // body...
    }

    function hideSpinner() {
        // body...
    }

    self.showErrorView = function Flowtab_wallet_showErrorView() {
        currentView = 'error';
        // body...
    };

    self.showWelcomeView = function Flowtab_wallet_showWelcomeView() {
        currentView = 'welcome';
        // body...
    };

    self.showVenuesView = function Flowtab_wallet_showVenuesView() {
        currentView = 'venues';

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            self.showErrorView();
    };

    self.loadVenuesView = function Flowtab_wallet_loadVenuesView() {
        if (currentView === 'venues')
            self.showSpinner();

        framework.service.getVenues(function (data) {
            venues = data.venues;
            hasLoadedVenues = true;

            if (venues !== null)
                self.buildVenuesView();

            if (currentView === 'venues')
                self.hideSpinner();
        });
    };

    self.showMenusView = function Flowtab_wallet_showMenusView() {
        currentView = 'menus';

        if (hasLoadedVenue) {
            if (Venue === null) {
                self.showErrorView();

                return;
            }
            
            hideSpinner();
            self.buildVenuesView();

            return;
        }
        
        showSpinner();
    };

    self.buildVenuesView = function Flowtab_wallet_buildVenuesView() {
        // body...
    };

    self.showSignUpView = function Flowtab_wallet_showSignUpView() {
        currentView = 'sign-up';
        // body...
    };

    self.showSignInView = function Flowtab_wallet_showSignInView() {
        currentView = 'sign-in';
        // body...
    };

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView() {
        currentView = 'save-credit-card';
        // body...
    };

    self.showPasswordResetView = function Flowtab_wallet_showPasswordResetView() {
        currentView = 'password-reset';
        // body...
    };

    showSpinner();

    new Zepto.jQTouch({
        preloadImages: [
            '/image/sprite-home14.png'
          , '/image/chicago9.jpg'
          , '/image/dropbar.jpg'
          , '/image/pattern.png'
          , '/image/topbar.png'
          , '/image/taps.jpg'
        ]
    });

    Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
    self.loadVenuesView();

    framework.service.getCurrentUser(function (data) {
        currentUser = data.user;
        hasLoadedUser = true;

        initialize();
    });

    Zepto(function ($) {
        hasLoadedDocument = true;

        //welcome-view bindings

        element.welcome = {
            signUpButton: $('#welcome .sign-up-button')
          , signInButton: $('#welcome .sign-in-button')
        };

        element.welcome.signUpButton.bind('click', self.showSignUpView);
        element.welcome.signInButton.bind('click', self.showSignInView);

        //sign-up-view bindings

        element.signUp = {
            form: $('#sign-up form')
          , submitButton: $('#sign-up form button[type="submit"]')
        };

        element.signUp.form.bind('submit', function () {
            showSpinner();

            var formEntries = element.signUp.form.serializeArray()
              , i = formEntries.length
              , data = {};

            for (; i !== -1; --i)
                data[formEntries[i].name] = formEntries[i].value;

            framework.service.createUser(data.firstName, data.lastName, data.phoneNumber, data.password, data.emailAddress, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignUpFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                showSignUpSuccessMessage();

                setTimeout(function () {
                    hideSignUpSuccessMessage();
                    self.showSaveCreditCardView();
                }, 2400);
            });

            return false;
        });

        //sign-in-view bindings

        element.signIn = {
            form: $('#sign-in form')
          , submitButton: $('#sign-up form button[type="submit"]')
          , passwordResetButton: $('#sign-up .password-reset-button')
        };

        element.signIn.form.bind('submit', function () {
            showSpinner();

            var formEntries = element.signUp.form.serializeArray()
              , i = formEntries.length
              , data = {};

            for (; i !== -1; --i)
                data[formEntries[i].name] = formEntries[i].value;

            framework.service.authenticateUser(data.phoneNumber, data.password, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignInFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                if (currentUser.hasCreditCard)
                    self.showVenuesView();
                else
                    self.showSaveCreditCardView();
            });

            return false;
        });

        element.signIn.passwordResetButton.bind('click', self.showPasswordResetView);

        //save-credit-card-view bindings

        element.saveCreditCard = {
          , form: $('#save-credit-card form')
          , submitButton: $('#save-credit-card form button[type="submit"]')
        };

        element.saveCreditCard.form.bind('submit', function () {
            showSpinner();

            var formEntries = element.saveCreditCard.form.serializeArray()
              , i = formEntries.length
              , data = {};

            for (; i !== -1; --i)
                data[formEntries[i].name] = formEntries[i].value;

            Stripe.createToken({
                    number: data.number
                  , exp_month: data.expirationMonth
                  , exp_year: data.expirationYear
                  , cvc: data.code
                }
              , function (status, data) {
                    if (data.error)
                        hideSpinner();
                        showSaveCreditCardFailureMessage(data.error);

                        return;
                    }
                    
                    framework.service.saveCreditCard(data.id, function (data) {
                        hideSpinner();

                        if (data.error) {
                            showSaveCreditCardFailureMessage(data.error);

                            return;
                        }

                        currentUser.hasCreditCard = true;

                        element.saveCreditCard.form.get(0).reset();
                        self.showVenuesView();
                    });
                }
            );

            return false;
        });

        //init

        initialize();
    });

    return self;
})();