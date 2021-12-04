
// to view things we need a scene
const scene = new THREE.Scene(); 

// to see a scene, we need camera. So there are basically many cameras to viwq a scene
// Perspective Camera is basic one. 

/*
About Perspective Camera

This projection mode is designed to mimic the way the human eye sees.
It is the most common projection mode used for rendering a 3D scene.

PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
fov — Camera frustum vertical field of view.
aspect — Camera frustum aspect ratio.
near — Camera frustum near plane.
far — Camera frustum far plane.

Note that after making changes to most of these properties ,
you will have to call .updateProjectionMatrix for the changes to take effect.
*/

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

/* 
renderer is used to render all the graphics onto canvas. 
I pass size of renderer through setSize(), in which I basically here pass the entire screen. 
i.e, we need to render it over the entire screen*/
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.domElement gives us the canvas, which we append to body of our index.html page
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xc2b9b0,1)

/* 
Now we need to add shape into the scene and check if its working.

Intially I use box geometry to test and later , this box will be replaced with the DOLL
simply copy paste from documentation on cube geomatry*/

/* WE replace this basic box geometry with our DOLL

Creating a geometry obj to have cube shpe structure. This is an object that contains all the points (vertices) and fill (faces) of the cube 
We need material to color the obj. Hence we go for MeshBasicmaterial.*/

// 1. const geometry = new THREE.BoxGeometry();
// 2. const material = new THREE.MeshBasicMaterial( { color: 0xfffffff } )

//The third thing we need is a Mesh. 
//A mesh is an object that takes a geometry, and applies a material to it, which we then can insert to our scene, and move freely around.

// 3. const cube = new THREE.Mesh( geometry, material );

// once mesh is created, we need to add to the scene

// 4. scene.add( cube );

createCube = (size,position,rotationY=0,color) =>
{
    const geometry = new THREE.BoxGeometry(size.x,size.y,size.z);
    const material = new THREE.MeshBasicMaterial( { color: color } )
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = position;
    cube.rotation.y=rotationY;
    scene.add( cube );
    return cube;
}

// initial camera step up is (0,0,0)
camera.position.z = 6;
// integrate audio of doll
function dollAudio()
{
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'audio.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
    delay(1000)
	sound.setVolume( 0.5 );
	sound.play();
    

});
//dollAudio();
}
//we need to add light to scene to view. using Ambient Light :)

const light = new THREE.AmbientLight( 0xffffff); // soft white light
scene.add( light );

//global positioning of start and end variables
const start_position=5;
const end_position = -5;
const text = document.querySelector(".text"); // for loading text to show
let TIME = 13 // time limit set to reduce the time and if user not crossing track, then fail

//we downloaded DOLL from sketchfab in Gltf format. Now we need to load this GLTF format.
const loader = new THREE.GLTFLoader();
// inducing delay as Promise so that doll waits for some time b4 turning back / front

 function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve,ms));
}

// Class Doll is created 
class SquidDoll
{
    constructor(){
        // Load a glTF resource
        loader.load(
            // resource URL
            '../SquidGame/models/scene.gltf',
            // called when the resource is loaded
            ( gltf ) => {
        
                scene.add( gltf.scene );
        
                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene.scale.set(0.4,0.4,.4); // THREE.Group
                gltf.scene.position.set(0,-1,0);
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object
                this.doll = gltf.scene; 
        
            },
            // called while loading is progressing
            function ( xhr ) {
        
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        
            },
            // called when loading has errors
            function ( error ) {
        
                console.log( 'An error happened' );
        
            }
        );
        }
        turnBackwards()
        {
            //this.doll.rotation.y= -3.2;
            // just with this cmd, doll rotates very fast. So inducing animation using gsap libraries of 3js
            gsap.to(this.doll.rotation,{y:-3.2 ,duration: 0.3})
            setTimeout(()=> isLookingBack=true,150);
        }
        

        turnFront()
        {
            //this.doll.rotation.y=0;
            gsap.to(this.doll.rotation,{y:0 ,duration: 0.35})
            setTimeout(()=> isLookingBack=false,450);
        }

