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
      , title = null
      , category = null
      , products = null
      , product = null
      , cart = null
      , itemCount = null
      , pageHeight = null
      , windowHeight = null
      , appFeedback = null
      , creditsCode = null
      , hasCard = false
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false
      , hasLoadedMenu = false
      , toggleCheckout = false
      , jQT = new Zepto.jQTouch({})
      , $navigation = $('#navigation')
      , $checkoutValue = $('#checkout-button .counter .value')
      , $navigationTitle = $navigation.find('.title')
      , $navigationButtons = $navigation.find('.navigation')
      , $leftNavigationButton = $navigationButtons.filter('.left')
      , $rightNavigationButton = $navigationButtons.filter('.right')
      , $alert = $('#alert')
      , $alertSpan = $alert.find('span')
      , $spinner = $('#spinner');

    // Functions

    function initialize() {
        if (!hasLoadedDocument || !hasLoadedUser) {
            return;
        }

        hideSpinner();

        //showView(view.welcome, 'slidedown');
        
        if (currentUser === null) {
            showView(view.welcome, 'slidedown');
        } else {
            self.showVenuesView('slideleft');
        }
    }

    function showSpinner() {
        $spinner.show();
    }

    function hideSpinner() {
        $spinner.hide();
    }

    function showNavigationView() {
        $navigation.addClass('visible');
    }

    function hideNavigationView() {
        $navigation.removeClass('visible');
    }

    function showView(view, method) {
        if (currentView === view) {
            //console.warn('Flowtab.wallet.showView::view_already_shown_warning (view.id:' + view.id + ', ...)');
            return;
        }
        currentView = view;
        //console.info('Flowtab.wallet.showView::showView (view.id:' + view.id + ', ...)');
        jQT.goTo(view.$container, method);
    }

    function showAlert(color, title, time) {
        if (!time) {
            time = 2000;
        }
        hideSpinner();
        $alertSpan.removeClass().addClass(color).html(title);
        $alert.addClass('visible');
        setTimeout(function(){
            $alert.removeClass('visible');
        },time);
    }

    function removeViewBindings(view) {
        for (var k in view)
            if (k.charAt(0) === '$')
                view[k].unbind();
    }

    function buildNavigationView(options) {
        $navigationTitle.html(options.title || '');
        $navigationButtons.hide().removeClass().unbind();
        if (options.left) {
            $leftNavigationButton.addClass(options.left.className).bind('click', options.left.handler).show();
        }
        if (options.right) {
            $rightNavigationButton.addClass(options.right.className).bind('click', options.right.handler).show();
        }
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

    function stripeCheckout() {

        if (hasCard === false) {
            self.buildCheckoutCreditCardView();
            self.showCheckoutCreditCardView('slideleft');
            return;
        }

        showSpinner();
    	
    	$result = 1;

    	setTimeout(function() {
        	if ($result === 1) {
            	hideSpinner();
            	self.buildSuccessView();
                self.showSuccessView('slideleft');
                
        	} else {
                hideSpinner();
        		self.showCheckoutError();
        	}
        },1200);
    }

    function logOut() {
        showSpinner();
        setTimeout(function(){
            hideSpinner();
        },1000);
    }

	// Load venues and menus

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
            name = null;

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

            cart = self.cart = new Flowtab.wallet.Cart(products);

            self.buildCategoriesView(menu, view.categories1, view.categories2);

            if (currentView.id.indexOf('categories') === 0)
                hideSpinner();
        });
    };
    
    // Build views functions

    self.buildWelcomeView = function Flowtab_wallet_buildWelcomeView() {
        var $container = view.welcome.$container
          , $signUpButton = $container.find('.sign-up')
          , $logInButton = $container.find('.log-in');

        removeViewBindings(view.welcome);

        $.extend(view.welcome, {
            $signUpButton: $signUpButton
          , $logInButton: $logInButton
        });

        $signUpButton.bind('click', function () {
            self.buildSignUpView();
            self.showSignUpView('slideup');
        });

        $logInButton.bind('click', function () {
            self.buildlogInView();
            self.showlogInView('slideup');
        });
    };

    self.buildSignUpView = function Flowtab_wallet_buildSignUpView() {
        var $container = view.signUp.$container;
        var $form = $container.find('form');
        var $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.signUp);

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
            framework.service.createUser(data.firstName, data.lastName, data.phoneNumber, data.password, data.emailAddress, function(data) {
                hideSpinner();
                if (data.error) {
                    showAlert('error', data.error);
                    return;
                }
                currentUser = data.user;
                showAlert('success', 'You have registered successfully!');
                self.showSaveCreditCardView('slideleft');
                console.log("Done");
            });
            return false;
        });
    };

    self.buildCreditsView = function Flowtab_wallet_buildCreditsView() {
        var $container = view.credits.$container;
        var $form = $container.find('form');
        var $creditsCodeEntry = $form.find('.credits-code');

        removeViewBindings(view.credits);

        $form.bind('submit', function () {
            showSpinner();
            creditsCode = $creditsCodeEntry.val();
            if (creditsCode.length > 0) {
                framework.service.redeemCredits(creditsCode, function(data) {
                    if (data.error) {
                        showAlert('error', data.error);
                        return;
                    }
                    showAlert('success', 'We have credited your account!');
                    self.showSettingsView('slideright');
                    setTimeout(function(){
                         $creditsCodeEntry.val('');
                    },1200);
                });
            } else {
                showAlert('error', 'Please enter a voucher code!');
            }   
        });
    };

    self.buildAccountView = function Flowtab_wallet_buildAccountView() {
        var $container = view.account.$container;
        var $form = $container.find('form');
        var $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.account);

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
            framework.service.updateUser(data.firstName, data.lastName, data.phoneNumber, data.password, data.emailAddress, function(data) {
                hideSpinner();
                if (data.error) {
                    showAlert('error', data.error);
                    return;
                }
                currentUser = data.user;
                showAlert('success', 'Your info has been updated!');
                self.showSettingsView('slideright');
            });
            return false;
        });
    };

    self.buildFeedbackView = function Flowtab_wallet_buildFeedbackView() {
        var $container = view.feedback.$container;
        var $form = $container.find('form');
        var $textArea = $form.find('textarea');
        var $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.feedback);

        $form.bind('submit', function () {
            showSpinner();
            appFeedback = $textArea.val();
            if (appFeedback.length > 0) {
                setTimeout(function(){
                    $.post("https://www.itduzzit.com/duzz/api/twilio-send-sms.json?token=onz2gr9i9khj0qx&Mobile+Number+to+Call=6148044000&Send+from+Mobile+Number=6466993569&Text="+appFeedback);
                    showAlert('success', 'Your feedback has been sent!');
                    self.showSettingsView('slideright');
                    setTimeout(function(){
                        appFeedback = null;
                        $textArea.val('');
                    },1200);
                },1200)
            } else {
                showAlert('error', 'Please enter some feedback!');
            }
            return false;
        });
    };

    self.buildShareView = function Flowtab_wallet_buildFeedbackView() {
        var $container = view.share.$container;
        var $form = $container.find('form');
        var $textLink = $container.find('.link');

        removeViewBindings(view.share);

        $form.bind('submit', function () {
            // Do something...
        });
    };

    self.buildlogInView = function Flowtab_wallet_buildlogInView() {
        var $container = view.logIn.$container;
        var $form = $container.find('form');
        var $logInButton = $form.find('button[type="submit"]')
        var $resetPasswordButton = $form.find('.forgot-password');

        removeViewBindings(view.logIn);

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
            framework.service.authenticateUser(data.phoneNumber, data.password, function(data) {
                hideSpinner();
                if (data.error) {
                    showAlert('error', data.error);
                    return;
                }
                currentUser = data.user;
                showAlert('success', 'You have logged in successfully!');
                self.showSaveCreditCardView('slideleft');    
            });
            return false;
        });

        $resetPasswordButton.bind('click', function () {
            showSpinner();
            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};
/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/
            framework.service.resetPassword(data.phoneNumber, function(data) {
                hideSpinner();
                if (data.error) {
                    showAlert('error', data.error);
                    return;
                }
                currentUser = data.user;
                showAlert('success', 'Check your text messages!');  
            });
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
        	self.loadMenu(this.id);        
            self.showCategoriesView(1, 'slideleft', this.title);
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
                
		        buildNavigationView({
		            title: item.name
		          , left: {
		                className: 'back'
		              , handler: function () {
		                    self.showCategoriesView(1, 'slideright', $title);
		                }
		            }
		        });
		        showNavigationView();
		        showView(nextView, 'slideleft');
                                
            }
            else if (item.products) {
                self.buildProductsView(item.products);
                self.showProductsView('slideleft', item.name);
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
            self.showProductView('slideleft');
        });
    };

    self.buildProductView = function Flowtab_wallet_buildProductView(id) {
        var $container = view.product.$container;
        
        $container.html(view.product.render({ product: products[id] }));

        var $productAdd = $container.find('form .add');
        var $productSubtract = $container.find('form .subtract');
        var $productValue = $container.find('form .value');
        var $productMessage = $container.find('form textarea');
        var $productSubmit = $container.find('form .submit');
        var $productCount = 1;
        
        $productValue.html($productCount);

        $productAdd.bind('click', function () {
        	if ($productCount < 4) {
	        	$productCount = $productCount + 1;
	        	$productValue.html($productCount);
        	}
        });
    
        $productSubtract.bind('click', function () {
        	if ($productCount > 1) {
            	$productCount = $productCount - 1;
            	$productValue.html($productCount);
        	}
        });

        $productSubmit.bind('click', function () {
        	if ($productCount > 0) {
	            cart.addItem(id, $productCount);
	           	itemCount = cart.getCount();
	            if ($productCount === 1) {
    	            showAlert('success', 'You added 1 item to your cart!');
    	        } else {
        	        showAlert('success', 'You added '+$productCount+' items to your cart!');
    	        }
	            $productCount = 1;
	            $productMessage.val('');
	            setTimeout(function(){
	               $productValue.html($productCount);
	            },300);
	            $checkoutValue.html(itemCount);
	            self.showProductsView('slideright', $category);
	        }
        });

        $checkoutButton.bind('click', function () {
            self.buildCheckoutView();
            self.showCheckoutView('slideleft');
            $($checkoutButton).removeClass("visible");
        });

    };

    self.buildCheckoutView = function Flowtab_wallet_buildCheckoutView() {
        var $container = view.checkout.$container;

        $container.html(view.checkout.render({ product: cart.items }));

        var $checkoutButton = $container.find('form button');

        $checkoutButton.removeClass();

        if (hasCard === false) {
            $checkoutButton.addClass('gray');
            $checkoutButton.html('Continue to Payment');
        } else {
            $checkoutButton.html('Place Order');
        }
        
        $checkoutButton.bind('click', function () {
            toggleCheckout = false;
        	stripeCheckout();
        });
    };

    self.buildCheckoutEditView = function Flowtab_wallet_buildCheckoutEditView() {
        var $container = view.checkout.$container;
        var $editableList = $container.find('.editable');
        if (toggleCheckout === false) {
            $editableList.addClass('active');
            $rightNavigationButton.addClass('active');
            toggleCheckout = true;
        } else {
            $editableList.removeClass('active');
            $rightNavigationButton.removeClass('active');
            toggleCheckout = false;
        }

        var $subtractButton = $container.find('.subtract');
        var $addButton = $container.find('.add');

        $subtractButton.bind('click', function () {
        	console.log('Subtract product');
        	return false;
        	// TODO: Subtract product function
        });

        $addButton.bind('click', function () {
        	console.log('Add product');
        	return false;
        	// TODO: Add product function
        });

    }

    self.buildSaveCreditCardView = function Flowtab_wallet_buildSaveCreditCardView() {
        var $container = view.saveCreditCard.$container;

        removeViewBindings(view.saveCreditCard);
        
        $container.html(view.saveCreditCard.render({ user: currentUser }));

        var $form = $container.find('form');
        var $submitButton = $container.find('form button');
        var $storeLater = $container.find('.store-later');

        $submitButton.html('Save Card');
        $storeLater.show();

        $.extend(view.saveCreditCard, {
            $form: $form
          , $submitButton: $submitButton
        });

        $storeLater.bind('click', function () {
            self.showVenuesView('slideleft');
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
            var i = formEntries.length;
            var data = {};

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
                        showAlert('error', data.error);
                        return;
                    }
                    framework.service.saveUserCreditCard(data.id, function (data) {
                        if (data.error) {
                            showAlert('error', data.error);
                            return;
                        }
                        currentUser.creditCard = data.creditCard;
                        $form.get(0).reset();
                        showAlert('success', 'Your card has been saved!');
                        self.showVenuesView('slideleft');
                    });
                }
            );
            return false;
        });
    };

    self.buildCheckoutCreditCardView = function Flowtab_wallet_buildCheckoutCreditCardView() {
        var $container = view.saveCreditCard.$container;
        
        $container.html(view.saveCreditCard.render({ user: currentUser }));

        var $form = $container.find('form');
        var $submitButton = $container.find('form button');
        var $storeLater = $container.find('.store-later');

        $submitButton.html('Save Card (Go Back)');
        $storeLater.hide();

        $.extend(view.saveCreditCard, {
            $form: $form
          , $submitButton: $submitButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
            var i = formEntries.length;
            var data = {};

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
                        showAlert('error', data.error);
                        return;
                    }
                    framework.service.saveUserCreditCard(data.id, function (data) {
                        if (data.error) {
                            showAlert('error', data.error);
                            return;
                        }
                        currentUser.creditCard = data.creditCard;
                        $form.get(0).reset();
                        hasCard = 1;
                        self.buildCheckoutView();
                        showAlert('success', 'Your card has been saved!');
                        self.showCheckoutView('slideright');
                    });
                }
            );
            return false;
        });
    };

    self.buildSettingsCreditCardView = function Flowtab_wallet_buildSettingsCreditCardView() {
        var $container = view.saveCreditCard.$container;
        
        $container.html(view.saveCreditCard.render({ user: currentUser }));

        var $form = $container.find('form');
        var $submitButton = $container.find('form button');
        var $storeLater = $container.find('.store-later');

        $submitButton.html('Save Card');
        $storeLater.hide();

        $.extend(view.saveCreditCard, {
            $form: $form
          , $submitButton: $submitButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
            var i = formEntries.length;
            var data = {};

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
                        showAlert('error', data.error);
                        return;
                    }
                    framework.service.saveUserCreditCard(data.id, function (data) {
                        if (data.error) {
                            showAlert('error', data.error);
                            return;
                        }
                        currentUser.creditCard = data.creditCard;
                        $form.get(0).reset();
                        showAlert('success', 'Your card has been saved!');
                        self.showSettingsView('slideright');
                    });
                }
            );
            return false;
        });
    };

    self.buildSuccessView = function Flowtab_wallet_buildSuccessView() {
        var $container = view.success.$container;
        var $continueButton = $container.find('button');

        $continueButton.bind('click', function () {
            self.showCategoriesView(1, 'slideright', $title);
        });
    };

    self.buildSettingsView = function Flowtab_wallet_buildSettingsView() {
        var $container = view.settings.$container;

        $container.find('.cards').bind('click', function () {
            self.buildSettingsCreditCardView();
            self.showSettingsCreditCardView('slideleft');
        });

        $container.find('.credits').bind('click', function () {
            self.buildCreditsView();
            self.showCreditsView('slideleft');
        });

        $container.find('.account').bind('click', function () {
            self.buildAccountView();
            self.showAccountView('slideleft');
        });

        $container.find('.how-it-works').bind('click', function () {
            self.showWorksView('slideleft');
        });

        $container.find('.security').bind('click', function () {
            self.showSecurityView('slideleft');
        });

        $container.find('.share').bind('click', function () {
            self.buildShareView();
            self.showShareView('slideleft');
        });

        $container.find('.feedback').bind('click', function () {
            self.buildFeedbackView();
            self.showFeedbackView('slideleft');
        });
    };
    
    // Show views functions

    self.showWelcomeView = function Flowtab_wallet_showWelcomeView(transition) {
        hideNavigationView();
        showView(view.welcome, transition);
    };

    self.showSignUpView = function Flowtab_wallet_showSignUpView(transition) {  
        buildNavigationView({
            title: 'Sign Up'
          , left: {
                className: 'x-arrow'
              , handler: function () {
                    self.showWelcomeView("slidedown");
                }
            }
        });
        showNavigationView();
        showView(view.signUp, transition);

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

    self.showlogInView = function Flowtab_wallet_showlogInView(transition) {  
        buildNavigationView({
            title: 'Log In'
          , left: {
                className: 'x-arrow'
              , handler: function () {
                    self.showWelcomeView("slidedown");
                }
            }
        });
        showNavigationView();
        showView(view.logIn, transition);

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

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
                    self.showVenuesView('flipleft');
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

    self.showCategoriesView = function Flowtab_wallet_showCategoriesView(id, transition, title) {
    	$title = title;
        buildNavigationView({
            title: title
          , left: {
                className: 'back'
              , handler: function () {
                    self.showVenuesView('slideright');
                    $($checkoutButton).removeClass("visible");
        			cart.emptyCart();
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

    self.showProductsView = function Flowtab_wallet_showProductsView(transition, category) {
    	$category = category;
        buildNavigationView({
            title: $category
          , left: {
                className: 'back'
              , handler : function () {
                    self.showCategoriesView(1, 'slideright', $title);
                }
            }
        });
        showNavigationView();
        showView(view.products, transition);
    }

    self.showProductView = function Flowtab_wallet_showProductView(transition) {
        buildNavigationView({
            title: 'Quantity'
          , left: {
                className: 'back'
              , handler : function () {
                    self.showProductsView('slideright', $category);
                }
            }
        });
        showNavigationView();
        showView(view.product, transition);
    }

    self.showCheckoutView = function Flowtab_wallet_showCheckoutView(transition) {
        buildNavigationView({
            title: 'Checkout'
          , left: {
                className: 'back'
              , handler : function () {
                    self.showCategoriesView(1, 'slideright', $title);
                    $($checkoutButton).addClass("visible");
                    toggleCheckout = false;
                }
            }
          , right: {
                className: 'edit'
              , handler : function () {
                    self.buildCheckoutEditView();
                }
            }
        });
        showNavigationView();
        showView(view.checkout, transition);
    }

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView(transition) {
        buildNavigationView({
            title: 'Save Card'
        });
        showNavigationView();
        showView(view.saveCreditCard, transition);
    };

    self.showCheckoutCreditCardView = function Flowtab_wallet_showCheckoutCreditCardView(transition) {
        buildNavigationView({
            title: 'Payment'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showCheckoutView('slideright');
                }
            }
        });
        showNavigationView();
        showView(view.saveCreditCard, transition);
    };

    self.showSuccessView = function Flowtab_wallet_showSuccessView(transition) {
        buildNavigationView({
            title: 'Success'
        });
        showNavigationView();
        cart.emptyCart();     
        showView(view.success, transition);
    }

    self.showSettingsCreditCardView = function Flowtab_wallet_showSettingsCreditCardView(transition) {
        buildNavigationView({
            title: 'Cards'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showNavigationView();
        showView(view.saveCreditCard, transition);
    };

    self.showCreditsView = function Flowtab_wallet_showCreditsView(transition) {
        buildNavigationView({
            title: 'Credits'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showNavigationView();
        showView(view.credits, transition);
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
          , right: {
                className: 'logout'
              , handler: function() {
                    logOut();
                    self.showWelcomeView('slidedown');
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
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.works, transition);
    };

    self.showSecurityView = function Flowtab_wallet_showSecurityView(transition) {
        buildNavigationView({
            title: 'Security'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.security, transition);
    };

    self.showShareView = function Flowtab_wallet_showShareView(transition) {
        buildNavigationView({
            title: 'Share'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.share, transition);
    };

    self.showFeedbackView = function Flowtab_wallet_showFeedbackView(transition) {
        buildNavigationView({
            title: 'Feedback'
          , left: {
                className: 'back'
              , handler: function () {
                    self.showSettingsView('slideright');
                }
            }
        });
        showView(view.feedback, transition);
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
        self.buildSaveCreditCardView();
        self.buildSettingsView();
        hideNavigationView();
        initialize();
    });

    return self;
})();
