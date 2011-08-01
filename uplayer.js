// μPlayer 1.0.0 (20100625)
// A Simple HTML5/JavaScript Audio Widget
// By John Terenzio | http://terenz.io/uplayer/ | MIT License

window.uPlayer = function (config) {

	// abort if we don't have HTML5 support
	if (!document.createElement('canvas').getContext) {
		return;
	}

	// abort on iPad and iPhone for now, issues with fillText break layout
	if (navigator.userAgent.match(/ipad|iphone/i)) {
		return;
	}

	/*
	 *  INITIAL SETUP
	 */

	// handle the config object and set defaults
	config.divId = config.divId || 'uPlayer' + Math.round(Math.random() * 999999999);
	config.divClass = config.divClass || 'uPlayer';
	config.height = config.height || config.width / 10;
	config.mainColor = config.mainColor || '#AAA';
	config.progressColor = config.progressColor || '#777';
	config.textColor = config.textColor || '#000';
	if (config.ogg) {
		config.ogg = '<source src="' + config.ogg + '" type="audio/ogg" />';
	} else {
		config.ogg = '';
	}
	if (config.mp3) {
		config.mp3 = '<source src="' + config.mp3 + '" type="audio/mpeg" />';
	} else {
		config.mp3 = '';
	}
	if (config.wav) {
		config.wav = '<source src="' + config.wav + '" type="audio/x-wav" />';
	} else {
		config.wav = '';
	}

	// write the HTML to the page
	document.write('<div id="' + config.divId + '" class="' + config.divClass + '"><canvas width="' + config.width + '" height="' + config.height + '"></canvas><audio>' + config.ogg + config.mp3 + config.wav + '</audio></div>');

	// get the canvas element
	var player = document.getElementById(config.divId).getElementsByTagName('canvas')[0];

	// set up the context for drawing stuff
	var ctx = player.getContext('2d');
	var w = player.width;
	var h = player.height;

	// get the audio element
	var audio = document.getElementById(config.divId).getElementsByTagName('audio')[0];

	/*
	 *  DRAWING FUNCTIONS
	 */

	// draw the play button
	var drawPlay = function () {
			ctx.clearRect(0, 0, h, h);
			ctx.fillStyle = config.mainColor;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, h);
			ctx.lineTo(h, h / 2);
			ctx.lineTo(0, 0);
			ctx.fill();
			ctx.closePath();
		};

	// draw the pause button
	var drawPause = function () {
			ctx.clearRect(0, 0, h, h);
			ctx.fillStyle = config.mainColor;
			ctx.fillRect(0, 0, h / 3, h);
			ctx.fillRect(h * (2 / 3), 0, h / 3, h);
		};

	// draw the empty progress bar
	var drawBar = function () {
			ctx.fillStyle = config.mainColor;
			ctx.fillRect(h / (4 / 5), h / 4, w - h / (4 / 5), h / 2);
		};

	// draw the progress over the bar
	var drawProgress = function () {
			var length = Math.round((audio.currentTime / audio.duration) * (w - h / (4 / 5)));
			ctx.fillStyle = config.progressColor;
			ctx.fillRect(h / (4 / 5), h / 4, length, h / 2);
		};

	// draw the title if given or the source file's name
	var drawTitle = function () {
			var title = config.title || audio.currentSrc.split('/')[audio.currentSrc.split('/').length - 1];
			ctx.fillStyle = config.textColor;
			ctx.font = (h * (3 / 8)) + 'px sans-serif';
			ctx.textAlign = 'end';
			ctx.fillText(title, w - h / 4, h / (8 / 5));
		};

	// draw current time / total time
	var drawTime = function () {
			ctx.fillStyle = config.textColor;
			ctx.font = (h * (3 / 8)) + 'px sans-serif';
			ctx.textAlign = 'end';
			var currentTime = new Date(1970, 0, 1);
			currentTime.setSeconds(audio.currentTime);
			currentTime = currentTime.toTimeString().substr(3, 5);
			var duration = new Date(1970, 0, 1);
			duration.setSeconds(audio.duration);
			duration = duration.toTimeString().substr(3, 5);
			ctx.fillText(currentTime + ' / ' + duration, w - h / 4, h / (8 / 5));
		};

	/*
	 *  HANDLING USER INTERACTION
	 */

	// helper function to get offset of element relative to document
	var getOffset = function (elem) {
			var top = elem.offsetTop;
			var left = elem.offsetLeft;
			while (elem.offsetParent) {
				elem = elem.offsetParent;
				top += elem.offsetTop;
				left += elem.offsetLeft;
			}
			return {
				top: top,
				left: left
			};
		};

	// handle clicking on the canvas
	var playerClick = function (e) {

			var playerOffset = getOffset(player);
			var x = e.pageX - playerOffset.left;
			var y = e.pageY - playerOffset.top;

			// play/pause click
			if ((x >= 0 && x <= h) && (y >= 0 && y <= h)) {
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
			}

			// progress bar click
			if ((x >= h / (4 / 5)) && ((y >= h / 4 && y <= (h / 4) + (h / 2)))) {
				audio.currentTime = Math.round(((x - h / (4 / 5)) / (w - h / (4 / 5))) * audio.duration);
			}

		};

	/*
	 *  EVENT LISTENERS
	 */

	// init the player on metadata ready
	audio.addEventListener('loadedmetadata', function () {
		drawPlay();
		drawBar();
		drawTitle();
		player.onclick = playerClick;
		if (config.autoplay) {
			audio.play();
		}
	}, true);

	// change the button on play/pause
	audio.addEventListener('play', drawPause, true);
	audio.addEventListener('pause', drawPlay, true);

	// update the bar and time on time change
	audio.addEventListener('timeupdate', function () {
		if (audio.currentTime > 0) {
			drawBar();
			drawProgress();
			if (!config.autoplay || (config.autoplay && audio.currentTime > 3)) {
				drawTime();
			} else {
				drawTitle();
			}
		} else {
			drawBar();
			drawTitle();
		}
	}, true);

	// reset the player on end
	audio.addEventListener('ended', function () {
		audio.currentTime = 0;
		audio.pause();
	}, true);

};
