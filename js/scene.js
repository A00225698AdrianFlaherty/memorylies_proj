var THREE = require('three');
var initializeDomEvents = require('threex-domevents');
var THREEx = {};
initializeDomEvents(THREE, THREEx);
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import postvertex from './post/vertex.glsl';
import postfragment from './post/fragment.glsl';
import EffectComposer, {RenderPass, ShaderPass,} from '@johh/three-effectcomposer';

//import * as THREEx from 'threex-domevents';

import dat from "dat.gui";





const createInputEvents = require('simple-input-events');
const event = createInputEvents(window);
let OrbitControls = require("three-orbit-controls")(THREE);

const clamp = (min, max) => (value) =>
    value < min ? min : value > max ? max : value;

export default class Sketch
{
    constructor()
    {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
        });

        this.renderer.setClearColor(0x000000, 0.0);
        this.distortValue = 0.2;
        this.veloValue = 0.1;
        this.radiusSize = 0.0;




        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.setPixelRatio(1);
        this.renderer.setSize(this.width, this.height);
        //this.renderer.sortObjects = false;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container = document.getElementById("container");
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(
            100,
            window.innerWidth / window.innerHeight,
            90,
            100000
        );
        this.cameraDistance = 100;
        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        this.time = 0;
        this.speed = 0;
        this.targetSpeed = 0;
        this.mouse = new THREE.Vector2();
        this.followMouse = new THREE.Vector2();
        this.prevMouse = new THREE.Vector2();

        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.paused = false;
        //this.settings();
        this.setupResize();
        this.composerPass();
        this.mouseMove();
        this.addObjects();
        this.resize();
        this.render();

    }

    disposeEverything()
    {
        console.log("everything is disposed");
        this.material.dispose();
        this.scene.background = new THREE.Color(0, 0, 0);
        this.renderer.dispose();
    }

    mouseMove()
    {
        let that = this;
        event.on('move', ({position, event, inside, dragging}) =>
        {
            // mousemove / touchmove
            this.mouse.x = (position[0] / window.innerWidth);
            this.mouse.y = 1. - (position[1] / window.innerHeight);
        });
    }

    addVideos()
    {
        console.log("vidyas");
    }




    setupResize()
    {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize()
    {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.camera.fov =
            2 *
            Math.atan(this.width / this.camera.aspect / (2 * this.cameraDistance)) *
            (180 / Math.PI); // in degrees

        this.customPass.uniforms.resolution.value.y = this.height / this.width;


        this.camera.updateProjectionMatrix();
    }

    addObjects()
    {
        let that = this;
        //this.geometry = new THREE.BoxBufferGeometry(1, 1, 1, 80);
        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 80, 80);

        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.FrontSide,
            uniforms: {
                time: {type: "f", value: 0},
                progress: {type: "f", value: 0},
                angle: {type: "f", value: 2},
                texture1: {type: "t", value: null},
                texture2: {type: "t", value: null},
                resolution: {type: "v4", value: new THREE.Vector4()},
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

    }

    createMesh(o)
    {
        let material = this.material.clone();
        let texture = new THREE.Texture(o.image);
        texture.needsUpdate = true;
        // image cover
        let imageAspect = o.iHeight / o.iWidth;
        let a1;
        let a2;
        if (o.height / o.width > imageAspect)
        {
            a1 = (o.width / o.height) * imageAspect;
            a2 = 1;
        }
        else
        {
            a1 = 1;
            a2 = o.height / o.width / imageAspect;
        }
        texture.minFilter = THREE.LinearFilter;
        material.uniforms.resolution.value.x = o.width;
        material.uniforms.resolution.value.y = o.height;
        material.uniforms.resolution.value.z = a1;
        material.uniforms.resolution.value.w = a2;
        material.uniforms.progress.value = 0;
        material.uniforms.angle.value = 0.3;

        material.uniforms.texture1.value = texture;
        material.uniforms.texture1.value.needsUpdate = true;

        let mesh = new THREE.Mesh(this.geometry, material);

        mesh.scale.set(o.width, o.height, o.width / 2);

        return mesh;
    }

    composerPass()
    {
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        //custom shader pass
        const counter = 0.0;
        const myEffect = {
            uniforms: {
                "tDiffuse": {value: null},
                "distort": {value: 0},
                "resolution": {value: new THREE.Vector2(1., 1600 / 1200)},
                "uMouse": {value: new THREE.Vector2(-100, -100)},
                "uVelo": {value: 0.1},
                "distortSize": {value: 0.1},
                "radiusSize": {value: 0.0},
                "uScale": {value: 0},
                "uType": {value: 0},
                "time": {value: 0}

            },
            vertexShader: postvertex,
            fragmentShader: postfragment
        };

        this.customPass = new ShaderPass(myEffect);
        this.customPass.renderToScreen = true;
        this.composer.addPass(this.customPass);


    }

    stop()
    {
        this.paused = true;
    }

    play()
    {
        this.paused = false;
        this.render();
    }

    getSpeed()
    {
        this.speed = Math.sqrt((this.prevMouse.x - this.mouse.x) ** 2 + (this.prevMouse.y - this.mouse.y) ** 2);

        this.targetSpeed -= 0.5 * (this.targetSpeed - this.speed);
        this.followMouse.x -= 0.5 * (this.followMouse.x - this.mouse.x);
        this.followMouse.y -= 0.5 * (this.followMouse.y - this.mouse.y);
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
    }

    render()
    {
        this.time += 0.05;
        this.getSpeed();
        this.scene.children.forEach(m =>
        {
            if (m.material.uniforms)
            {
                m.material.uniforms.angle.value = 1;
                m.material.uniforms.time.value = this.time;
            }
        });

        this.customPass.uniforms.time.value = this.time;
        this.customPass.uniforms.uMouse.value = this.followMouse;
        this.customPass.uniforms.uVelo.value = this.veloValue;
        this.customPass.uniforms.distortSize.value = this.distortValue;
        this.customPass.uniforms.radiusSize.value = this.radiusSize;

        //this.targetSpeed *= 0.999;

        if (this.composer)
        {
            this.composer.render()
        }
    }
}
