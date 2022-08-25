btn = document.getElementById("record");
btn.recording = false;

container = document.getElementsByTagName("main")[0]

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    let chunks = [];

    let onSuccess = function(stream) {
        const mediaRecorder = new MediaRecorder(stream);

        btn.onclick = function() {
            if (!btn.recording) {
                // Start recording
                btn.recording = true;
                btn.classList.add("recording");
                mediaRecorder.start();
            } else {
                // Stop recording
                btn.classList.remove("recording");
                btn.recording = false;
                mediaRecorder.stop()
                
            }
            console.log(mediaRecorder.state);
        }
       
        mediaRecorder.onstop = function(e) {
            console.log("data available after MediaRecorder.stop() called.");

            const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
            const audio = document.createElement('audio-player');
            audio.title = clipName;
            container.appendChild(audio);
            audio.controls = true;

            const blob = new Blob(chunks, {'type': 'audio/mp3;'});
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            console.log(audioURL);
            audio.setAttribute('src', audioURL);
        }

        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
    }

    let onError = function(err) {
        console.error(err);
    }

    navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess, onError);
    
  } else {
    console.log("getUserMedia not supported on your browser!");
  }