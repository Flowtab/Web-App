Flowtab.wallet = (function () {
    var STRIPE_PUBLISHABLE_KEY = 'pk_0DqYGS5XKylBAqcUtb5PetXFkvKQk'
      , self = { view: {} }
      , view = self.view
      , framework = Flowtab.framework
      , currentUser = null
      , currentView = null
      , venues = null
      , menus = null
      , products = {}
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false
      , jQT = new Zepto.jQTouch({});

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

    function showView(view, method) {
        if (currentView === view) {
            console.warn('Flowtab.wallet.showView::view_already_shown_warning (view.id:' + view.id + ', ...)');

            return;
        }

        currentView = view;
        
        console.info('Flowtab.wallet.showView::showView (view.id:' + view.id + ', ...)');
        jQT.goTo(view.$container, method);
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

    function showSaveCreditCardFailureMessage() {
        // body...
    }

    function hideSaveCreditCardFailureMessage() {
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

        //write error message to currentView
    }

    self.loadVenues = function Flowtab_wallet_loadVenues() {
        if (currentView === view.venues)
            showSpinner();

        framework.service.getVenues(function (data) {
            venues = data.venues;
            hasLoadedVenues = true;

            self.buildVenuesView(venues);

            if (currentView === view.venues)
                hideSpinner();
        });
    };

    self.loadMenus = function Flowtab_wallet_loadMenus() {
        if (currentView.id.indexOf('categories') === 0)
            showSpinner();

        framework.service.getMenus(function (data) {
            menus = data.menus;
            hasLoadedMenus = true;

            self.buildCategoriesView(menus);

            if (currentView.id.indexOf('categories') === 0)
                hideSpinner();
        });
    };

    self.buildWelcomeView = function Flowtab_wallet_buildWelcomeView() {
        var $container = view.welcome.$container
          , $signUpButton = $container.find('.sign-up-button')
          , $signInButton = $container.find('.sign-in-button')

        removeViewBindings(view.welcome);

        $.extend(view.welcome, {
            $signUpButton: $signUpButton
          , $signInButton: $signInButton
        });

        $signUpButton.bind('click', self.showSignUpView);
        $signInButton.bind('click', self.showSignInView);
    };

    self.buildSignUpView = function Flowtab_wallet_buildSignUpView() {
        var $container = view.signUp.$container
          , $template = view.signUp.$template
          , $form = $container.find('form')
          , $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.signUp);

        $.extend(view.signUp, {
            $form: $form
          , $submitButton: $signUpButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};

            if (i > 0)
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
        var $container = view.signIn.$container
          , $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')
          , $passwordResetButton = $form.find('.password-reset-button');

        removeViewBindings(view.signIn);

        $.extend(view.signIn, {
            $form: $form
          , $submitButton: $submitButton
          , $passwordResetButton: $passwordResetButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};

            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;

            framework.service.authenticateUser(data.phoneNumber, data.password, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignInFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                if (currentUser.creditCard === null)
                    self.showSaveCreditCardView();
                else
                    self.showVenuesView();
            });

            return false;
        });

        $passwordResetButton.bind('click', self.showPasswordResetView);
    };

    self.buildSaveCreditCardView = function Flowtab_wallet_buildSaveCreditCardView() {
        var $container = view.saveCreditCard.$container;

        //$container.empty();

        //TODO: write template to container

        var $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')

        $.extend(view.saveCreditCard, {
            $form: $form
          , $submitButton: $submitButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};

            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;

            //NOTE: fake data
            data.number = '4111111111111111';
            data.expirationMonth = '5';
            data.expirationYear = '2015';
            data.code = '123';

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
                    
                    framework.service.saveUserCreditCard(data.id, function (data) {
                        hideSpinner();

                        if (data.error) {
                            showSaveCreditCardFailureMessage(data.error);

                            return;
                        }

                        currentUser.creditCard = data.creditCard;

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
        showView(view.welcome);
        
        //jQTouch goto currentView
    };

    self.showVenuesView = function Flowtab_wallet_showVenuesView() {
        showView(view.venues);

        //jQTouch goto currentView

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    };

    self.showCategoriesView = function Flowtab_wallet_showCategoriesView(id) {
        showView(view['categories-' + i]);

        //jQTouch goto currentView

        if (!hasLoadedMenus)
            showSpinner();
        else if (menus === null)
            showError();
    };

    self.showProductsView = function Flowtab_wallet_showProductsView() {
        showView(view.products, 'slideleft');
    };

    self.showSignUpView = function Flowtab_wallet_showSignUpView() {
        showView(view.signUp, 'slideup');
    };

    self.showSignInView = function Flowtab_wallet_showSignInView() {
        showView(view.signIn, 'slideup');
    };

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView() {
        showView(view.saveCreditCard, 'slideleft');
    };

    self.showPasswordResetView = function Flowtab_wallet_showPasswordResetView() {
        showView(view.passwordReset, 'slideleft');
    };

    self.showCheckoutView = function Flowtab_wallet_showCheckoutView() {
        showView(view.checkout, 'slideleft');
    };

    self.showConfirmationView = function Flowtab_wallet_showConfirmationView() {
        showView(view.confirmation, 'slideleft');
    };

    self.showConfigurationView = function Flowtab_wallet_showConfigurationView() {
        showView(view.configuration, 'slideleft');
    };

    self.showAboutHowItWorksView = function Flowtab_wallet_showAboutHowItWorksView() {
        showView(view.aboutHowItWorks, 'slideleft');
    };

    self.showAboutSecurityView = function Flowtab_wallet_showAboutSecurityView() {
        showView(view.aboutSecurity, 'slideleft');
    };

    self.showShareView = function Flowtab_wallet_showShareView() {
        showView(view.share, 'slideleft');
    };

    showSpinner();

    $('.view').each(function () {
        var id = this.id
          , s = ''
          , t = id.split('-')
          , n = t.length - 1
          , tn;

        if (n > 0) {
            for (; n !== 0; --n) {
                tn = t[n];
                t[n] = tn.charAt(0).toUpperCase() + tn.substring(1);
            }

            id = t.join(s);
        }

        view[id] = {
            id: id
          , $container: $(this)
          , $template: $('#' + id + '-template')
        };
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