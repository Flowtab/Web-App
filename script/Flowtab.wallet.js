Flowtab.wallet = (function () {
    var STRIPE_PUBLISHABLE_KEY = 'pk_0DqYGS5XKylBAqcUtb5PetXFkvKQk'
      , self = { view: {} }
      , view = self.view
      , framework = Flowtab.framework
      , currentUser = null
      , currentViewId = null
      , venues = null
      , menus = null
      , products = {}
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

    function removeViewBindings(viewStore) {
        for (var k in viewStore)
            if (k.charAt(0) === '$')
                viewStore[k].unbind();
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
        $("#spinner-wrap").show();
    }

    function hideSpinner() {
        $("#spinner-wrap").hide();
    }

    function showError() {
        hideSpinner();

        //write error message to currentViewId
    }

    self.loadVenues = function Flowtab_wallet_loadVenues() {
        if (currentViewId === 'venues')
            showSpinner();

        framework.service.getVenues(function (data) {
            venues = data.venues;
            hasLoadedVenues = true;

            self.buildVenuesView(venues);

            if (currentViewId === 'venues')
                hideSpinner();
        });
    };

    self.loadMenus = function Flowtab_wallet_loadMenus() {
        if (currentViewId.indexOf('categories') === 0)
            showSpinner();

        framework.service.getMenus(function (data) {
            menus = data.menus;
            hasLoadedMenus = true;

            self.buildCategoriesView(menus);

            if (currentViewId.indexOf('categories') === 0)
                hideSpinner();
        });
    };

    self.buildWelcomeView = function Flowtab_wallet_buildWelcomeView() {
        var $container = $('#welcome')
          , $template = $('#welcome-template')
          , $signUpButton = $container.find('.sign-up-button')
          , $signInButton = $container.find('.sign-in-button')

        removeViewBindings(view.welcome);

        view.welcome = {
            $container: $container
          , $signUpButton: $signUpButton
          , $signInButton: $signInButton
        };

        $signUpButton.bind('click', self.showSignUpView);
        $signInButton.bind('click', self.showSignInView);
    };

    self.buildSignUpView = function Flowtab_wallet_buildSignUpView() {
        var $container = $('#sign-up')
          , $template = $('#sign-up-template')
          , $form = $container.find('form')
          , $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.signUp);

        view.signUp = {
            $container: $container
          , $form: $form
          , $submitButton: $signUpButton
        };

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
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
    };

    self.buildSignInView = function Flowtab_wallet_buildSignInView() {
        var $container = $('#sign-in')
          , $template = $('#sign-in-template')
          , $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')
          , $passwordResetButton = $form.find('.password-reset-button');

        removeViewBindings(view.signIn);

        view.signIn = {
            $container: $container
          , $form: $form
          , $submitButton: $submitButton
          , $passwordResetButton: $passwordResetButton
        };

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
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

        $passwordResetButton.bind('click', self.showPasswordResetView);
    };

    self.buildSaveCreditCardView = function Flowtab_wallet_buildSaveCreditCardView() {
        var $container = $('#save-credit-card')
          , $template = $('#save-credit-card-template');

        //$container.empty();

        //TODO: write template to container

        var $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')

        view.saveCreditCard = {
            $container: $container
          , $form: $form
          , $submitButton: $submitButton
        };

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
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
                    if (data.error) {
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

                        $form.get(0).reset();
                        self.showVenuesView();
                    });
                }
            );

            return false;
        });
    };

    self.buildVenuesView = function Flowtab_wallet_buildVenuesView(venues) {
        // body...
    };

    self.buildCategoriesView = function Flowtab_wallet_buildCategoriesView(categories) {
        // body...
    };

    self.buildProductsView = function Flowtab_wallet_buildProductsView(products) {
        // body...
    };

    self.buildCheckoutView = function Flowtab_wallet_buildCheckoutView() {
        // body...
    };

    self.buildConfirmationView = function Flowtab_wallet_buildConfirmationView() {
        // body...
    };

    self.buildConfigurationView = function Flowtab_wallet_buildConfigurationView() {
        // body...
    };

    self.showWelcomeView = function Flowtab_wallet_showWelcomeView() {
        currentViewId = 'welcome';
        
        //jQTouch goto currentViewId
    };

    self.showVenuesView = function Flowtab_wallet_showVenuesView() {
        currentViewId = 'venues';

        //jQTouch goto currentViewId;

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    };

    self.showCategoriesView = function Flowtab_wallet_showCategoriesView(id) {
        currentViewId = 'categories' + id;

        //jQTouch goto currentViewId

        if (!hasLoadedMenus)
            showSpinner();
        else if (menus === null)
            showError();
    };

    self.showProductsView = function Flowtab_wallet_showProductsView() {
        currentViewId = 'products';
        
        //jQTouch goto currentViewId
    };

    self.showSignUpView = function Flowtab_wallet_showSignUpView() {
        currentViewId = 'sign-up';
        
        //jQTouch goto currentViewId
    };

    self.showSignInView = function Flowtab_wallet_showSignInView() {
        currentViewId = 'sign-in';
        
        //jQTouch goto currentViewId
    };

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView() {
        currentViewId = 'save-credit-card';
        
        //jQTouch goto currentViewId
    };

    self.showPasswordResetView = function Flowtab_wallet_showPasswordResetView() {
        currentViewId = 'password-reset';
        
        //jQTouch goto currentViewId
    };

    self.showCheckoutView = function Flowtab_wallet_showCheckoutView() {
        currentViewId = 'checkout';

        //jQTouch goto currentViewId
    };

    self.showConfirmationView = function Flowtab_wallet_showConfirmationView() {
        currentViewId = 'confirmation';

        //jQTouch goto currentViewId
    };

    self.showConfigurationView = function Flowtab_wallet_showConfigurationView() {
        currentViewId = 'configuration';

        //jQTouch goto currentViewId
    };

    self.showAboutHowItWorksView = function Flowtab_wallet_showAboutHowItWorksView() {
        currentViewId = 'about-how-it-works';

        //jQTouch goto currentViewId
    };

    self.showAboutSecurityView = function Flowtab_wallet_showAboutSecurityView() {
        currentViewId = 'about-security';

        //jQTouch goto currentViewId
    };

    self.showShareView = function Flowtab_wallet_showShareView() {
        currentViewId = 'share';

        //jQTouch goto currentViewId
    };

    showSpinner();

    new Zepto.jQTouch({
        preloadImages: [
/*
            '/image/sprite-home14.png'
          , '/image/chicago9.jpg'
          , '/image/dropbar.jpg'
          , '/image/pattern.png'
          , '/image/topbar.png'
          , '/image/taps.jpg'
*/
        ]
    });

    Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
    self.loadVenues();

    framework.service.getCurrentUser(function (data) {
        currentUser = data.user;
        hasLoadedUser = true;

        initialize();
    });

    Zepto(function ($) {
        hasLoadedDocument = true;

        self.buildWelcomeView();
        self.buildSignUpView();
        self.buildSignInView();
        self.buildSaveCreditCardView();
        initialize();
    });

    return self;
})();