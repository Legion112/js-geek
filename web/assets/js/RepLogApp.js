(function (window, $) {
    'use strict';
    window.RepLogApp = function ($wrapper) {
        this.$wrapper = $wrapper;
        this.helper = new Helper($wrapper);
        this.helper2 = new Helper($('footer'));
        console.log(
            this.helper.calculateTotalWeight(),
            this.helper2.calculateTotalWeight()
        );

        this.$wrapper.find('.js-delete-rep-log').on('click',
            this.handleRepLogDelete.bind(this)
        );

        this.$wrapper.find('tbody tr').on('click',
            this.handleRowClick.bind(this)
        )
    };
    $.extend(window.RepLogApp.prototype, {
        handleRepLogDelete: function (e) {
            e.preventDefault();
            var $link = $(e.currentTarget);

            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            var deleteUrl = $link.data('url');
            var $row = $link.closest('tr');
            let self = this;
            $.ajax({
                url: deleteUrl,
                method: 'DELETE',
                success: function () {
                    $row.fadeOut('normal', function () {
                        $(this).remove();
                        self.updateTotalWeightLifted();
                    });
                }
            })
        },
        handleRowClick: function (e) {
            console.log('row clicked');
        },
        updateTotalWeightLifted: function() {
            this.$wrapper.find('.js-total-weight').html(
                this.helper.calculateTotalWeight()
            );
        }
    });
    /**
     * A "private" object
     */
    let Helper = function ($wrapper) {
        this.$wrapper = $wrapper;
    };
    $.extend(Helper.prototype, {
        calculateTotalWeight: function () {
            var totalWeight = 0;
            this.$wrapper.find('tbody tr').each(function () {
                totalWeight += $(this).data('weight');
            });
            return totalWeight;
        }
    });
})(window, jQuery);
