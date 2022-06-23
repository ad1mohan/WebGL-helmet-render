import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import './style.css'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { sRGBEncoding, TextureLoader } from 'three'

// Screen Config
const sizes = {
    width:window.innerWidth, 
    height:window.innerHeight
}
window.addEventListener('resize',()=>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})
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

// Loaders
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    './models/FlightHelmet/glTF/FlightHelmet.gltf',
    (model)=>{
        model.scene.scale.set(10,10,10)
        model.scene.position.set(0,-4,0)
        model.scene.rotation.y = -Math.PI*0.25
        scene.add(model.scene)

        

        gui.add(model.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('Rotate Helmet')
        updateAllMaterials()
    }
)

const updateAllMaterials = () =>{
    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
            console.log(child);
            child.material.envMap = environmentMapTexture
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

// Env Loader
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
    './textures/environmentMaps/1/px.jpg',
    './textures/environmentMaps/1/nx.jpg',
    './textures/environmentMaps/1/py.jpg',
    './textures/environmentMaps/1/ny.jpg',
    './textures/environmentMaps/1/pz.jpg',
    './textures/environmentMaps/1/nz.jpg',
])
environmentMapTexture.encoding = sRGBEncoding

// Gui
const gui = new dat.GUI({closed:true, width:400})
gui.hide()
const debugObject ={}

// Canvas
const canvas = document.querySelector('.webgl-canvas')

// Scene
const scene = new THREE.Scene()

// Sphere
// const material = new THREE.MeshStandardMaterial()
// const testSphere = new THREE.Mesh(
//     new THREE.SphereBufferGeometry(1,32,32),
//     material
// )

// Camera
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height)
camera.position.z=5
// camera.lookAt(testSphere.position)

// Axis helper
const axesHelper =  new THREE.AxesHelper(5);
axesHelper.visible = false


// Controls
const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true


// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff,1)
directionalLight.position.set(0.25,3,-2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(camera, axesHelper, directionalLight, directionalLightCameraHelper)
scene.background = environmentMapTexture
debugObject.envMapIntensity = 5

// gui tweeks
gui.add(axesHelper,'visible').name("Axes Helper Visible") // boolean/checkbox
gui.add(directionalLightCameraHelper,'visible').name("directionalLight Camera Helper") // boolean/checkbox
// gui.add(material ,'metalness').min(0).max(1).step(0.01).name('metalness')
// gui.add(material ,'roughness').min(0).max(1).step(0.01).name('roughness')
gui.add(directionalLight ,'intensity').min(0).max(10).step(0.001).name('Light Intensity')
gui.add(directionalLight.position ,'x').min(-5).max(5).step(0.001).name('Light X')
gui.add(directionalLight.position ,'y').min(-5).max(5).step(0.001).name('Light Y')
gui.add(directionalLight.position ,'z').min(-5).max(5).step(0.001).name('Light Z') 
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).name('envMapIntensity').onChange(updateAllMaterials)


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
})
// resize renderer
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui.add(renderer,'toneMapping',{
    No:THREE.NoToneMapping,
    Linear:THREE.LinearToneMapping,
    Reinhard:THREE.ReinhardToneMapping, 
    Cineon: THREE.CineonToneMapping,
    ACESFilmic:THREE.ACESFilmicToneMapping
}).onFinishChange(()=>{
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})
gui.add(renderer,'toneMappingExposure').min(0).max(10).step(0.001).name('toneMappingExposure')
const clock = new THREE.Clock()
let prevTime = 0
const tick = ()=>{
    const elaspedTime = clock.getElapsedTime()
    const deltaTime = elaspedTime-prevTime
    prevTime = elaspedTime

    controls.update()
    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)
    
}
tick()


