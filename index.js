let oscillator = null;
let gainNode = null;

// Update displayed values
document.getElementById('frequency').addEventListener('input', function() {
    document.getElementById('freqValue').textContent = this.value;
    if (oscillator) {
        oscillator.frequency.setValueAtTime(this.value, oscillator.context.currentTime);
    }
});

document.getElementById('volume').addEventListener('input', function() {
    document.getElementById('volumeValue').textContent = this.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(this.value / 100, gainNode.context.currentTime);
    }
});

document.getElementById('waveform').addEventListener('change', function() {
    if (oscillator) {
        oscillator.type = this.value;
    }
});

// Wait for user interaction
document.getElementById('startBtn').addEventListener('click', async function() {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Resume audio context (required for some browsers)
    await audioContext.resume();

    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');

    // Create oscillator
    oscillator = audioContext.createOscillator();

    // Create gain node for volume control
    gainNode = audioContext.createGain();

    // Get values from inputs
    const frequency = document.getElementById('frequency').value;
    const waveform = document.getElementById('waveform').value;
    const volume = document.getElementById('volume').value / 100;

    // Set oscillator properties
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Set volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    // Connect nodes: oscillator -> gain -> destination (speakers)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();
});

// Stop button handler
document.getElementById('stopBtn').addEventListener('click', function() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
        gainNode = null;
    }

    // Hide stop button, show start button
    this.classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
});