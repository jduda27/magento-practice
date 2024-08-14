define(
  [
    'ko',
    'jquery',
    'uiElement',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Amasty_CheckoutCore/js/model/payment/payment-loading',
    'Amasty_CheckoutStyleSwitcher/js/action/start-place-order',
    'Amasty_CheckoutStyleSwitcher/js/model/amalert',
    'Amasty_CheckoutCore/js/action/focus-first-error',
    'Amasty_CheckoutCore/js/model/payment-validators/login-form-validator',
    'Amasty_CheckoutCore/js/model/address-form-state',
    'Amasty_CheckoutCore/js/model/one-step-layout',
    'Amasty_CheckoutCore/js/model/payment/place-order-state',
    'Magento_Ui/js/lib/knockout/extender/bound-nodes',
    'Magento_Ui/js/lib/view/utils/dom-observer',
    'Magento_Customer/js/customer-data',
    'Magento_Ui/js/lib/view/utils/async',
    'mage/translate'
  ],
  function (
    ko,
    $,
    Component,
    registry,
    quote,
    shippingService,
    paymentLoader,
    startPlaceOrderAction,
    alert,
    focusFirstError,
    loginFormValidator,
    addressFormState,
    oneStepLayout,
    placeOrderState,
    boundNodes,
    domObserver,
    customerData
  ) {
    'use strict';

    return Component.extend({
      defaults: {
        template: 'Amasty_CheckoutStyleSwitcher/onepage/place-order',
        defaultLabel: 'Place Order',
        onBillingVisibleText: 'Please update or cancel Billing Address Form.',
        onShippingVisibleText: 'Please update or cancel Shipping Address Form.',
        visible: true,
        warn: '',
        paymentsNamePrefix: 'checkout.steps.billing-step.payment.payments-list.',
        toolbarSelector: '.actions-toolbar',
        placeButtonSelector: '.action.primary',
        originalToolbarPayments: ['braintree_paypal'],
        listens: {
          'visible': 'onVisibilityChange'
        }
      },

      checkoutRootNode: null,

      previousPaymentMethod: null,

      /**
       * @private
       */
      _asyncCallbackFunction: function () {},

      /**
       * @property {MutationObserver}
       */
      _activePaymentDomObserver: null,

      isPlaceOrderActionAllowed: ko.pureComputed(function () {
        return !paymentLoader()
          && !addressFormState.isBillingFormVisible()
          && !addressFormState.isShippingFormVisible();
      }),

      initObservable: function () {
        this._super()
          .observe({ label: this.defaultLabel })
          .observe('visible warn');

        if (typeof MutationObserver !== 'undefined') {
          this._activePaymentDomObserver = new MutationObserver(this.mutationCallback.bind(this));
        }

        if (quote.paymentMethod()) {
          this.paymentMethodSubscriber(quote.paymentMethod());
        }

        quote.paymentMethod.subscribe(this.paymentMethodSubscriber, this);

        addressFormState.isBillingFormVisible.subscribe(this.updateWarning, this);

        if (quote.isVirtual()) {
          quote.paymentMethod.subscribe(this.updateWarning, this);
        } else {
          addressFormState.isShippingFormVisible.subscribe(this.updateWarning, this);
        }

        return this;
      },

      mutationCallback: function () {
        this.updatePlaceOrderButton(quote.paymentMethod());
      },

      /**
       * When our place button is not visible then original should be
       *
       * @param {Boolean} isVisible
       */
      onVisibilityChange: function (isVisible) {
        this.toggleOriginalToolbar(isVisible);
      },

      /**
       * @param {Boolean} state - is original toolbar (with place order button) should be hided
       */
      toggleOriginalToolbar: function (state) {
        var classNames = oneStepLayout.containerClassNames().replace(' am-submit-summary', '');

        if (state) {
          classNames += ' am-submit-summary';
        }

        oneStepLayout.containerClassNames(classNames);
      },

      /**
       * @param {Object|null} paymentMethod
       */
      paymentMethodSubscriber: function (paymentMethod) {
        var paymentToolbar,
          paymentComponentName;

        if (paymentMethod) {
          if (this.previousPaymentMethod === paymentMethod.method) {
            return;
          }

          this.previousPaymentMethod = paymentMethod.method;
        }

        this.updatePlaceOrderButton(paymentMethod);

        if (!this._activePaymentDomObserver) {
          return;
        }

        this._activePaymentDomObserver.disconnect();

        if (!paymentMethod || this.originalToolbarPayments.indexOf(paymentMethod.method) !== -1) {
          return;
        }

        paymentToolbar = this.getPaymentToolbar(paymentMethod);

        if (paymentToolbar.length) {
          paymentToolbar.each(function (index, element) {
            this.registerPaymentObserver(element);
          }.bind(this));
        } else {
          paymentComponentName = this.paymentsNamePrefix + paymentMethod.method;

          domObserver.off(this.toolbarSelector, this._asyncCallbackFunction);

          this._asyncCallbackFunction = function (element) {
            var component = registry.get(paymentComponentName);

            this._activePaymentDomObserver.disconnect();
            this.updatePlaceOrderButton(paymentMethod);
            this.registerPaymentObserver(element);
            domObserver.off(this.toolbarSelector, this._asyncCallbackFunction);
            boundNodes.off(component);
          }.bind(this);

          $.async({
            component: paymentComponentName,
            selector: this.toolbarSelector
          }, this._asyncCallbackFunction);
        }
      },

      /**
       * observe all active toolbars and update button label (or change visibility) on change
       *
       * @param {HTMLElement} element
       */
      registerPaymentObserver: function (element) {
        var button = $(element).find(this.placeButtonSelector).get(0);

        this._activePaymentDomObserver.observe(
          element,
          {
            attributes: true,
            attributeFilter: ['style', 'class'],
            characterData: true
          }
        );

        if (button) {
          // observe button text
          this._activePaymentDomObserver.observe(
            button,
            {
              subtree: true,
              characterData: true
            }
          );
        }
      },

      /**
       * @param {Object|null} paymentMethod
       */
      updatePlaceOrderButton: function (paymentMethod) {
        var paymentToolbar,
          button;

        if (!paymentMethod) {
          this.visible(true);

          return;
        }

        paymentToolbar = this.getPaymentToolbar(paymentMethod);

        if (paymentToolbar.length === 0 || this.originalToolbarPayments.indexOf(paymentMethod.method) !== -1) {
          this.visible(false);

          return;
        }

        if (paymentToolbar.length > 1) {
          // selector by attribute style should be used instread of :visible,
          // because some paypal payments can render 2 buttons and thay are both hidden by our css
          // but not active is hidden by js with attribute style
          paymentToolbar = paymentToolbar.filter(':not([style*="display: none"])');
        }

        button = paymentToolbar.find(this.placeButtonSelector);

        if (button.length) {
          this.visible(true);
          this.updateLabel(button);
        } else {
          this.visible(false);
        }
      },

      /**
       * Selected payment isn't have class `_active` yet
       *
       * @param {Object} paymentMethod
       *
       * @returns {jQuery}
       */
      getPaymentToolbar: function (paymentMethod) {
        return $('#' + paymentMethod.method).parents('.payment-method')
          .find(this.toolbarSelector);
      },

      /**
       * @param {JQuery|Element} button
       */
      updateLabel: function (button) {
        var buttonText = button.text();

        if (buttonText && buttonText.trim() !== '') {
          this.label(buttonText);

          return;
        }

        if (button.attr('title')) {
          this.label(button.attr('title'));

          return;
        }

        this.label(this.defaultLabel);
      },

      /**
       * Reassemble warning messages
       */
      updateWarning: function () {
        var warningMessage = '';

        if (quote.paymentMethod() && addressFormState.isBillingFormVisible()) {
          warningMessage += this.onBillingVisibleText + ' ';
        }

        if (addressFormState.isShippingFormVisible()) {
          warningMessage += this.onShippingVisibleText + ' ';
        }

        this.warn(warningMessage);
      },

      placeOrder: function () {
        var errorMessage = '';

        /**add project classification validation requried start*/
        var returnProjectvalue='';
        var customurl = 'checkoutattribute/index/checkuser';
        // AJAX request
        jQuery.ajax({
          'async': false,
          url: window.BASE_URL + customurl,
          type: 'post',
          success: function(response){
            if (response) {
              if (response['show-class']==1) {
                returnProjectvalue = 1;
              }
            }
          }
        });

        let cart = customerData.get('cart')();
        if (!cart || !cart.items || !cart.items.length) {
          errorMessage =  'Customer does not have an active cart';
          alert({ content: errorMessage });
          setTimeout(function(){
            location.reload();
          },1000);
          return;
        }

        if (returnProjectvalue==1) {
          var projectClass = jQuery('select[name=project_classification] option:selected').val();
          if (projectClass == '') {
            errorMessage =  'Please select project classification';
            alert({ content: errorMessage });
            return;
          }
        }
        /**add project classification validation requried end*/
        /**add validate shipping address validation requried start*/
        var returnValue =0;
        var address = quote.shippingAddress();
        var customer_address_id = (address.customerAddressId);
        var url = "custom/index/checkvalidate";
        jQuery.ajax({
          'async': false,
          type: 'POST',
          url: window.BASE_URL + url,
          data:{'street':1,'customer_address_id':customer_address_id},
          success: function(data){
            if (data.residental==1) {
              returnValue=data.residental;
            }
          }
        });
        if (returnValue != 1) {
          errorMessage =  'Please validate shipping address';
          alert({ content: errorMessage });
          return;
        }
        /**add validate shipping address validation requried end code*/
        if (!quote.paymentMethod()) {
          errorMessage = 'No payment method selected';
          alert({ content: errorMessage });

          return;
        }

        var authorize_sec =jQuery('button#authorize_button').data('authorize');
        if(quote.paymentMethod().method=='ntz_chargelogic' && authorize_sec=='no'){
          errorMessage = 'Need to validate your credit card information.';
          alert({ content: errorMessage });

          return;
        }

        var authorize_PO =jQuery('div#po-exist-error-msg');
        if(authorize_PO.length){
          errorMessage = 'Need to validate PO number field.';
          alert({ content: errorMessage });

          return;
        }

        if (!quote.shippingMethod() && !quote.isVirtual()) {
          errorMessage = 'No shipping method selected';
          alert({ content: errorMessage });

          return;
        }


        startPlaceOrderAction();

        localStorage.removeItem("is_specifier");
        localStorage.removeItem("is_commercial");
        localStorage.removeItem("project_classification");
      }
    });
  }
);
