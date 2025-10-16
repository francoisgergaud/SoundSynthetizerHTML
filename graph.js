class Graph {
    
    constructor(){
        this.nodes={};
        this.links={};
    }

    addNode(synthNode){
        this.nodes[synthNode.name] = synthNode;
        const sourceSelectElement = document.getElementById("source");
        this.setOptionsForSelect(sourceSelectElement, this.getAllOutputs());
        const destinationSelectElement = document.getElementById("destination");
        this.setOptionsForSelect(destinationSelectElement, this.getAllInputs());
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

    setOptionsForSelect(selectElement, optionsMapping){
        selectElement.innerHTML = "";
        for(const optionId in optionsMapping) {
            const newOption = new Option(optionId, optionId);
            selectElement.add(newOption);
        }
    }

    addLink(sourceId, destinationId){
        const source = this.getAllOutputs()[sourceId];
        const destination = this.getAllInputs()[destinationId];
        source.node.connect(destination, source.index);
        const linkId = sourceId + "@" + destinationId;
        this.links[linkId] = {"source": sourceId, "destination": destination};
        return linkId;
    }
}