document.addEventListener('DOMContentLoaded', () => {
    
    // Declarações
    
    const display = document.querySelector('#display');
    const record = document.querySelector('#record');
    const micInput = document.querySelector('#mic');
    
    let isRecording = false;
    let selectedMicId = null;
    let mediaRecorder = null;
    let startTime = null;
    let chunks = [];
    
    // Dispositivos disponíveis
    
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            devices.forEach(device => {
                if (device.kind === 'audioinput') {
                    if (!selectedMicId) {
                        selectedMicId = device.deviceId;
                    }
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label;
    
                    micInput.appendChild(option);
                }
            })
        })
    
    micInput.addEventListener('change', (event) => {
        selectedMicId = event.target.value
    })
    
    
    
    function updateButton(recording) {
        if (recording) {
            document.querySelector('#record').classList.add('recording');
            document.querySelector('#mic-icon').classList.add('hide');
        } else {
            document.querySelector('#record').classList.remove('recording');
            document.querySelector('#mic-icon').classList.remove('hide');
        }
    }
    
    record.addEventListener('click', () => {
        updateButton(!isRecording);
        handleRecord(isRecording)
    
        isRecording = !isRecording;
    })
    
    function handleRecord(recording) {
        if (recording) {
            mediaRecorder.stop();
        } else {
            navigator.mediaDevices.getUserMedia({
                audio: { deviceId: selectedMicId }, video: false
            }).then(stream => {
                mediaRecorder = new MediaRecorder(stream)
                mediaRecorder.start();
                startTime = Date.now();
                updateDisplay()
                mediaRecorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                }
                mediaRecorder.onstop = (event) => {
                    saveData()
                }
            })
        }
    }
    function saveData() {
        const blob = new Blob(chunks, { type: 'audio/webm; codecs=opus' });
        console.log(blob);
        blob.arrayBuffer().then((blobBuffer) => {
          const uint8Array = new Uint8Array(blobBuffer);
          window.myAPI.saveBuffer(uint8Array);
        });
        chunks = [];
      }
      
    
    function updateDisplay() {
        display.innerHTML = durationFormat(Date.now() - startTime);
        if (isRecording)
            window.requestAnimationFrame(updateDisplay);
    }
    
    function durationFormat(duration) {
        let mili = parseInt((duration % 1000) / 100 )
        let seconds = Math.floor((duration/1000) % 60);
        let minutes = Math.floor((duration/1000/60) % 60);
        let hours = Math.floor((duration/1000/60/60));
    
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        hours = hours < 10 ? '0' + hours : hours;
        
        return `${hours}:${minutes}:${seconds}.${mili}`
    }
    });
    
    window.onload = () => {
    document.body.classList.remove('preload');
    }