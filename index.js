// Create audio context
const audioContext = new window.AudioContext();
const graph = new Graph();


document.getElementById('addNode').addEventListener('click', function() {
    nodeTypes = {
        "lfo": LFO,
        "vco": VCO,
        "delay": Delay,
        "filter": Filter,
        "music": MusicSequence
    }
    const nodeTypeValue = document.getElementById('nodeType').value;
    nodeName = document.getElementById('nodeName').value;
    node = new nodeTypes[nodeTypeValue](nodeName, audioContext);
    graph.addNode(node);
    node.render(document.getElementById('nodes'));
});

document.getElementById('addLink').addEventListener('click', function() {
    const sourceId = document.getElementById('source').value;
    const destinationId = document.getElementById('destination').value;
    graph.addLink(sourceId, destinationId);
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

