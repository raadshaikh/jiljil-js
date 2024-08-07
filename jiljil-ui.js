(() => {
    class GameUI {
        /**
         * @param {HTMLCanvasElement} canvas 
         */
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
			this.ctx.scale(window.scale, window.scale); //zoom
			this.ctx.imageSmoothingEnabled = false;
            this.game = null;
            this.requested = false;

            this.canvas.addEventListener("wheel", this.onScroll.bind(this));
            if ("ontouchstart" in window) {
                this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
                this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
                this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
            }
            
            this.bmp_jiljil = new Image();
            this.bmp_jiljil.src = "BITMAP/BMP_JILJIL.png";
            this.bmp_jiljil.addEventListener("load", this.onImageLoad.bind(this));
            this.bmp_escape = new Image();
            this.bmp_escape.src = "BITMAP/BMP_ESCAPE.png";
            this.bmp_escape.addEventListener("load", this.onImageLoad.bind(this));
            this.bmp_charactor = new Image();
            this.bmp_charactor.src = "BITMAP/BMP_CHARACTOR.png";
            this.bmp_charactor.addEventListener("load", this.onImageLoad.bind(this));
			
			
			this.frameCount = 0; //
			
			
			this.bgm1_url = new URL('https://raadshaikh.github.io/jiljil-js/WAVE/BGM1.wav');
			this.bgm1 = new Audio(this.bgm1_url);
			this.bgm1.crossOrigin = "anonymous";
			this.bgm1_playing = false;
			this.bgm2_url = new URL('https://raadshaikh.github.io/jiljil-js/WAVE/BGM2.wav');
			this.bgm2 = new Audio(this.bgm2_url);
			this.bgm2.crossOrigin = "anonymous";
			this.bgm2_playing = false;
			this.se = [];
			for(let i=0; i<=11; i++){
				this.se[i] = new Audio(new URL('https://raadshaikh.github.io/jiljil-js/WAVE/SE'+String(i+1).padStart(2,'0')+'.wav'))
			}
			
			window.audioContext = new AudioContext();
			this.buffer = 0;
			this.source = 0;
        }
		
        async loadAudio(val) {
			  try {
				const response = await fetch(val==1?this.bgm1_url:this.bgm2_url);
				// Decode it
				this.buffer = await window.audioContext.decodeAudioData(await response.arrayBuffer());
			  } catch (err) {
				console.error(`Unable to fetch the audio file. Error: ${err.message}`);
			  }
		}
        async play_bgm(val){
				await this.loadAudio(val);
				this.source = window.audioContext.createBufferSource();
				this.source.loop = true;
				this.source.buffer = this.buffer;
				this.source.connect(window.audioContext.destination);
				this.source.start();
		}
		async stop_bgm(){
			if(this.source){
				this.bgm1_playing = false;
				this.bgm2_playing = false;
				this.source.stop();
				}
		}
		
        onTouchStart(e) {
            this.touching = true;
            this.touchX = e.touches[0].pageX;
            this.touchY = e.touches[0].pageY;
        }

        onTouchMove(e) {
            if (this.touching) {
                e.preventDefault();
                //const offX = this.touchX - e.touches[0].pageX;
                const offY = this.touchY - e.touches[0].pageY;
                this.touchX = e.touches[0].pageX;
                this.touchY = e.touches[0].pageY;

                this.onScroll({ deltaY: offY });
            }
        }

        onTouchEnd() {
            this.touching = false;
            this.touchX = 0;
            this.touchY = 0;
        }

        onScroll(e) {
            this.scrollY += e.deltaY;
            this.onUpdate();
        }
        

        onImageLoad() {
            if (this.bmp_jiljil.complete && this.bmp_escape.complete && this.bmp_charactor.complete) {
                this.onUpdate();
            }
        }
		
        setGame(game) {
            this.game = game;
            this.game.onUpdate = this.draw.bind(this);
        }

        drawNumber(x, y, number, zeroPad = 0, rtl=false) {
            let str = number.toString();
            while (str.length < zeroPad) {
                str = "0" + str;
            }
			if (rtl==false) {
				for (let i = 0; i < str.length; i++) {
					this.ctx.drawImage(this.bmp_jiljil, (str.charCodeAt(i) - 0x30) * 8, 112, 8, 16, x + 8*i, y, 8, 16);
				}
			}
			else if(rtl==true) //right-to-left, for right-aligned numbers
				for (let i = str.length-1; i >= 0; i--) {
					this.ctx.drawImage(this.bmp_jiljil, (str.charCodeAt(i) - 0x30) * 8, 112, 8, 16, x - 8*(str.length-i), y, 8, 16);
				}
        }
		
		drawString(x, y, str){
			for(let i=0; i<str.length; i++){
				this.ctx.drawImage(this.bmp_charactor, 8*((str.charCodeAt(i)-0x20)%10), 8*~~((str.charCodeAt(i)-0x20)/10), 8, 8, x+8*i, y, 8, 8); //~~ is shortcut for floor function somehow
			}
		}

        onUpdate() {
            if (this.requested) return;
            this.requested = true;
            window.requestAnimationFrame(this.draw.bind(this));
        }

        draw() {
            this.requested = false;

            const { width, height } = this.canvas;
			this.ctx.fillStyle = 'black';
			this.ctx.fillRect(0, 0, width, height);
			
			
			
			switch(this.game.gameState) {
				case 'loading':
					this.drawString(118,window.height/2-4,'...LOADED!');
					this.ctx.drawImage(this.bmp_jiljil, 64, 36, 64, 12, 130, 164, 64, 12); //'Push Space'
					break;
					
				case 'startscreen':
					this.stop_bgm();
					if(this.frameCount==28){this.se[7].play();}
					if(this.frameCount>60){
						this.ctx.drawImage(this.bmp_jiljil, 88, 64, 36, 20, 124, 50, 36, 20); //'JiL'
						this.ctx.drawImage(this.bmp_jiljil, 88, 64, 36, 20, 124+36, 50, 36, 20); //'JiL'
					}
					if(this.frameCount==60){this.se[8].play();}
					if(this.frameCount>92){
						this.ctx.drawImage(this.bmp_jiljil, 80, 24, 48, 8, 137, 119, 48, 8); //'1997-10-xx'
					}
					if(this.frameCount==92){this.se[9].play();}
					if(this.frameCount>128){
						this.ctx.drawImage(this.bmp_jiljil, 64, 102, 56, 10, 132, 139, 56, 10); //'Tortoiseshell'
					}
					if(this.frameCount==128){this.se[10].play();}
					if(this.frameCount>172){
						this.ctx.drawImage(this.bmp_jiljil, 64, 36, 64, 12, 130, 164, 64, 12); //'Push Space'
					}
					if(this.frameCount==172){this.se[11].play();}
					this.frameCount += 1;
					break;
				
				case 'playing':	
					if(!this.bgm1_playing){
						this.stop_bgm();
						this.play_bgm(1);
						this.bgm1_playing = true;
					}
					
					// this.ctx.drawImage(this.bmp_jiljil, 0, 85, 2, 2, this.game.playerCurPos.x-2/2, this.game.playerCurPos.y-2/2, 2, 2); //dot that represents 'player cursor', see jiljil.js for details. comment out when finished
					
					this.frameCount += 1;
					break;
				
				case 'gameover':
					if(!this.bgm2_playing){
						this.stop_bgm();
						this.play_bgm(2);
						this.bgm2_playing = true;
					}
					
					this.ctx.drawImage(this.bmp_jiljil, 64, 36, 64, 12, 48, 48, 64, 12); //'push space'
					break;
					
				case 'escmenu':
					// this.bgm1.pause();
					// this.bgm2.pause();
					this.ctx.drawImage(this.bmp_escape, 0, 0, 80, 16, 8, 8, 80, 16); //pause screen
					break;
					
				default:
					break;
			}
			
			if(this.game.gameState == 'playing' || this.game.gameState == 'gameover'){
				for(let i=1; i<=14; i++){
					this.ctx.drawImage(this.bmp_jiljil, 64, 64, 20, 20, i*20, 0, 20, 20); //ceiling
					this.ctx.drawImage(this.bmp_jiljil, 64, 64, 20, 20, i*20, 240-20, 20, 20); //floor
				}
				this.ctx.drawImage(this.bmp_jiljil, 0, 48, 64, 64, this.game.lemonPos.x-64/2, this.game.lemonPos.y-64/2, 64, 64); //lemon
				for(let i=6; i>=0; i--){ //worm segments
						this.ctx.drawImage(this.bmp_jiljil, 16*(i+1), 0, 16, 16, this.game.playerSegPos[i].x-16/2, this.game.playerSegPos[i].y-16/2, 16, 16);
				}
				this.ctx.drawImage(this.bmp_jiljil, 64*(this.game.gameState=='gameover'), 16*(this.game.gameState=='gameover'), 16, 16, this.game.playerPos.x-16/2, this.game.playerPos.y-16/2, 16, 16); //worm head (crying or not depending on gameover)
				this.ctx.drawImage(this.bmp_jiljil, 0, 16, 32, 32, this.game.paw0Pos.x-32/2, this.game.paw0Pos.y-32/2, 32, 32); //pawprints
				this.ctx.drawImage(this.bmp_jiljil, 32, 16, 32, 32, this.game.paw1Pos.x-32/2, this.game.paw1Pos.y-32/2, 32, 32); //pawprints
				if(this.game.gameState=='playing'){//sparkle
					this.ctx.drawImage(this.bmp_jiljil, 64+16*(this.game.sparkleFrame), 48, 16, 16, this.game.sparklePos.x-16/2, this.game.sparklePos.y-16/2, 16, 16);
				}
				this.ctx.drawImage(this.bmp_jiljil, 63, 94, 24, 8, 20, 211, 24, 8); //'teema:'
				this.ctx.drawImage(this.bmp_jiljil, 64, 84, 64, 8, 48, 211, 64, 8); //'shippo ga abunai'
				this.ctx.drawImage(this.bmp_jiljil, 80, 16, 48, 8, 140, 223, 48, 8); //'esc->exit'
				this.ctx.drawImage(this.bmp_jiljil, 80, 120, 48, 8, 225, 211, 48, 8); //'score'
				this.ctx.drawImage(this.bmp_jiljil, 80, 120, 48, 8, 225, 20, 48, 8); //'score'
				this.ctx.drawImage(this.bmp_jiljil, 80, 112, 18, 8, 207, 21, 18, 8); //'hi'
				this.drawNumber(275, 203, this.game.score, 3); //score
				this.drawNumber(275, 20, this.game.highscore, 3); //high score
			}
			if(this.game.gameState == 'gameover'){this.ctx.drawImage(this.bmp_jiljil, 64, 36, 64, 12, 48, 48, 64, 12);}
        }
    }

    window.GameUI = GameUI;
	
})();