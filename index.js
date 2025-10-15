let mainOsc = null;
let mainGain = null;

// Create audio context
const audioContext = new window.AudioContext();

// Create LFO
lfo = audioContext.createOscillator();
lfo.frequency.value = 1; // 1 Hz
lfo.type = "sawtooth";

// LFO gain
lfoGain = audioContext.createGain();
lfoGain.gain.value = -1200; // Modulation depth of 1200 cents

// Create oscillator
mainOsc = audioContext.createOscillator();

// Create gain node for volume control
mainGain = audioContext.createGain();

// Connect nodes
lfo.connect(lfoGain);

lfoGain.connect(mainOsc.detune);

mainOsc.connect(mainGain);

mainGain.connect(audioContext.destination);

// Update displayed values
document.getElementById('frequency').addEventListener('input', function() {
    document.getElementById('freqValue').textContent = this.value;
    if (mainOsc) {
        mainOsc.frequency.setValueAtTime(this.value, mainOsc.context.currentTime);
    }
});

document.getElementById('volume').addEventListener('input', function() {
    document.getElementById('volumeValue').textContent = this.value;
    if (mainGain) {
        mainGain.gain.setValueAtTime(this.value / 100, mainGain.context.currentTime);
    }
});

document.getElementById('waveform').addEventListener('change', function() {
    if (mainOsc) {
        mainOsc.type = this.value;
    }
});

// Wait for user interaction
document.getElementById('startBtn').addEventListener('click', async function() {
    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');

    // Get values from inputs
    const frequency = document.getElementById('frequency').value;
    const waveform = document.getElementById('waveform').value;
    const volume = document.getElementById('volume').value / 100;

    // Set oscillator properties
    mainOsc.type = waveform;
    mainOsc.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set volume
    mainGain.gain.setValueAtTime(volume, audioContext.currentTime);

    // Start the oscillator
    mainOsc.start();
    lfo.start();

});

// Stop button handler
document.getElementById('stopBtn').addEventListener('click', function() {
    if (mainOsc) {
        mainOsc.stop();
        mainOsc = null;
        mainGain = null;
    }

    // Hide stop button, show start button
    this.classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
});