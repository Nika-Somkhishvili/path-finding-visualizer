

let  DELAY = 500
let ANIM_INCR =  20 / DELAY
let json
let nodes = []
let path = []
class Node{
    constructor(x,y){
        this.x = x
        this.y = y
        this.linesTo = []
        this.index = nodes.length
        this.visited = false
    }
    show(){
        stroke('#115511');
        strokeWeight(35); 
        point(this.x, this.y)
        stroke('#dcdcdc');
        strokeWeight(29); 
        point(this.x, this.y)
        strokeWeight(1)
        textSize(20);
        let textShiftX
        if(this.index>=10) textShiftX = 12
        else textShiftX = 6
        text(this.index, this.x-textShiftX, this.y+7);
        fill(0, 102, 153);
        if(this.index == json.start){
            strokeWeight(8)
            textSize(15);
            text("Start", this.x-15, this.y-25);
            fill(0, 102, 153);
        }
        if(this.index == json.end){
            strokeWeight(10)
            textSize(15);
            text("End", this.x-13, this.y+35);
            fill(0, 102, 153);
        }
    }
    showAnimation(){
        //show animated lines
        stroke('#ff5100');
        setLineDash([0, 0])
        for(let i=0; i<this.linesTo.length;i++){
            let toX = lerp(this.x, this.linesTo[i].x, this.linesTo[i].z)
            let toY = lerp(this.y, this.linesTo[i].y, this.linesTo[i].z)
            strokeWeight(3);
            line(this.x, this.y, toX, toY)
            strokeWeight(15);
            
            if(this.linesTo[i].z <1){
                point(toX, toY)
                this.linesTo[i].z += ANIM_INCR
                if(this.linesTo[i].z>1) this.linesTo[i].z = 1
            }
        }
    }
    lineTo(toX, toY){
        this.linesTo.push(createVector(toX,toY,0))
    }
}
function updateGraph(){
    try{
        json = JSON.parse(document.getElementById("json-input").value)
        nodes = []
        path = []
        finished = false
        DELAY = json.delay
        maxDepth = json.maxDepth
        ANIM_INCR =  20 / DELAY
        for(let i=0; i<json.nodes.length;i++){
            nodes.push(new Node(+json.nodes[i].x, +json.nodes[i].y))
        }
    }catch(e){
        console.log("Invalid JSON")
    }
}

function setup() {
    updateGraph()
    createCanvas(innerWidth-300, innerHeight);
    // nodes[0].lineTo(nodes[4].x,nodes[4].y)
}
  
function draw() {
    background(220);
    renderRoads()
    for(let i=0; i<nodes.length; i++){
        nodes[i].showAnimation()
    }
    renderPath()
    for(let i=0; i<nodes.length; i++){
        nodes[i].show()
    }

}
let finished = false
function finish(array){
    setTimeout(()=>{finished = true}, DELAY)
    path = array
    console.log("finished")
}
function renderRoads(){
    try{
        setLineDash([10, 10])
        stroke("gray")
        strokeWeight(2)
        for(let i=0; i<json.edges.length;i++){
            ind1 = json.edges[i].from
            ind2 = json.edges[i].to
            line(nodes[ind1].x, nodes[ind1].y, nodes[ind2].x, nodes[ind2].y)
        }
    }catch{
    }
}
function renderPath(){
    if(!finished) return
    strokeWeight(0)
    textSize(20);
    if(!path ){
        text("End node not found :(", 250, 42);
        fill(0, 102, 153);
        return;
    }
    text("Path length: "+(path.length -1) + "   ("+path.toString()+")   "+ visitedNodeCount() +" nodes visited", 250, 42);
    fill(0, 102, 153);
    setLineDash([0, 0])
    stroke("#115511")
    strokeWeight(10)
    for(let i=1; i<path.length;i++){
        line(nodes[path[i-1]].x, nodes[path[i-1]].y, nodes[path[i]].x, nodes[path[i]].y)
    }
}

function visitedNodeCount(){
    let count = 0
    for(let i=0; i<nodes.length;i++){
        if(nodes[i].visited == true){
            count++
        }
    }
    return count
}

function setLineDash(list) {
    drawingContext.setLineDash(list);
  }

document.getElementById("json-input").addEventListener("input", updateGraph);
document.getElementById("dfs-btn").addEventListener("click", runDFS);
document.getElementById("bfs-btn").addEventListener("click", runBFS);

function runBFS(){
    updateGraph()
    if(json.start == json.end) {
        alert("🤨🤨🤨🤨🤨🤨🤨🤨🤨🤨 enter different start and end nodes")
        return
    }
    let current = +json.start
    let visitingQueue = []
    let prev = []
    for(let i=0; i<nodes.length;i++){
        prev[i] = null
    }
    visitingQueue.push(current)
    nodes[current].visited = true
    let stepsForAnim = []
    while(1) {
        current = visitingQueue[0]
        let next = getUnvisitedAdjacentNode(current)
        if(next===false){
            visitingQueue.shift()
            console.log("no neighbours left")
        }else{
            visitingQueue.push(next)
            nodes[next].visited = true
            prev[next] = current
            stepsForAnim.push(createVector(current,next))
            
        }
        console.log("visitingQueue.length:"+visitingQueue.length)
        if(visitingQueue.length==0 || next == json.end){
            console.log("break")
            break
        }
    }
    let j = 0
    console.log(stepsForAnim)
    let id = setInterval( ()=> {
        nodes[stepsForAnim[j].x].lineTo(nodes[stepsForAnim[j].y].x,nodes[stepsForAnim[j].y].y)
        j++
        if(j>=stepsForAnim.length) {
            // reconstruct path
            let ind = json.end
            
            let pathLocal = []
            console.log(prev)
            if(!prev[ind]){ // end isnot found
                finish()
                clearInterval(id)
                return;
            }
            while(ind!=json.start){
                pathLocal.push(ind)
                ind = prev[ind]
            }
            pathLocal.push(json.start)
            finish(pathLocal)
            clearInterval(id)
        }
    }, DELAY);
}

function runDFS(){
    updateGraph()
    let current = +json.start
    let visitingStack = []
    visitingStack.push(current)
    let id = setInterval( ()=> {
        nodes[current].visited = true
        let next = getUnvisitedAdjacentNode(current)
        if(next===false || visitingStack.length-1  >= maxDepth){
            next = visitingStack.pop()
        }else {
            visitingStack.push(current)
            console.log(maxDepth)
        }
        nodes[current].lineTo(nodes[next].x,nodes[next].y)
        if(visitingStack.length==0){
            clearInterval(id)
            finish()
        } 
        if(next == json.end){
            clearInterval(id)
            visitingStack.shift()
            visitingStack.push(json.end)
            finish(visitingStack)
        }
        current = next
    }, DELAY);
}

function getUnvisitedAdjacentNode(nodeIndex){
    for(let i=0; i<json.edges.length;i++){
        if(json.edges[i].from == nodeIndex || json.edges[i].to == nodeIndex){
            let adjacentNodeIndex
            if(json.edges[i].from != nodeIndex) adjacentNodeIndex = json.edges[i].from 
            if(json.edges[i].to != nodeIndex) adjacentNodeIndex = json.edges[i].to 
            if(nodes[adjacentNodeIndex].visited == false){
                return adjacentNodeIndex
            }
        }
    }
    return false
}