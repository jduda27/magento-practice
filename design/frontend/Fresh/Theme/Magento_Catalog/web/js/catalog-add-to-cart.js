/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'mage/translate',
    'underscore',
    'Magento_Catalog/js/product/view/product-ids-resolver'
], function ($, $t, _, idsResolver) {
    'use strict';

    $.widget('mage.catalogAddToCart', {
        options: {
            processStart: null,
            processStop: null,
            bindSubmit: true,
            minicartSelector: '[data-block="minicart"]',
            messagesSelector: '[data-placeholder="messages"]',
            productStatusSelector: '.stock.available',
            addToCartButtonSelector: '.action.tocart',
            addToCartButtonDisabledClass: 'disabled',
            addToCartButtonTextWhileAdding: '',
            addToCartButtonTextAdded: '',
            addToCartButtonTextDefault: ''
        },

        /** @inheritdoc */
        _create: function () {
            if (this.options.bindSubmit) {
                this._bindSubmit();
            }
        },

        /**
         * @private
         */
        _bindSubmit: function () {
            var self = this;

            if (this.element.data('catalog-addtocart-initialized')) {
                return;
            }

            this.element.data('catalog-addtocart-initialized', 1);
            this.element.on('submit', function (e) {
                e.preventDefault();
                self.submitForm($(this));
            });
        },

        /**
         * @private
         */
        _redirect: function (url) {
            var urlParts, locationParts, forceReload;

            urlParts = url.split('#');
            locationParts = window.location.href.split('#');
            forceReload = urlParts[0] === locationParts[0];

            window.location.assign(url);

            if (forceReload) {
                window.location.reload();
            }
        },

        /**
         * @return {Boolean}
         */
        isLoaderEnabled: function () {
            return this.options.processStart && this.options.processStop;
        },

        /**
         * Handler for the form 'submit' event
         *
         * @param {jQuery} form
         */
        submitForm: function (form) {
            this.ajaxSubmit(form);
        },

        /**
         * @param {jQuery} form
         */
        ajaxSubmit: function (form) {
            var self = this,
                productIds = idsResolver(form),
                formData;

            $(self.options.minicartSelector).trigger('contentLoading');
            self.disableAddToCartButton(form);
            formData = new FormData(form[0]);

            $.ajax({
                url: form.attr('action'),
                data: formData,
                type: 'post',
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                showLoader:true,

                /** @inheritdoc */
                beforeSend: function () {
                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStart);
                    }
                },

                /** @inheritdoc */
                success: function (res) {
                    var eventData, parameters;

                    $(document).trigger('ajax:addToCart', {
                        'sku': form.data().productSku,
                        'productIds': productIds,
                        'form': form,
                        'response': res
                    });

                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStop);
                    }

                    if (res.backUrl) {
                        eventData = {
                            'form': form,
                            'redirectParameters': []
                        };
                        // trigger global event, so other modules will be able add parameters to redirect url
                        $('body').trigger('catalogCategoryAddToCartRedirect', eventData);

                        if (eventData.redirectParameters.length > 0) {
                            parameters = res.backUrl.split('#');
                            parameters.push(eventData.redirectParameters.join('&'));
                            res.backUrl = parameters.join('#');
                        }

                        self._redirect(res.backUrl);

                        return;
                    }

                    if (res.messages) {
                        $(self.options.messagesSelector).html(res.messages);
                    }

                    if (res.minicart) {
                        $(self.options.minicartSelector).replaceWith(res.minicart);
                        $(self.options.minicartSelector).trigger('contentUpdated');
                    }

                    if (res.product && res.product.statusText) {
                        $(self.options.productStatusSelector)
                            .removeClass('available')
                            .addClass('unavailable')
                            .find('span')
                            .html(res.product.statusText);
                    }
                    self.enableAddToCartButton(form);

                    //popup code start
                    jQuery('body').loader('show');
                    setTimeout(function(){
                        jQuery('body').loader('hide');
                        jQuery(".messages .message-success").hide();
                        /*var shoppingCartUrl = window.checkout.shoppingCartUrl;*/
                      var shoppingCartUrl = '/checkout/cart';
                        var subtotal = $('#hiddenSubtotal .price').html();
                        var qty = parseInt($('#hiddenQty').html());
                        /*if(qty=="") {
                            qty = 1;
                        } else {
                            qty = qty+1;
                        }*/
                        if(qty=='1'){
                            var item= ' item';
                            var is_are = "is ";
                        } else {
                            var item= ' items';
                            var is_are = "are ";
                        }

                        var count = 4;
                        var timer_interval = setInterval(function(){
                            if(count >= 0){
                                jQuery(".am-btn-right .pop-timer" ).html(" ("+count+")");
                            }
                            if(count < 0){
                                jQuery(".am-btn-right").click();
                                clearInterval(timer_interval);
                            }
                            count = count-1;
                        },1000);

                        var shoppingCartText = '<a href="'+shoppingCartUrl+'" id="am-a-count">'+qty+item+'</a>';
                        var insertedText;
                        if(subtotal !=undefined){
                          insertedText = '<h1>Product Added</h1><div id="messageBox"><p>You have added this product to your cart.</p><p id="amcart-count">There '+is_are + shoppingCartText+' in your cart.</p><p>Cart Subtotal: <span className="am_price"><span className="price">'+subtotal+'</span></span></p></div><a href="/checkout/cart" class="viewCartLink" style="display:none">View Cart</a>';
                        }else{
                          insertedText = '<h1>Product Added</h1><div id="messageBox"><p>You have added this product to your cart.</p></div><a href="/checkout/cart" class="viewCartLink" style="display:none">View Cart</a>';
                        }
                        var popup = $('<div class="add-to-cart-dialog" id="confirmOverlay"/>').html(insertedText).modal({
                            modalClass: 'add-to-cart-popup',
                            //title: $.mage.__("No Title"),
                            buttons: [
                                {
                                    class: 'am-btn-left',
                                    text: 'View Cart',
                                    click: function () {
                                        /*window.location = window.checkout.shoppingCartUrl*/
                                        /*window.location.href = window.BASE_URL +'checkout/cart'*/
                                        $('a.viewCartLink')[0].click();
                                    }
                                },{
                                    class: 'am-btn-right',
                                    text: '<span>Continue Shopping</span><span class="pop-timer" style="display:none;"> (5)</span>',
                                    click: function () {
                                        this.closeModal();
                                        clearInterval(timer_interval);
                                    }
                                }
                            ]
                        });

                        popup.modal('openModal');
                    },2000);
                    //popup code end
                },

                /** @inheritdoc */
                error: function (res) {
                    $(document).trigger('ajax:addToCart:error', {
                        'sku': form.data().productSku,
                        'productIds': productIds,
                        'form': form,
                        'response': res
                    });
                },

                /** @inheritdoc */
                complete: function (res) {
                    if (res.state() === 'rejected') {
                        location.reload();
                    }
                }
            });
        },

        /**
         * @param {String} form
         */
        disableAddToCartButton: function (form) {
            var addToCartButtonTextWhileAdding = this.options.addToCartButtonTextWhileAdding || $t('Adding...'),
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);

            addToCartButton.addClass(this.options.addToCartButtonDisabledClass);
            addToCartButton.find('span').text(addToCartButtonTextWhileAdding);
            addToCartButton.attr('title', addToCartButtonTextWhileAdding);
        },

        /**
         * @param {String} form
         */
        enableAddToCartButton: function (form) {
            var addToCartButtonTextAdded = this.options.addToCartButtonTextAdded || $t('Added'),
                self = this,
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);

            addToCartButton.find('span').text(addToCartButtonTextAdded);
            addToCartButton.attr('title', addToCartButtonTextAdded);

            setTimeout(function () {
                var addToCartButtonTextDefault = self.options.addToCartButtonTextDefault || $t('Add to Cart');

                addToCartButton.removeClass(self.options.addToCartButtonDisabledClass);
                addToCartButton.find('span').text(addToCartButtonTextDefault);
                addToCartButton.attr('title', addToCartButtonTextDefault);
            }, 1000);
        }
    });

    return $.mage.catalogAddToCart;
});
