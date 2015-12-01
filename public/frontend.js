var socket = io();

var sound = null;
var signal = null;
var slowingIntervall = function(x) { return Math.floor(Math.sqrt(x+1)*x); };

soundManager.setup({
	preferFlash: false,
	onready: function() {
		sound = soundManager.createSound({
			url: '/auswahlrunde_loop.wav',
			autoLoad: true,
			autoPlay: false,
			loops: 100,
			volume: 50/*,
			onload: function() {
				sound.play();
			}*/
		});
		signal = soundManager.createSound({
			url: '/finished.mp3',
			autoLoad: true,
			autoPlay: false,
			volume: 100
		});
	}
});

var vm = new Vue({
	el: '#app',
	data: {
		number: 0,
		numbers: [],
		pickedNumbers: [],
		minNumber: 80,
		maxNumber: 120,
		ports: [],
		selectedPort: {},
		shuffling: false,
		steps: 47,
		i: 0,
		showBottomBar: true
	},
	ready: function() {
		$('.number').flowtype({
			maxFont: 900,
			fontRatio: 10
		});
		this.resetList();
	},
	methods: {
		portChanged: function() {
			socket.emit('port-changed', this.selectedPort.comName);
		},
		updatePorts: function(ports) {
			this.ports = ports;
			this.selectedPort = this.ports[0];
			this.portChanged();
		},
		shuffle: function(num) {
			if (this.i < this.steps) {
				var rand = Math.random();
				var number = Math.floor(rand * this.numbers.length);
				this.number = this.numbers[number];
				this.i++;
				setTimeout(function() {this.shuffle(num)}.bind(this), slowingIntervall(this.i));
			} else {
				signal.play();
				sound.stop();
				this.number = this.numbers[num];
				this.pickedNumbers.unshift(this.number);
				this.numbers.splice(num, 1);

				this.shuffling = false;
				this.i = 0;
			}
			
		},
		startShuffle: function() {
			if (this.numbers.length > 0 && !this.shuffling) {
				var rand = Math.random();
				var num = Math.floor(rand * this.numbers.length);
				
				this.shuffling = true;
				this.i = 0;
				sound.play();
				setTimeout(function() {this.shuffle(num)}.bind(this), slowingIntervall(this.i));
			} else if (this.numbers.length == 0) {
				this.number = 0;
			}
		},
		resetList: function() {
			this.numbers = [];
			this.pickedNumbers = [];
			this.number = 0;
			for (var i = 0; i < (this.maxNumber - this.minNumber + 1); i++) {
				this.numbers[i] = this.minNumber + i;
			}
			console.log(this.numbers);
		}
	}
});

vm.$watch('minNumber', function(newVal, oldVal) {
	vm.resetList();
});

vm.$watch('maxNumber', function(newVal, oldVal) {
	vm.resetList();
});

// New ports list received
socket.on('ports', function(ports) {
	vm.updatePorts(ports);
});

// Button event received
socket.on('evt', function(evt) {
	if (evt.type == "button" && evt.action == "released") {
		vm.startShuffle();
	}
});