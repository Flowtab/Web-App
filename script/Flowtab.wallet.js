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
      , product = null
      , pageHeight = null
      , windowHeight = null
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false
      , hasLoadedMenu = false
      , jQT = new Zepto.jQTouch({})
      , $navigation = $('#navigation')
      , $navigationTitle = $navigation.find('.title')
      , $navigationButtons = $navigation.find('.navigation-button')
      , $leftNavigationButton = $navigationButtons.filter('.left')
      , $rightNavigationButton = $navigationButtons.filter('.right')
      , $spinner = $('#spinner');

    function initialize() {
        if (!hasLoadedDocument || !hasLoadedUser) {
            return;
        }

        hideSpinner();
        
        if (currentUser === null) {
            showView(view.welcome, 'slidedown');
        } else {
            self.showVenuesView('slideleft');
        }
    }

    function removeViewBindings(view) {
        for (var k in view)
            if (k.charAt(0) === '$')
                view[k].unbind();
    }

    function buildMenu(data, parent) {
        if (!data)
            return console.log(parent,'null data');

        var i = data.length - 1
          , o;

        for (; i !== -1; --i) {
            o = data[i];
            o.parent = parent || null;

            if (!parent || o.categories || o.products) {
                categories[o.uuid] = o;
            }
            else {
                products[o.uuid] = o;
            }

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
        $spinner.show();
    }

    function hideSpinner() {
        $spinner.hide();
    }

    // Navigation functions

    function showNavigationView() {
        $navigation.addClass('visible');
    }

    function hideNavigationView() {
        $navigation.removeClass('visible');
    }

    function showCheckout() {
        $(".bottombar").addClass("visible");
    }

    function hideCheckout() {
        $(".bottombar").removeClass("visible");
    }

    function showError() {
        hideSpinner();
        
        //TODO: write error message to currentView
    }

    function buildNavigationView(options) {
        $navigationTitle.html(options.title || '');
        $navigationButtons
        .hide()
        .removeClass()
        .unbind();
        
        if (options.left) {
            $leftNavigationButton
            .addClass(options.left.className)
            .bind('click', options.left.handler)
            .show();
        }

        if (options.right) {
            $rightNavigationButton
            .addClass(options.right.className)
            .bind('click', options.right.handler)
            .show();
        }
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
          , $signUpButton = $container.find('#signup-button')
          , $signInButton = $container.find('#signin-button');

        removeViewBindings(view.welcome);

        $.extend(view.welcome, {
            $signUpButton: $signUpButton
          , $signInButton: $signInButton
        });

        $signUpButton.bind('click', function () {
            buildNavigationView('Sign Up','welcome','');
            showView(view.signUp, 'slideup');
        });

        $signInButton.bind('click', function () {
            buildNavigationView('Login','welcome','');
            showView(view.signIn, 'slideup');
        });
    };

    self.buildSignUpView = function Flowtab_wallet_buildSignUpView() {
        var $container = view.signUp.$container
          , $template = view.signUp.$template
          , $closeButton = $("#topbar .welcome")
          , $form = $container.find('form')
          , $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.signUp);

        $.extend(view.signUp, {
            $closeButton: $closeButton
          , $form: $form
          , $submitButton: $signUpButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};
/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/
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
                    buildNavigationView('Save Card','','');
                    showView(view.saveCreditCard, 'slideleft');
                }, 2400);
            });

            return false;
        });

        $closeButton.bind('click', function () {
            self.showWelcomeView();

            return false;
        });
    };

    self.buildSignInView = function Flowtab_wallet_buildSignInView() {
        var $container = view.signIn.$container
          , $closeButton = $("#topbar .welcome")
          , $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')
          , $passwordResetButton = $form.find('.password-reset-button');

        removeViewBindings(view.signIn);

        $.extend(view.signIn, {
            $closeButton: $closeButton
          , $form: $form
          , $submitButton: $submitButton
          , $passwordResetButton: $passwordResetButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};
/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/
            framework.service.authenticateUser(data.phoneNumber, data.password, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignInFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                if (currentUser.creditCard === null) {
                    buildNavigationView('Save Card','','');
                    showView(view.Venues, 'slideleft');
                } else {
                    self.showVenuesView();
                }     
            });
            return false;
        });

        $closeButton.bind('click', function () {
            //$navigationButtons.removeClass();
            showView(view.welcome, 'slidedown');
            hideNavigationView();
            return false;
        });

        $passwordResetButton.bind('click', function () {
            showView(view.passwordReset, 'slideleft');
            return false;
        });
    };

    self.buildSaveCreditCardView = function Flowtab_wallet_buildSaveCreditCardView() {
        var $container = view.saveCreditCard.$container;

        removeViewBindings(view.saveCreditCard);
        
        $container.html(view.saveCreditCard.render({ user: currentUser }));

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

/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/

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
            buildNavigationView('Venue Name','back','');
            self.showCategoriesView(1, 'slideleft');
            self.loadMenu(this.id);
            showCheckout();
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
                buildNavigationView(this.id,'back','');
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
        $container.html(view.products.render({ items: products }));

        var $items = $container.find('.products');

        $items.bind('click', function () {
            self.buildProductView(this.id);
            self.showProductView();
        });
    };

    self.buildProductView = function Flowtab_wallet_buildProductView(id) {
        var $container = view.product.$container;
        
        $container.html(view.product.render({ product: products[id] }));
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

    self.buildSettingsView = function Flowtab_wallet_buildSettingsView() {
        var $container = view.settings.$container;

        $container.find('.cards').bind('click', function () {
            self.showSaveCreditCardView('slideleft');
        });

        $container.find('.account').bind('click', function () {
            self.showAccountView('slideleft');
        });

        $container.find('.how-it-works').bind('click', function () {
            self.showWorksView('slideleft');
        });

        $container.find('.security').bind('click', function () {
            self.showSecurityView('slideleft');
        });

        $container.find('.share').bind('click', function () {
            self.showShareView('slideleft');
        });

        $container.find('.feedback').bind('click', function () {
            self.showFeedbackView('slideleft');
        });
    };

    self.showWelcomeView = function Flowtab_wallet_showWelcomeView () {
        hideNavigationView();
        showView(view.welcome, 'slidedown');
    };

    self.showVenuesView = function Flowtab_wallet_showVenuesView(transition) {  
        buildNavigationView({
            title: 'Venues'
          , left: {
                className: 'settings'
              , handler: function () {
                    self.showSettingsView("flipleft");
                }
            }
        });
        showNavigationView();
        showView(view.venues, transition);

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

    self.showSettingsView = function Flowtab_wallet_showSettingsView(transition) {
        buildNavigationView({
            title: 'Settings'
          , left: {
                className: 'x-arrow'
              , handler: function () {
                    // body...
                }
            }
        });
        showNavigationView();
        showView(view.settings, transition);

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

    self.showCategoriesView = function Flowtab_wallet_showCategoriesView(id, transition) {
        buildNavigationView({
            title: 'Categories'
          , left: {
                className: 'back'
              , handler: function () {
                    // body...
                }
            }
        });
        showNavigationView();
        showView(view['categories' + id], transition);

        if (!hasLoadedMenu)
            showSpinner();
        else if (menu === null)
            showError();
    }

    self.showProductView = function Flowtab_wallet_showProductView() {
        buildNavigationView({
            title: 'Product'
          , left: {
                className: 'back'
              , handler : function () {
                    // body...
                }
            }
        });
        showNavigationView();
        showView(view.product, 'slideleft');
    }

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView(transition) {
        buildNavigationView({
            title: 'Cards'
          , left: {
                className: 'back'
              , handler: function () {
                    // body...
                }
            }
        });
        showNavigationView();
        showView(view.saveCreditCard, transition);
    };

    self.showAccountView = function Flowtab_wallet_showAccountView(transition) {
        buildNavigationView({
            title: 'Account'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showNavigationView();
        showView(view.account, transition);
    };

    self.showWorksView = function Flowtab_wallet_showWorksView(transition) {
        buildNavigationView({
            title: 'How It Works'
          , left: {
                className: 'settings'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.works, transition);
        removeTopbarBindings();
    };

    self.showSecurityView = function Flowtab_wallet_showSecurityView(transition) {
        buildNavigationView({
            title: 'Security'
          , left: {
                className: 'settings'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.security, transition);
        removeTopbarBindings();
    };

    self.showShareView = function Flowtab_wallet_showShareView(transition) {
        buildNavigationView({
            title: 'Share'
          , left: {
                className: 'settings'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.share, transition);
        removeTopbarBindings();
    };

    self.showFeedbackView = function Flowtab_wallet_showFeedbackView(transition) {
        buildNavigationView({
            title: 'Feedback'
          , left: {
                className: 'settings'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.feedback, transition);
        removeTopbarBindings();
    };

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
        //showView(view.splash);
        showSpinner();
        self.buildWelcomeView();
        self.buildSignUpView();
        self.buildSignInView();
        self.buildSaveCreditCardView();
        self.buildSettingsView();
        hideCheckout();
        hideNavigationView();
        initialize();
    });

    return self;
})();
