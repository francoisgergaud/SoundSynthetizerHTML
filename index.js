// Create audio context
const audioContext = new window.AudioContext();
const graph = new Graph();


document.getElementById('addNode').addEventListener('click', function() {
    const nodeTypes = {
        "lfo": LFO,
        "vco": VCO,
        "delay": Delay,
        "filter": Filter,
        "music": MusicSequence
    }
    const nodeTypeValue = document.getElementById('nodeType').value;
    let nodeName = document.getElementById('nodeName').value;
    if (nodeName === "") {
        return;
    }
    const node = new nodeTypes[nodeTypeValue](nodeName, audioContext);
    graph.addNode(node);
    node.render(document.getElementById('nodes'));
});

document.getElementById('addLink').addEventListener('click', function() {
    const sourceId = document.getElementById('source').value;
    const destinationId = document.getElementById('destination').value;
    const linkId = graph.addLink(sourceId, destinationId);
    const childDiv = document.createElement("div");
    childDiv.innerHTML = `
        ${linkId}
    `
    document.getElementById('links').appendChild(childDiv)
});

document.getElementById('muteAllBtn').addEventListener('click', async function() {
    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('unmuteAllBtn').classList.remove('hidden');
    for(const node in graph.nodes){
        node.mute();
    }
});

document.getElementById('muteAllBtn').addEventListener('click', async function() {
    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('unmuteAllBtn').classList.remove('hidden');
    for(const nodeName in graph.nodes){
        graph.nodes[nodeName].mute();
    }
});

document.getElementById('unmuteAllBtn').addEventListener('click', async function() {
    // Hide start button, show stop button
    this.classList.add('hidden');
    document.getElementById('muteAllBtn').classList.remove('hidden');
    for(const nodeName in graph.nodes){
        graph.nodes[nodeName].unmute();
    }
});
