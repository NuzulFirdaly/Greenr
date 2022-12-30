(function($) {

    (function(handlebars) {
        function parse_template(id, context) {
            var source = $('#' + id).html();
            return handlebars.compile(source)(context);
        }

        function addFileInput($fileList, allowRemove) {
            var context = {
                field_name: 'unique_field' + new Date().getTime(),
                field_id: 'this_is_the_id' + new Date().getTime(),
                allowRemove: allowRemove
            };

            var template = parse_template('file-upload-template', context);
            $fileList.append(template);

            $('.remove-row-link').click(function(e) {
                e.preventDefault();
                $(this).parents('li').remove();
            });
        }

        $.fn.multipleFileUploader = function(settings) {
            $(this).each(function(index, el) {
                var defaults = {
                    addButtonCaption: 'Add another file',
                    initialRequired: true,
                    initialFieldCount: 1,
                    containerClass: 'mfu-file-list-container',
                    addButtonClass: 'mfu-add-new',
                    fileListClass: 'mfu-file-list',
                    $uploaderControl: $(el)
                };
                var options = $.extend(defaults, settings);

                options.$uploaderControl.addClass(options.containerClass);

                createAddButton(options);
                createFileList(options);
                addInitialFields(options);
            });
        };

        function getFileList(options) {
            return options.$uploaderControl.find('.' + options.fileListClass);
        }

        function createFileList(options) {
            var $fileList = $('<ul />')
                .addClass(options.fileListClass);
            return options.$uploaderControl.prepend($fileList);
        }

        function createAddButton(options) {
            var $addButton = $('<button></button>')
                .addClass(options.addButtonClass)
                .text(options.addButtonCaption);

            options.$uploaderControl.append($addButton);

            return $addButton.click(function(e) {
                e.preventDefault()
                addFileInput(getFileList(options), true);
            });
        }

        function addInitialFields(options) {
            for (var i = 0; i < options.initialFieldCount; i++) {
                addFileInput(getFileList(options), options.initialRequired);
            }
        }

        $(document).ready(function() {
            $('.file-uploader').multipleFileUploader();
        });
    })(Handlebars);

})(jQuery);