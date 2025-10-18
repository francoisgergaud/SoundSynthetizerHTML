class Graph {

    nodes: { string: SynthBaseNode }
    
    constructor(){
        this.nodes = {}
    }

    getAllInputs(){
        const result = {}
        for(const nodeName in this.nodes){
            const nodeInputs = this.nodes[nodeName].getInputs();
            for(const inputName in nodeInputs){
                let key = `${nodeName}/${inputName}`
                result[key] = nodeInputs[inputName];
            }   
        }

        result["speakers"] = audioContext.destination

        return result;
    }

    getAllOutputs(){
        const result = {}
        for(const nodeName in this.nodes){
            const nodeOutputs = this.nodes[nodeName].getOutputs();
            for(const outputName in nodeOutputs){
                let key = `${nodeName}/${outputName}`
                result[key] = nodeOutputs[outputName];
            }   
        }

        return result;
    }

    addLink(sourceId, destinationId){
        const source = this.getAllOutputs()[sourceId];
        const destination = this.getAllInputs()[destinationId];
        source.node.connect(destination, source.index);
        const linkId = sourceId + "&nbsp;-->&nbsp;" + destinationId;
        this.links[linkId] = {"source": sourceId, "destination": destination};
        return linkId;
    }
}