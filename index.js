let oscillator = null;

// Create audio context
const audioContext = new window.AudioContext();

// Create oscillator
oscillator = audioContext.createOscillator();

// Create gain node for volume control
const gainNode = audioContext.createGain();

// Set oscillator properties
oscillator.type = 'sine'; // Can be 'sine', 'square', 'sawtooth', 'triangle'
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note (440 Hz)

// Set volume
gainNode.gain.setValueAtTime(1, audioContext.currentTime); // 30% volume

// Connect nodes: oscillator -> gain -> destination (speakers)
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// Wait for user interaction
document.getElementById('startBtn').addEventListener('click', async function() {

    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');

    // Start the oscillator
    oscillator.start();
});

// Stop button handler
document.getElementById('stopBtn').addEventListener('click', function() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }

    // Hide stop button, show start button
    this.classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
});