import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import './style.css'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TextureLoader } from 'three'

const sizes = {
    width:window.innerWidth, 
    height:window.innerHeight
}
let mixer = null
// Models
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/Fox/glTF/Fox.gltf',
(gltf)=>{
    console.log('success');
    console.log(gltf);
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(gltf.animations[2])
    action.play()
    gltf.scene.scale.set(0.025,0.025,0.025)
    // const children = [...gltf.scene.children]
    // for (const child of children)
    // {scene.add(child)}
    scene.add(gltf.scene)
}
)
// Env Loader

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg',
])

const gui = new dat.GUI({closed:true, width:400})
gui.hide()
const parameters ={
    color:0xfff000,
    spin:()=>{
        gsap.to(mesh.rotation,{duration:1,y:mesh.rotation.y+Math.PI*2})
    }
}

// Get Canvas DOM
const canvas = document.querySelector('.webgl-canvas')

// Scene
const scene = new THREE.Scene()



const mat = new THREE.MeshStandardMaterial()
mat.metalness = 0.45
mat.roughness = 0.45
mat.envMap=environmentMapTexture

const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5,5),mat)
plane.rotation.x = - Math.PI / 2
scene.add(plane);


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff,0.5)
const pointLight = new THREE.PointLight(0xffffff,0.5)
pointLight.x = 2
pointLight.y = 3
pointLight.z = 4
scene.add(ambientLight, pointLight)

// Camera
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height)
camera.position.z=3
camera.position.y=3
camera.lookAt(plane.position)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true


// Axis helper
const axesHelper =  new THREE.AxesHelper(5);
axesHelper.visible = false
scene.add(axesHelper)

window.addEventListener('resize',()=>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

// full screen
window.addEventListener('dblclick',()=>{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if(!fullscreenElement){
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else{
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(canvas.webkitExitFullscreen)
        {
            canvas.webkitExitFullscreen()
        }
    }

})

// gui tweeks
// gui.add(sphere.position, 'x' ) // brings text
// gui.add(sphere.position, 'y' ,-3,3,0.01) // brings range
// gui.add(sphere.position, 'z').min(-3).max(3).step(0.01).name('zoom')  // brings range with name
// gui.add(sphere,'visible').name("Mesh Visible") // boolean/checkbox
gui.add(axesHelper,'visible').name("Axes Helper Visible") // boolean/checkbox
// gui.addColor(parameters,'color').onChange(()=>{mat.color.set(parameters.color)}) // colour
// gui.add(parameters,'spin')
gui.add(mat ,'metalness').min(0).max(1).step(0.01).name('metalness')
gui.add(mat ,'roughness').min(0).max(1).step(0.01).name('roughness')
// gui.add(mat ,'aoMapIntensity').min(0).max(5).step(0.01).name('aoMapIntensity')
// gui.add(mat ,'displacementScale').min(0).max(5).step(0.01).name('displacementScale')

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
})
// resize renderer
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

const clock = new THREE.Clock()
let prevTime = 0
const tick = ()=>{
    const elaspedTime = clock.getElapsedTime()
    const deltaTime = elaspedTime-prevTime
    prevTime= elaspedTime

    if (mixer!==null)
    {
        mixer.update(deltaTime)
    }
    controls.update()
    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)
    
}
tick()