(($, document) => {

  function Banner() {
    let word = 'HELLO';
    let denseness = 10;
    let canvas, context, bgCanvas, bgContext;
    let particles = [];
    let itercount = 0;
    let itertot = 40;

    this.initialize = canvasId => {
      canvas = document.getElementById(canvasId);
      context = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bgCanvas = document.createElement('canvas');
      bgContext = bgCanvas.getContext('2d');
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;

      start();
    };

    let end = () => {
      let i;
      for (i = 0; i < particles.length; i++) {
        particles[i].r = true;
      }
      setTimeout(() => {
        $('.section--home, .section--welcome').addClass('did-welcome');
      }, 4000);
    };

    let start = () => {
      bgContext.fillStyle = '#111';
      bgContext.font = '900 200px "Avenir Next"';
      bgContext.textAlign = 'center';
      bgContext.textBaseline = 'middle';
      bgContext.fillText(word, canvas.width / 2, canvas.height / 2);
      clear();
      getCoords();
      setTimeout(end, 5000);
    };

    let clear = () => {
      context.fillStyle = '#111';
      context.beginPath();
      context.rect(0, 0, canvas.width, canvas.height);
      context.closePath();
      context.fill();
    };

    let drawCircle = (x, y) => {
      let startx = (Math.random() * canvas.width);
      let starty = (Math.random() * canvas.height);
      let velx = (x - startx) / itertot;
      let vely = (y - starty) / itertot;

      particles.push({
        "c": '#' + (Math.random() * 0x949494 + 0xaaaaaa | 0).toString(16),
        "x": x,
        "y": y,
        "x2": startx,
        "y2": starty,
        "r": true,
        "v": {
          "x": velx,
          "y": vely
        }
      })
    };

    let update = () => {
      let i;

      itercount++;
      clear();

      for (i = 0; i < particles.length; i++) {
        // If the dot has been released fly into infinity
        if (particles[i].r === true) {
          particles[i].x2 += particles[i].v.x;
          particles[i].y2 += particles[i].v.y;
        }

        if (itercount === itertot) {
          particles[i].v = {
            "x": (Math.random() * 6) * 2 - 6,
            "y": (Math.random() * 6) * 2 - 6
          };
          particles[i].r = false;
        }

        // Draw the circle
        context.fillStyle = particles[i].c;
        context.beginPath();
        context.arc(particles[i].x2, particles[i].y2, 4, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
    };

    let getCoords = () => {
      let imageData, pixel, height, width;

      imageData = bgContext.getImageData(0, 0, canvas.width, canvas.height);

      // iterate over all pixels
      for (height = 0; height < bgCanvas.height; height += denseness) {
        for (width = 0; width < bgCanvas.width; width += denseness) {
          pixel = imageData.data[((width + (height * bgCanvas.width)) * 4) - 1];

          // Pixel is black from being drawn on.
          if (pixel === 255) {
            drawCircle(width, height);
          }
        }
      }

      setInterval(update, 40);
    };
  }

  $(document).ready(() => {
    $(document).foundation();

    let banner = new Banner();
    banner.initialize('section-welcome-canvas');
  });

})(jQuery, document);
