(function (window, $, Routing, swal) {
    'use strict';
    let HelperInstances = new WeakMap();

    class RepLogApp {
        constructor($wrapper) {
            this.$wrapper = $wrapper;
            this.repLogs = [];
            HelperInstances.set(this, new Helper(this.repLogs));

            this.loadRepLogs();

            this.$wrapper.on('click',
                '.js-delete-rep-log',
                this.handleRepLogDelete.bind(this)
            );

            this.$wrapper.on('click',
                'tbody tr',
                this.handleRowClick.bind(this)
            )

            this.$wrapper.on(
                'submit',
                RepLogApp._selectors.newRepForm,
                this.handleNewFormSubmit.bind(this)
            );
        }

        static get _selectors() {
            return {
                newRepForm: '.js-new-rep-log-form'
            }
        }
        loadRepLogs() {
            $.ajax({
                url: Routing.generate('rep_log_list'),
            }).then(data => {
                for (let repLog of data.items) {
                    this._addRow(repLog)
                }
                console.log(this.repLogs, this.repLogs.includes(data.items[0]));
            });
        }
        handleRepLogDelete(e) {
            e.preventDefault();
            const $link = $(e.currentTarget);
            swal({
                title: 'Delete this log?',
                text: 'What? Did you not actually lift this?',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                preConfirm: () => this._deleteRepLog($link)
            }).catch(arg => {
                console.log(arg)
            });
        }
        _deleteRepLog($link) {
            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            const deleteUrl = $link.data('url');
            const $row = $link.closest('tr');
            return $.ajax({
                url: deleteUrl,
                method: 'DELETE',
            }).then(() => {
                $row.fadeOut('normal', () => {
                    $row.remove();
                    this.updateTotalWeightLifted();
                });
            });
        }
        handleRowClick(e) {
            console.log('row clicked');
        }
        updateTotalWeightLifted() {
            this.$wrapper.find('.js-total-weight').html(
                HelperInstances.get(this).getTotalWeightString()
            );
        }
        handleNewFormSubmit(e) {
            e.preventDefault();

            const $form = $(e.currentTarget);
            const formData = {};
            for (let fieldData of $form.serializeArray()) {
                formData[fieldData.name] = fieldData.value;
            }
            ;
            this._saveRepLog(formData)
                .then(data => {
                    this._clearForm();
                    this._addRow(data)
                }).catch(errorData => {
                this._mapErrorsToForm(errorData.errors);
            })
        }
        _saveRepLog(data) {
            return new Promise((resolve, reject) => {
                const url = Routing.generate('rep_log_new');
                $.ajax({
                    url,
                    method: 'POST',
                    data: JSON.stringify(data),
                }).then((data, textStatus, jqXHR) => {
                    $.ajax({
                        url: jqXHR.getResponseHeader('Location'),
                    }).then(data => {
                        // we're finally done
                        resolve(data);
                    })
                }).catch(jqXHR => {
                    const errorData = JSON.parse(jqXHR.responseText);
                    reject(errorData);
                });
            });

        }
        _mapErrorsToForm(errorData) {
            // reset things
            this._removeFormErrors();
            const $form = this.$wrapper.find(RepLogApp._selectors.newRepForm);

            for (let element of $form.find(':input')) {
                const fieldName = $(element).attr('name');
                const $wrapper = $(element).closest('.form-group');
                if (!errorData[fieldName]) {
                    // no error!
                    return;
                }
                const $error = $('<span class="js-field-error help-block"></span>');
                $error.html(errorData[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');
            }
        }
        _removeFormErrors() {
            const $form = this.$wrapper.find(RepLogApp._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        }
        _clearForm() {
            this._removeFormErrors();
            const $form = this.$wrapper.find(RepLogApp._selectors.newRepForm);
            $form[0].reset();
        }
        _addRow(repLog) {
            this.repLogs.push(repLog);
            const tplText = rowTemplate(repLog);
            const tpl = _.template(tplText)
            const html = tpl(repLog)
            this.$wrapper.find('tbody')
                .append($.parseHTML(html))
            this.updateTotalWeightLifted();
        }
    }

    class Helper {
        constructor(repLogs) {
            this.repLogs = repLogs;
        }

        static _calculateWeight(repLogs) {
            let totalWeight = 0;
            for (let repLog of repLogs) {
                totalWeight += repLog.totalWeightLifted;
            }
            return totalWeight;
        }
        getTotalWeightString(maxWeight = 500) {
            let weight = this.calculateTotalWeight();
            if (weight > maxWeight) {
                weight = maxWeight + '+';
            }
            return weight + ' lbs';
        }

        calculateTotalWeight() {
            return Helper._calculateWeight(
                this.repLogs
            )
        }
    }

    function upper(template, ...expressions) {
        return template.reduce((accumulator, part, i) => {
            return accumulator + (expressions[i - 1].toUpperCase ? expressions[i - 1].toUpperCase() : expressions[i - 1]) + part
        })
    }


    const rowTemplate = (repLog) => upper`
<tr data-weight="${ repLog.totalWeightLifted }">
<td>${ repLog.itemLabel }</td>
<td>${ repLog.reps }</td>
<td>${ repLog.totalWeightLifted }</td>
<td>
    <a href="#"
       class="js-delete-rep-log"
       data-url="${ repLog.links._self }"
    >
        <span class="fa fa-trash"></span>
    </a>
</td>
</tr>
`;

    window.RepLogApp = RepLogApp;
})(window, jQuery, Routing, swal);
