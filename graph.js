class Graph {
    
    constructor(){
        this.nodes={}
    }

    addNode(synthNode){
        this.nodes[synthNode.name] = synthNode;
        const sourceSelectElement = document.getElementById("source");
        this.setOptionsForSelect(sourceSelectElement, this.getAllOutputs());
        const destinationSelectElement = document.getElementById("destination");
        this.setOptionsForSelect(destinationSelectElement, this.getAllInputs());
    }

    getNodes(){
        return this.nodes;
    }

    addLink(source, destination){
        source.node.connect(destination, source.index);
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
    }


    // renderLinks(parentDiv){
    //     parentDiv.innerHTML = "";
    //     parentDiv.appendChild
    //     const source = this.getAllOutputs()[sourceId];
    //     const destination = this.getAllInputs()[destinationId];
    //     source.node.connect(destination, source.index);
    // }

}