        async start()
        {
            
            this.turnBackwards();
            await delay(Math.random()*1000 + 1000)
             this.turnFront();
             await delay(Math.random()*800+ 800);
             this.start();
             //dollAudio()

        }
    
}

let gameStatus = 'loading'
let doll = new SquidDoll()
userTrack(); // creating track for player to move


// build GAME logic
async function init()
{
    await delay(1000);
    text.innerText ="Starting in 3";
    await delay(1000);
    text.innerText ="Starting in 2";
    await delay(1000);
    text.innerText ="Starting in 1";
    await delay(1000);
    text.innerText ="Lets PLAY";
    //dollAudio()
    
    //putting progrss bar 
    let progressBar = createCube({x:5,y:.1,z:1},0,0,0xe5a716)
    progressBar.position.y=4.3
   // progressBar.rotation.z =3
   gsap.to(progressBar.scale,{x:0,duration: TIME})

    setTimeout(()=>
{
    gameStatus = 'started'
    doll.start()
   // delay(1000)
    dollAudio()
},10);

setTimeout(()=>{
    if(gameStatus!="over"){
        text.innerText="OOPS !! Time OUT"
        gameStatus="over";}
},TIME*1000);
}

init();


let isLookingBack= true;

//create Player class
class Player
{
    constructor()
    {
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z=1;
        sphere.position.x =start_position;
        scene.add( sphere );
        this.player=sphere;
        // creating player ref info like his speed and position
        this.playerInformation={
            positionX: start_position,
            speed :0
        }
    }

    check()
    {
        if(this.playerInformation.speed >0 && !isLookingBack){
            text.innerText="OOPS!! You Lost"
            //text.color= 'red';
            //alert('Lost')
            gameStatus="over";
        }

         if(this.playerInformation.positionX < end_position+0.4){
            //alert("WIN")
            text.innerText="YEYY! You WON"
            gameStatus="over";
         }   
    }

    update()
{
    this.check();
    this.playerInformation.positionX = this.playerInformation.positionX - this.playerInformation.speed;
    this.player.position.x= this.playerInformation.positionX;
}

run()
{
    this.playerInformation.speed=.04;
}

stop()
{
    //this.playerInformation.speed=0;   
    gsap.to(this.playerInformation,{speed:0 ,duration: .2})
}
}

let player = new Player();

//when player speed is more than 1, he starts to move.



// animate func is called again and again
function animate() {
    if(gameStatus==="over"){audioLoader.stop();
         return; }
	requestAnimationFrame( animate );

    // cube.rotation.x +=0.012;
    // cube.rotation.y +=0.03;
    // cube.rotation.z +=.002
	renderer.render( scene, camera );
    player.update();
   // dollAudio()
}
animate();

// to enable auto resize

window.addEventListener('resize',onWindowResize,false);

function onWindowResize (){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,window.innerHeight);
}

// now we need to create user track to run 
function userTrack()
{
    // we need to merge cube like structures for design of userTrack. We have tested boxGeomtry right at beginning
    //so making use of that  
    createCube({x: 2* start_position + 0.3,y:2.5,z: 1},0,0,0xe5a716).position.z= -1;
    createCube({x: 0.2,y:2.5,z: 1},start_position,-.4,0xac3b61); 
    createCube({x: 0.2,y:2.5,z: 1},end_position,.4,0xac3b61)
      
    // createCube();
    //
    // createCube();
}

window.addEventListener('keydown',(e) =>
{   
    if(gameStatus != 'loading')
    if(e.key=="ArrowUp")
    player.run();

    // if(e.key=="ArrowDown")
    // player.stop();

});

// window.addEventListener('click',(e) =>
// {   alert(e.message)
//     player.run();

//     // if(e.key=="ArrowDown")
//     // player.stop();

// });


window.addEventListener('keyup',(e) =>
{   
    if(e.key=="ArrowUp")
    player.stop();

    // if(e.key=="ArrowDown")
    // player.stop();

})
