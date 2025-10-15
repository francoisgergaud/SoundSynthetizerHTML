// Create audio context
const audioContext = new window.AudioContext();
const graph = new Graph();
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
    // Create LFO
    const lfo = new LFO("lfo", audioContext);
    graph.addNode(lfo);
    lfo.setGain(1200);
    const vco = new VCO("vco", audioContext);
    graph.addNode(vco);
    graph.addLink(lfo.getOutputs().output, vco.getInputs().detune)
    
});

// Stop button handler
document.getElementById('stopBtn').addEventListener('click', function() {
    vco.stop();
    lfo.stop();

    // Hide stop button, show start button
    this.classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
});

