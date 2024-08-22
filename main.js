/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek (tua)
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $('.cd');
const heading = $('header h2'); //Song name
const cdThumb = $('.cd-thumb'); //Song image
const audio = $('#audio');//Song URL
const playBtn = $('.btn-toggle-play')// Play btn
const player = $('.player')
const iconPlay = $('.player.playing .icon-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const song = $('.song')
const playList = $('.playlist')

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'


const app = {
  currentIndex: 0,

  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function(key,value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },

  songs: [
    {
      name: "Chạy ngay đi",
      singer: "Sơn tùng MTP",
      path: "./assets/mucsic/ChayNgayDi-SonTungMTP-5468704.mp3",
      image: "./assets/img/ChayNgayDi.jpg"
    },
    {
      name: "Chúng ta của hiện tại",
      singer: "Sơn tùng MTP",
      path: "./assets/mucsic/ChungTaCuaHienTai-SonTungMTP-6892340.mp3",
      image: "./assets/img/ChungTaCuaHienTai.jpg"
    },
    {
      name: "Họ yêu ai mất rồi",
      singer: "Doãn Hiếu",
      path: "./assets/mucsic/HoYeuAiMatRoi.mp3",
      image: "./assets/img/HoYeuAiMatRoi.jpg"
    },
    {
      name: "Ghệ yêu dấu của em ơi",
      singer: "Tlinh",
      path: "./assets/mucsic/GheIuDauCuaEmOi-tlinh2pillzWOKEUPAT4AM-8677578.mp3",
      image: "./assets/img/GheYeu.jpg"
    },
    {
      name: "Làm lành chữa tình",
      singer: "Tlinh",
      path: "./assets/mucsic/LamLanhChuaTinh-tlinh-10715560.mp3",
      image: "./assets/img/LamLanh.jpg"
    },
    {
      name: "Nếu lúc đó",
      singer: "Tlinh",
      path: "./assets/mucsic/NeuLucDo-tlinh2pillz-8783613.mp3",
      image: "./assets/img/NeuLucDo.jpg"
    },
    {
      name: "Người điên",
      singer: "Tlinh",
      path: "./assets/mucsic/NguoiDien-tlinh-10715124.mp3",
      image: "./assets/img/NguoiDien.jpg"
    },
    {
      name: "Nữ siêu anh hùng",
      singer: "Tlinh",
      path: "./assets/mucsic/NuSieuAnhHung-tlinh-10715744.mp3",
      image: "./assets/img/SieuAnhHung.jpg"
    },
    {
      name: "Tình yêu có nghĩa là gì",
      singer: "Tlinh",
      path: "./assets/mucsic/TinhYeuCoNghiaLaGi-tlinh-10714742.mp3",
      image: "./assets/img/TinhYeuCoNghiaLaGi.jpg"
    },
  ],

  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : '' }" data-index=${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
      `
    })

    playList.innerHTML = htmls.join('');
  },

  handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth;

    //Xử lý CD quay /dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity
    })
    cdThumbAnimate.pause()

    //Xử lý phóng to/thu nhỏ CD
    document.onscroll = function() {
      const scrollTop = document.documentElement.scrollTop || window.scrollY; // 2 cách lấy tọa độ Y khi croll chuột
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0; // Check tọa độ > 0
      cd.style.opacity = newCdWidth / cdWidth; // Làm mờ dần cd
    }

    //Xử lý khi click play / pause
    playBtn.onclick = function() {
      if(app.isPlaying) {
        audio.pause();
      }else {
        audio.play();
      }
    }

    //Lắng nghe sự kiện khi song được play
    audio.onplay = function() {
      player.classList.add('playing');
      app.isPlaying = true;
      cdThumbAnimate.play()
    }
    //Lắng nghe sự kiện khi song được pause
    audio.onpause = function() {
      player.classList.remove('playing');
      app.isPlaying = false;
      cdThumbAnimate.pause()
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
      if(audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }

    //Xử lý khi tua
    progress.onchange = function(e) {
      const seekTime = audio.duration / 100 * e.target.value
      audio.currentTime = seekTime;
    } 

    //Khi next song
    nextBtn.onclick = function() {
      if(_this.isRandom) {
        _this.playRandomSong()
      }else {
        _this.nextSong()
      }

      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    //Khi prev song
    prevBtn.onclick = function() {
      if(_this.isRandom) {
        _this.playRandomSong()
      }else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    //Xu ly bat / tat random song
    randomBtn.onclick = function() {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    //Xu ly next song khi audio ended
    audio.onended = function() {
      if(_this.isRepeat) {
        audio.play()
      }else {
        nextBtn.click()
      }
    }

    //Xu ly lap lai song
    repeatBtn.onclick = function() {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    //Lang nghe hanh vi click vao playList
    playList.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')
      if( songNode || !e.target.closest('.option')) {
        //Xu ly khi click vao song
        if(songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }

        //Xu ly khi click vao option
        if(!e.target.closest('.option')) {

        }
      }
    }
    
  },

  definedProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex]
      }
    })
  }, // Dùng defindedProperties có thể dùng app.currentSong để get ra bài hát đầu tiên nhanh gọn

  loadCurrentSong: function() {
    heading.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },
  scrollToActiveSong: function() {
    if(this.currentIndex == 0) {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }else {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, 100)
    }
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat= this.config.isRepeat
  },
  nextSong: function() {
    this.currentIndex++;
    if(this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong()
  },

  prevSong: function() {
    this.currentIndex--
    if(this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },

  playRandomSong: function() {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    }while (newIndex === this.currentIndex)

      this.currentIndex = newIndex
      this.loadCurrentSong()
  },

    

  start: function() {
    //Gan cau hinh tu config vao ung dung
    this.loadConfig()

    //Định nghĩa các thuộc tính cho Object
    this.definedProperties()

    //Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents()

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong()

    //render Playlist
    this.render()

    //Hien thi trang thai ban dau 
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)

  }
}

app.start();

