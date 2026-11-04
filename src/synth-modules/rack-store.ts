import { reactive } from 'vue'
import { SynthBaseNode } from './synthNodes'
import type { Track } from '@/sequencer/sequencer'
import type { Graph } from '@/graph'

interface RackModule {
    node: SynthBaseNode
    type: string
}

interface RackStore {
    racks: RackModule[][]
}


export const rackStore: RackStore = reactive({
    racks: [] as RackModule[][],
})

export const addSynthModuleOnRack = function(node: SynthBaseNode, nodeType: string, rackIndex: number) {
    if (rackStore.racks.length > rackIndex && Array.isArray(rackStore.racks[rackIndex])) {
        rackStore.racks[rackIndex].push(
            {
                node: node,
                type: nodeType
            }
        )
    }
}

export const addRack = function() {
    rackStore.racks.push([])
}

export const moveSynthModuleOnRack = function(originRackIndex: number, originPositionInRack: number, destinationRackIndex: number, destinationPositionInRack: number){
    console.debug("dropRackNode", destinationRackIndex, destinationPositionInRack)
    const elementToMove = rackStore.racks[originRackIndex]![originPositionInRack]!
    rackStore.racks[originRackIndex]!.splice(originPositionInRack, 1)
    if (destinationPositionInRack === -1) {
        rackStore.racks[destinationRackIndex]!.push(elementToMove)
    } else {
        rackStore.racks[destinationRackIndex]!.splice(destinationPositionInRack, 0, elementToMove)
    }
}

export const exportRackStore =     function(): string[][] {
    const result: string[][] = []
    for(const rack of rackStore.racks) {
        const racksExport: string[] = []
        for(const synthElement of rack) {
            const node = synthElement.node
            racksExport.push(node.name)
        }
        result.push(racksExport)
    }
    return result
}


export const importRackStore = function(racksData: string[][], graph: Graph): void {
    rackStore.racks = []
    const graphSynthModules = graph.nodes
    for(const rackData of racksData) {
        const rack: RackModule[] = []
        for(const synthName of rackData) {
            const synthNode = graphSynthModules![synthName]
            if (synthNode) {
                rack.push(synthNode)
            }
        }
        rackStore.racks.push(rack)
    }
}