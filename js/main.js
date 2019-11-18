(($, document) => {

  $(document).ready(() => {
    $(document).foundation();

    $('.section--welcome').find('h2').find('b').each(function (i) {
      let $this = $(this);

      setTimeout(() => {
        $this.addClass('visible current').siblings('b').removeClass('current');
      }, parseFloat($this.data('animationDelay')));
    });

    setTimeout(() => {
      $('.section--home, .section--welcome').addClass('did-welcome');
    }, 10250);
  });

})(jQuery, document);
