class AudioPlayer extends HTMLElement {
    playing = false;
    initialized = false;

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.render();
    }

    static get observedAttributes() {
        return [
            'src', 'muted', 'crossorigin', 'loop', 'preload', 'autoplay','title'
        ];
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        console.log("changed", name, newValue)
        switch (name) {
            case 'src':
                this.initialized = false;
                this.render();
                this.initializeAudio();
                break;
            case 'title':
                this.titleElement.textContent = newValue;
                break;
            default:
        }
        this.updateAudioAttributes(name, newValue);
    }

    updateAudioAttributes(name, value) {
        if (!this.audio || name == "title") return;
        if (this.attributes.getNamedItem(name)) {
            this.audio.setAttribute(name, value ?? '')
        } else {
            this.audio.removeAttribute(name);
        }
    }

    initializeAudio() {
        if (this.initialized) return;

        this.initialized = true;

        this.audioCtx = new AudioContext();
        this.track = this.audioCtx.createMediaElementSource(this.audio);
        this.track.connect(this.audioCtx.destination);
        console.log("init")
    }

    attachEvents() {
        this.playBtn.addEventListener('click', this.togglePlay.bind(this), false);
        this.progressBar.addEventListener('input', (e) => this.seekTo(this.progressBar.value), false);

        this.shareBtn.addEventListener('click', this.shareAudio.bind(this), false);

        this.audio.addEventListener('loadedmetadata', () => {
            this.progressBar.max = this.audio.duration;
            this.durationElem.textContent = this.getTimeString(this.audio.duration);
            this.updateAudioTime();
        }, false);

        this.audio.addEventListener('timeupdate', () => {
            this.updateAudioTime(this.audio.currentTime);
        }, false);

        this.audio.addEventListener('ended', () => {
            this.playing = false;
            this.playBtn.textContent = 'play';
            this.playBtn.classList.remove('playing');
        }, false);

        this.audio.addEventListener('pause', () => {
            this.playing = false;
            this.playBtn.textContent = 'play';
            this.playBtn.classList.remove('playing');
        }, false);

        this.audio.addEventListener('play', () => {
            this.playing = true;
            this.playBtn.textContent = 'pause';
            this.playBtn.classList.add('playing');
        }, false);
    }

    async togglePlay() {
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }

        if (this.playing) {
            return this.audio.pause();
        }
        return this.audio.play();
    }
    
    async shareAudio() {
        let blob = await fetch(this.attributes.getNamedItem("src")?.value).then(r => r.blob());
        let data = {
            title: this.attributes.getNamedItem("title")?.value,
            files: [blob]
        }
        navigator.share(data);
    }

    getTimeString(time) {
        const secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, '0');
        const min = `${parseInt(`${(time / 60) % 60}`, 10)}`.padStart(2, '0');
        //const min = parseInt(`${(time / 60) % 60}`, 10);
        return `${min}:${secs}`;
    }

    seekTo(value) {
        this.audio.currentTime = value;
    }

    updateAudioTime() {
        this.progressBar.value = this.audio.currentTime;
        this.currentTimeElem.textContent = this.getTimeString(this.audio.currentTime);
    }

    style() {
        return `
        <style>
        </style>
        `
    }

    render() {
        this.shadowRoot.innerHTML = `
        ${this.style()}
        <div>
            <audio style="display:none"></audio>
            <span class="audio-title"></span>
            <input type="range" max="100" value="0" class="progress-bar">
            <div>
                <span class="current-time">00:00</span>
                <span class="duration">00:00</span>
            </div>
            <button class="play-btn">Play</button>
            <a class="download" href="" download" >download</a>
            <button class="share">Share</button>
        </div>
        `;

        this.audio = this.shadowRoot.querySelector('audio');
        this.playBtn = this.shadowRoot.querySelector('.play-btn');
        this.donwloadBtn = this.shadowRoot.querySelector('.download');
        this.shareBtn = this.shadowRoot.querySelector('.share');
        this.titleElement = this.shadowRoot.querySelector('.audio-title');
        this.progressBar = this.shadowRoot.querySelector('.progress-bar');
        this.currentTimeElem = this.shadowRoot.querySelector('.current-time');
        this.durationElem = this.shadowRoot.querySelector('.duration');

        //this.titleElement.textContent = this.attributes.getNamedItem('src') ? this.attributes.getNamedItem('title').value ?? 'untitled': 'No Audio Source Provided';
        this.titleElement.textContent = this.attributes.getNamedItem('src') ? this.attributes.getNamedItem('title').value : "untitled";

        this.donwloadBtn.href = this.attributes.getNamedItem('src')?.value;
        this.donwloadBtn.download = this.attributes.getNamedItem('title')?.value + this.donwloadBtn.href?.split(".").slice(-1)[0];

        for (let i = 0; i < this.attributes.length; i++) {
            let element = this.attributes[i];
            this.updateAudioAttributes(element.name, element.value);
        }
        
        this.attachEvents();
    }
}

customElements.define('audio-player', AudioPlayer);