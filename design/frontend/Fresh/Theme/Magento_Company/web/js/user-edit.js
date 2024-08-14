/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'uiRegistry',
    'underscore',
    'Magento_Ui/js/modal/modal',
    'hierarchyTreePopup',
    'mage/translate'
], function ($, registry, _) {
    'use strict';

    $.widget('mage.userEdit', {

        options: {
            popup: '[data-role="add-customer-dialog"]',
            statusSelect: '[data-role="status-select"]',
            roleSelect: '[data-role="role-select"]',
            isAjax: false,
            gridProvider: '',
            needValidation: 0,
            adminUserRoleId: 0,
            getUserUrl: '',
            additionalFields: {
                create: '[data-role="create-additional-fields"]',
                edit: '[data-role="edit-additional-fields"]'
            }

        },




        /**
         * Create widget
         *
         * @private
         */
        _create: function () {
            this._setModal();
            this._bind();
        },

        /**
         * Bind listeners on elements
         *
         * @private
         */
        _bind: function () {
            this._on({
                'editUser': 'editUser',
                'click': 'editUser',
                'reloadTheTree': '_reloadGrid'
            });
        },

        /**
         * Callback for edit event
         *
         * @param {Object} e
         * @public
         */
        editUser: function (e) {
            var title = this.options.id ? 'Edit User': 'Add New User';

            if (e) {
                e.preventDefault();
            }
            this.options.popup.modal('setTitle', title);
            this.options.popup.modal('openModal');
            this._populateForm();
            this._setIdFields();

            if (!this.options.id) {
                this._filterRoles('role');
            }
        },

        /**
         * Toggle show addition fields
         *
         * @param {Boolean} isRegisterForm
         * @private
         */
        showAdditionalFields: function (isRegisterForm) {
            $(this.options.additionalFields.create).toggleClass('_hidden', isRegisterForm)
                .find('[name]').prop('disabled', isRegisterForm);
            $(this.options.additionalFields.edit).toggleClass('_hidden', !isRegisterForm)
                .find('[name]').prop('disabled', !isRegisterForm);
        },

        /**
         * Callback for reload event
         *
         * @private
         */
        _reloadGrid: function () {
            this._getGridProvider().reload({
                refresh: true
            });
        },

        /**
         * Get provider
         *
         * @private
         */
        _getGridProvider: function () {
            if (!this.gridProvider) {
                this.gridProvider = registry.get(this.options.gridProvider);
            }

            return this.gridProvider;
        },

        /**
         * Set id customer to field in form
         *
         * @private
         */
        _setIdFields: function () {
            this.options.popup.find('[name="customer_id"]').val(this.options.id);
        },

        /**
         * Set modal for edit customer
         *
         * @private
         */
        _setModal: function () {
            var self = this;

            this.options.popup = $(this.options.popup).hierarchyTreePopup({
                popupTitle: self.options.popupTitle,
                treeSelector: self.element,
                buttons: [{
                    text: 'Save',
                    'class': 'action save primary mainsubmit',

                    /** @inheritdoc */
                    click: function () {
                        var emailId = $('#email').val();
                        self._emailValidateNew(emailId);

                    }
                }, {
                    text: 'Cancel',
                    'class': 'action cancel secondary',

                    /** @inheritdoc */
                    click: function () {
                        this.closeModal();
                    }
                }]
            });
        },

        /**
         * Set data to popup form fields
         *
         * @param {String} name
         * @param {String} value
         * @private
         */
        _setPopupFields: function (name, value) {
            var self = this;

            if (name === 'role') {
                self._filterRoles(name, value);
            }

            this.options.popup.find('form [name="' + name + '"]').val(value);
        },

        /**
         * Fill roles input field.
         *
         * @param {String} name
         * @param {String} value
         * @private
         */
        _filterRoles: function (name, value) {
            var selectRoles = this.options.popup.find(this.options.roleSelect),
                statusSelect = this.options.popup.find(this.options.statusSelect),
                optionsRole = selectRoles.find('option'),
                adminRole = selectRoles.find('[value=' + this.options.adminUserRoleId + ']'),
                condition = value === this.options.adminUserRoleId;
            var checkValue =  this.options.popup.find('input').val();
            var selectEmail = this.options.popup.find('input[name="email"]');
            var checkBox = this.options.popup.find('input[name="primarycontact"]');

            checkBox.attr('checked', condition);
            selectEmail.attr('disabled', 'disabled');
            selectRoles.prop('disabled', condition);
            statusSelect.prop('disabled', condition);
            optionsRole.toggle(!condition);
            adminRole.toggle(condition);
            adminRole.attr('disabled', condition ? 'disabled' : '');

            if (_.isUndefined(value)) {
                optionsRole.first().attr('selected', 'selected');
                selectEmail.attr('disabled', false);
                checkBox.attr('checked',false);
            }
        },


        /**
         * Populate form
         *
         * @private
         */
        _populateForm: function () {
            var self = this;

            this.showAdditionalFields(!this.options.id);
            this.options.popup.find('input').val('');




            if (!this.options.isAjax && this.options.id) {
                this.options.isAjax = true;

                this.options.popup.addClass('unpopulated');
                this.options.popup.find('input').attr('disabled', true);

                $.ajax({
                    url: self.options.getUserUrl,
                    type: 'get',
                    showLoader: true,

                    /**
                     * @callback
                        */
                    success: $.proxy(function (data) {
                        var that = this;

                        this.options.popup.find('input').attr('disabled', false);

                        if (data.status === 'ok') {
                            $.each(data.data, function (idx, item) {
                                if (idx === 'custom_attributes') {
                                    $.each(item, function (name, itemData) {
                                        that._setPopupFields(itemData['attribute_code'], itemData.value);
                                    });
                                }
                                that._setPopupFields(idx, item);
                            });
                            this.options.popup.removeClass('unpopulated');
                        }
                    }, this),

                    /**
                     * @callback
                        */
                    complete: function () {
                        self.options.isAjax = false;
                    }
                });
            }
        },
        /**
         * _emailValidateNew form
         *
         * @private
         */
        _emailValidateNew: function(email){
            var self = this;
            var emailId = $('#email').val();
            var returnValue = 0;
            var customurl = window.BASE_URL+'company/index/emailvalidation';
            $.ajax({
                'async': false,
                url: customurl,
                type: 'get',
                dataType: 'json',
                data: {
                    'customer_email': emailId,
                },
                success: function (data) {
                    if (data) {
                        returnValue = data['success'];
                        if (returnValue == 2) {
                            $(".popup-overlay, .popup-content, .bg-overlay").addClass("active");
                            $("p.validate_text").html("Is your email address <span>" + emailId + "</span> valid?");
                            setTimeout(function(){
                                $('body').trigger('processStop');
                            },1000);
                            $('.button_validate').on('click', function () {
                                if ($(this).data('value') == 0) {
                                    $("#email_address-error-msg").remove();
                                    $('<div id="email_address-error-msg" class="mage-error">Please Enter a valid E-Mail Address</div>').insertAfter('.email_address');
                                    $(".popup-overlay, .popup-content, .bg-overlay").removeClass("active");
                                    setTimeout(function(){
                                        $('body').trigger('processStop');

                                    },1000);

                                } else {


                                    $("#email_address-error-msg").remove();

                                    self.options.popup.trigger('sendForm');


                                    $(".popup-overlay, .popup-content, .bg-overlay").removeClass("active");

                                }

                            });
                        } else {
                            self.options.popup.trigger('sendForm');

                        }
                    }
                },
                error: function (xhr, status, errorThrown) {
                    returnValue = 0;
                }
            });
        }

    });


    return $.mage.userEdit;
});
