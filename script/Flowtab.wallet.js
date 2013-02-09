Flowtab.wallet = (function () {
    var STRIPE_PUBLISHABLE_KEY = 'pk_0DqYGS5XKylBAqcUtb5PetXFkvKQk'
      , self = { view: {} }
      , view = self.view
      , framework = Flowtab.framework
      , currentUser = null
      , currentView = null
      , venues = null
      , menu = null
      , categories = null
      , products = null
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false
      , hasLoadedMenu = false
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

    function buildMenu(data, parent) {
        var i = data.length - 1
          , o;

        for (; i !== -1; --i) {
            o = data[i];

            if (!parent || parent.categories || parent.products)
                categories[o.id] = o;
            else
                products[o.id] = o;

            if (o.categories)
                buildMenu(o.categories, o);
            else if (o.products)
                buildMenu(o.products, o);
        }
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
            hasLoadedMenu = false;
            menu = null;
            categories = null;
            products = null;

            self.buildVenuesView(venues);

            if (currentView === view.venues)
                hideSpinner();
        });
    };

    self.loadMenu = function Flowtab_wallet_loadMenu(venueId) {
        if (currentView.id.indexOf('categories') === 0)
            showSpinner();

        framework.service.getMenu(venueId, function (data) {
            hasLoadedMenu = true;
            menu = data.menu;
            categories = {};
            products = {};

            buildMenu(data.menu);
            self.buildCategoriesView(menu, view.categories1, view.categories2);

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

    self.buildVenuesView = function Flowtab_wallet_buildVenuesView(items) {
        var $container = view.venues.$container;

        removeViewBindings(view.venues);
        
        $container.html(view.venues.render({ items: items }));

        var $items = $container.find('.venue');

        $.extend(view.venues, {
            $items: $items
        });

        $items.bind('click', function () {
            showCategoriesView(1);
            self.loadMenu(this.id);
        });
    };

    self.buildCategoriesView = function Flowtab_wallet_buildCategoriesView(items, targetView, nextView) {
        var $container = targetView.$container;

        removeViewBindings(targetView);
        $container.html(view.categories1.render({ items: items }));

        var $items = $container.find('.category');

        $.extend(targetView, {
            $items: $items
        });

        $items.bind('click', function () {
            var item = categories[this.id];

            if (item.categories) {
                self.buildCategoriesView(item.categories, nextView, targetView);
                showView(nextView, 'slideleft');
            }
            else if (item.products) {
                self.buildProductsView(item.products);
                showView(view.products, 'slideleft');
            }
            else {
                console.error('Flowtab.wallet.buildCategoriesView::empty_category_error (item:' +  JSON.stringfy(item) + ')');
            }
        });
    };

    self.buildProductsView = function Flowtab_wallet_buildProductsView(products) {
        var $container = view.products.$container;

        removeViewBindings(view.products);

        $container.html(view.products.render({ products: products }));
    };

    self.buildCheckoutView = function Flowtab_wallet_buildCheckoutView() {
        var cart = {
            products: {
                '90114057-09ff-4099-bdbd-a252af3ee6a1': {
                    id: '90114057-09ff-4099-bdbd-a252af3ee6a1'
                  , name: 'Stella Artois'
                  , category: {
                        id: 'f33627aa-5544-4e52-ba7f-dc8c2fa1a4d8'
                      , name: 'Regular Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 7.0
                  , description: 'psuedo-fancy'
                }
              , 'a449ad0b-8f00-4cee-b03c-762b3234ac56': {
                    id: 'a449ad0b-8f00-4cee-b03c-762b3234ac56'
                  , name: 'Crabbys'
                  , category: {
                        id: 'af3ac88e-c673-481e-8191-af3b3f15c0f8'
                      , name: 'American Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 10.5
                  , description: 'super-fancy'
                }
              , '83ebbec5-f6da-4549-924d-e81702e3a310': {
                    id: '83ebbec5-f6da-4549-924d-e81702e3a310'
                  , name: 'Crabbys'
                  , category: {
                        id: 'af3ac88e-c673-481e-8191-af3b3f15c0f8'
                      , name: 'America Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 5.0
                  , description: 'super-weak'
                }
            }
          , total: 22.5
        };
    };

    self.buildConfirmationView = function Flowtab_wallet_buildConfirmationView() {
        // body...
    };

    self.buildConfigurationView = function Flowtab_wallet_buildConfigurationView() {
        // body...
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
          , tn
          , templateElement = document.getElementById(id + '-template');

        if (n > 0) {
            for (; n !== 0; --n) {
                tn = t[n];
                t[n] = tn.charAt(0).toUpperCase() + tn.substring(1);
            }

            id = t.join(s);
        }

        view[id] = {
            id: id
          , render: templateElement === null ? null : swig.compile(templateElement.innerHTML, { filename: id })
          , $container: $(this)
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