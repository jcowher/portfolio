(($, document) => {

  $(document).ready(() => {
    $(document).foundation();
    $('.section--home').find('h2').find('b').each(function (i) {
      let $this = $(this);

      setTimeout(function () {
        $this.addClass('visible current').siblings('b').removeClass('current');
      }, parseFloat($this.data('animationDelay')));
    });
  });

})(jQuery, document);
