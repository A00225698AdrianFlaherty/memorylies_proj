import FontFaceObserver from "fontfaceobserver";
import imagesLoaded from "imagesLoaded";

var THREE = require('three');
import Scene from "./scene";
import anime from 'animejs/lib/anime.es';
import VideosLoaded from './vendor/videosloaded'

let canvas;
let audio = new Audio();
const TWEEN = require("tween");
let ctx;
let radius = document.body.clientWidth <= 425 ? 120 : 160;
let steps = document.body.clientWidth <= 425 ? 60 : 120;
let pointsUp = [];
let pointsDown = [];
let pCircle = 2 * Math.PI * radius;
let angleExtra = 90;
let closeEyes1;
let closeEyes2;
const scene = new Scene();
let currentStep = 0;
// helper functions
const MathUtils = {
    // map number x from range [a, b] to [c, d]
    map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
    // linear interpolation
    lerp: (a, b, n) => (1 - n) * a + n * b
};
let audioIsPlaying = false;
let centerX;
let centerY;
var moving = false;

let introIsOn = true;
let IMAGES;

// calculate the viewport size
let winsize;
const calcWinsize = () => (winsize = {width: window.innerWidth, height: window.innerHeight});
calcWinsize();
// and recalculate on resize
window.addEventListener("resize", calcWinsize);

window.onbeforeunload = function ()
{
    window.scrollTo(0, 0);
};
let dataText = ["Incoming Transmission", "Please ensure your headphones are on securely.", "Click to receive transmission"];

let initStep = 0;
// scroll position and update function
let docScroll;
const getPageYScroll = () => (docScroll = window.pageYOffset || document.documentElement.scrollTop);
let videoIntro = document.getElementById('myVideoIntro');
let video2 = document.getElementById('myVideo2');
let video3 = document.getElementById('myVideo3');
let video4 = document.getElementById('myVideo4');
let video5 = document.getElementById('myVideo5');

let openAudio = document.getElementById("openLoop");
let audio1 = document.getElementById("myAudio1");
let audio2 = document.getElementById("myAudio2");
let running = false;
let thisTweenTimer = 4000;
let titleTimer = 3000;
let fadeTimerTrans = 2500;
let letterTimer = 120;
let sentenceTimer = 2500;
// -------------
// Audio stuff
// -------------
// make a Web Audio Context
const context = new AudioContext();
const splitter = context.createChannelSplitter();

const analyserL = context.createAnalyser();
analyserL.fftSize = 8192;

const analyserR = context.createAnalyser();
analyserR.fftSize = 8192;

splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

// Make a buffer to receive the audio data
const bufferLengthL = analyserL.frequencyBinCount;
const audioDataArrayL = new Uint8Array(bufferLengthL);

const bufferLengthR = analyserR.frequencyBinCount;
const audioDataArrayR = new Uint8Array(bufferLengthR);
let mainAudioPlaying = false;

var rollCredits = false;

// Make a audio node


function loadAudio()
{
    console.log("loaded audio");
    audio.loop = false;
    audio.autoplay = false;
    audio.crossOrigin = "anonymous";
    // call `handleCanplay` when it music can be played
    if (!mainAudioPlaying)
    {

    }
    audio.addEventListener('canplay', handleCanplay);
    audio.load();
    running = true;
}


function handleCanplay()
{
    // connect the audio element to the analyser node and the analyser node
    // to the main Web Audio context

    const source = context.createMediaElementSource(audio);
    source.connect(splitter);
    splitter.connect(context.destination);
}


function toggleAudio()
{
    if (running === false)
    {
        loadAudio();
    }

    if (audio.paused)
    {
        audio.play();
    }
    // else
    // {
    //     audio.pause();
    // }
}


function drawLine(points)
{
    let origin = points[0];

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0.0,255,0.0,1.0)';
    ctx.lineJoin = 'round';
    ctx.moveTo(origin.x, origin.y);
    for (let i = 0; i < points.length; i++)
    {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineTo(origin.x, origin.y);
    ctx.stroke();
}

function connectPoints(pointsA, pointsB)
{
    for (let i = 0; i < pointsA.length; i++)
    {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0.0,255,0.0,1.0)';
        ctx.moveTo(pointsA[i].x, pointsA[i].y);
        ctx.lineTo(pointsB[i].x, pointsB[i].y);
        ctx.stroke();
    }
}

function update(dt)
{
    let audioIndex, audioValue;

    // get the current audio data
    analyserL.getByteFrequencyData(audioDataArrayL);
    analyserR.getByteFrequencyData(audioDataArrayR);

    for (let i = 0; i < pointsUp.length; i++)
    {
        audioIndex = Math.ceil(pointsUp[i].angle * (bufferLengthL / (pCircle * 2))) | 0;
        // get the audio data and make it go from 0 to 1
        audioValue = audioDataArrayL[audioIndex] / 255;

        pointsUp[i].dist = 1.1 + audioValue * 0.8;
        pointsUp[i].x = centerX + radius * Math.cos(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;
        pointsUp[i].y = centerY + radius * Math.sin(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;

        audioIndex = Math.ceil(pointsDown[i].angle * (bufferLengthR / (pCircle * 2))) | 0;
        // get the audio data and make it go from 0 to 1
        audioValue = audioDataArrayR[audioIndex] / 255;

        pointsDown[i].dist = 0.9 + audioValue * 0.2;
        pointsDown[i].x = centerX + radius * Math.cos(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
        pointsDown[i].y = centerY + radius * Math.sin(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
    }
}

function updateVideoTexture(step)
{
    let texture2;
    if (step === 1)
    {
        texture2 = new THREE.VideoTexture(video2);
        texture2.minFilter = THREE.LinearFilter;
        texture2.magFilter = THREE.LinearFilter;
        texture2.format = THREE.RGBFormat;
        texture2.needsUpdate = true;
        scene.scene.background = texture2;
    }
    else if (step === 2)
    {

        texture2 = new THREE.VideoTexture(video3);
        texture2.minFilter = THREE.LinearFilter;
        texture2.magFilter = THREE.LinearFilter;
        texture2.format = THREE.RGBFormat;
        texture2.needsUpdate = true;
        scene.scene.background = texture2;


    }
    else if (step === 3)
    {
        texture2 = new THREE.VideoTexture(video4);
        texture2.minFilter = THREE.LinearFilter;
        texture2.magFilter = THREE.LinearFilter;
        texture2.format = THREE.RGBFormat;
        texture2.needsUpdate = true;
        scene.scene.background = texture2;
    }
    else if (step === 4)
    {
        texture2 = new THREE.VideoTexture(video5);
        texture2.minFilter = THREE.LinearFilter;
        texture2.magFilter = THREE.LinearFilter;
        texture2.format = THREE.RGBFormat;
        texture2.needsUpdate = true;
        scene.scene.background = texture2;
    }


}

function draw(dt)
{
    requestAnimationFrame(draw);

    if (running)
    {
        update(dt);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLine(pointsUp);
    drawLine(pointsDown);
    connectPoints(pointsUp, pointsDown);
}

// Item
class Item
{
    constructor(el)
    {
        this.DOM = {el: el.img};
        this.animated = false;
        this.isBeingAnimatedNow = false;

        this.shouldUnRoll = false;
        let video = document.getElementById('myVideoIntro');

        let texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        texture.needsUpdate = true;
        scene.scene.background = texture;

        this.getSize();
        this.mesh = scene.createMesh({
            width: this.width,
            height: this.height,
            depth: this.depth,
            src: this.src,
            image: this.DOM.el,
            iWidth: this.DOM.el.width,
            iHeight: this.DOM.el.height,
        });
        if (initStep === 5)
        {
            //this.mesh.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0.01);
            this.mesh.position.z = (initStep + 1) * -60;
            this.mesh.position.x -= 650;
            this.mesh.name = "meshLeft";
            scene.domEvents.addEventListener(this.mesh, 'mouseover', function (event)
            {
                console.log("Scale");
                this.mesh.scale.x = 1.2;
                this.mesh.scale.y = 1.2;
            });
            scene.domEvents.addEventListener(this.mesh, 'mouseout', function (event)
            {
                console.log("back to normal");
                this.mesh.scale.x = 1;
                this.mesh.scale.x = 1;
            });

            //scene.domEvents.addEventListener(this.mesh, 'mouseover', )
            //this.mesh.position.y += Math.random() * 200;
        }
        else if (initStep === 6)
        {
            //this.mesh.setRotationFromAxisAngle(new Vector3(0, 1, 0), -0.01);
            this.mesh.position.z = (initStep) * -60;
            this.mesh.position.x += 650;
            this.mesh.name = "meshRight";
            scene.domEvents.addEventListener(this.mesh, 'mouseover', function (event)
            {
                console.log("Scale");
                this.mesh.scale.x = 1.2;
                this.mesh.scale.y = 1.2;
            });
            scene.domEvents.addEventListener(this.mesh, 'mouseout', function (event)
            {
                console.log("back to normal");
                this.mesh.scale.x = 1;
                this.mesh.scale.x = 1;
            });
            //this.mesh.position.y += Math.random() * 200;
        }
        else if (initStep < 5)
        {
            if (initStep % 2 === 0)
            {
                //this.mesh.setRotationFromAxisAngle(new Vector3(1, 1, 1), Math.random() * 0.02);
                this.mesh.position.z = (initStep + 1) * -50;
                this.mesh.position.x -= Math.random() * 200;
                this.mesh.position.y += Math.random() * 50;
            }
            else
            {
                //this.mesh.setRotationFromAxisAngle(new Vector3(1, 1, 1), Math.random() * -0.02);
                this.mesh.position.z = (initStep + 1) * -50;
                this.mesh.position.x += Math.random() * 200;
                this.mesh.position.y -= Math.random() * 50;
            }

        }
        else if (initStep > 6)
        {
            if (initStep % 2 === 0)
            {
                //this.mesh.setRotationFromAxisAngle(new Vector3(1, 1, 1), Math.random() * 0.02);
                this.mesh.position.z = initStep * -50;
                this.mesh.position.x -= Math.random() * 200;
                this.mesh.position.y += Math.random() * 50;
            }
            else
            {
                //this.mesh.setRotationFromAxisAngle(new Vector3(1, 1, 1), Math.random() * -0.02);
                this.mesh.position.z = initStep * -50;
                this.mesh.position.x += Math.random() * 200;
                this.mesh.position.y -= Math.random() * 50;
            }
        }
        initStep++;
        scene.scene.add(this.mesh);
        window.addEventListener("resize", () => this.resize());


    }

    resize()
    {
        this.getSize();
        this.mesh.scale.set(this.width, this.height, 200);

    }

    getSize()
    {
        // get all the sizes here, bounds and all
        const bounds = this.DOM.el.getBoundingClientRect();
        const fromTop = bounds.top;
        const windowHeight = window.innerHeight;
        const withoutHeight = fromTop - windowHeight;
        const withHeight = fromTop + bounds.height;
        this.insideTop = withoutHeight - docScroll;
        this.insideRealTop = fromTop + docScroll;
        this.insideBottom = withHeight - docScroll + 50;
        this.width = bounds.width;
        this.height = bounds.height;
        this.left = bounds.left;
    }


}


// SmoothScroll
class SmoothScroll
{
    constructor()
    {

        this.shouldRender = false;
        this.DOM = {main: document.querySelector("main")};
        // the scrollable element
        // we translate this element when scrolling (y-axis)
        this.DOM.scrollable = this.DOM.main.querySelector("div[data-scroll]");
        // the items on the page
        this.items = [];
        this.createItems();
        //this.createVideos();
        this.listenMouse();
        window.addEventListener("click", () => this.clicked());
        // here we define which property will change as we scroll the page
        // in this case we will be translating on the y-axis
        // we interpolate between the previous and current value to achieve the smooth scrolling effect
        this.renderedStyles = {
            translationY: {
                // interpolated value
                previous: 0,
                // current value
                current: 0,
                // amount to interpolate
                ease: 0.1,
                // current value setter
                // in this case the value of the translation will be the same like the document scroll
                setValue: () => docScroll
            }
        };
        this.style();
        requestAnimationFrame(() => this.render());
    }

    startCameraTransition(distance)
    {

        const coords = {x: scene.camera.position.x, y: scene.camera.position.y, z: scene.camera.position.z};
        let desiredZpos = coords.z - distance;
        const tween = new TWEEN.Tween(coords).to({x: coords.x, y: coords.y, z: desiredZpos}, thisTweenTimer).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(() =>
        {
            scene.camera.position.z = coords.z;
        }).onComplete(() =>
        {

        }).start();
    }

    startCameraTransitionDecision(distance, selection)
    {
        $('buttonl').remove();
        $('buttonr').remove();
        const coords = {x: scene.camera.position.x, y: scene.camera.position.y, z: scene.camera.position.z, w: 0};
        let desiredXMovement = 0;
        if (selection === 1)
        {
            desiredXMovement = -700;
        }
        else if (selection === 2)
        {
            desiredXMovement = 700;
        }
        let desiredZpos = coords.z - distance;
        const tween = new TWEEN.Tween(coords).to({x: desiredXMovement, y: coords.y, z: desiredZpos, w: 1}, thisTweenTimer).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(() =>
        {
            document.getElementById("overlay").style.opacity = coords.w;
            scene.camera.position.z = coords.z;
            scene.camera.position.x = coords.x;
        }).onComplete(() =>
        {
            openAudio.remove();
            $('canvas').remove();
            scene.background = null;
            this.StartTextAnimation(0);
            moving = true;
            scene.disposeEverything();
        }).start();
    }

    fadeOverlay()
    {
        const coords = {x: scene.camera.position.x, y: scene.camera.position.y, z: scene.camera.position.z, w: 0};
        const tween = new TWEEN.Tween(coords).to({x: coords.x, y: coords.y, z: coords.y, w: 0}, 1500).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(() =>
        {
            document.getElementById("overlay").style.opacity = coords.w;
        }).onComplete(() =>
        {
            document.getElementById("overlay").remove();
        }).start();
    }

    typeWriter(text, i, fnCallback)
    {
        var that = this;
        // chekc if text isn't finished yet
        if (i < (text.length))
        {
            // add next character to h1
            document.querySelector("h1").innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true"></span>';
            // wait for a while and call this function again for next character
            setTimeout(function ()
            {
                that.typeWriter(text, i + 1, fnCallback)
            }, letterTimer);
        }
        // text finished, call callback if there is a callback function
        else if (typeof fnCallback == 'function')
        {
            // call callback after timeout
            setTimeout(fnCallback, sentenceTimer);
        }
    }

    StartTextAnimation(i)
    {
        var that = this;
        if (typeof dataText[i] == 'undefined')
        {
            setTimeout(function ()
            {
                currentStep++;
                moving = false;
                if (rollCredits)
                {
                    that.StartTextAnimation(0);
                }
                // TO START AGAIN

            }, 1);
        }
        // check if dataText[i] exists

        if (i < dataText[i].length)
        {
            // text exists! start typewriter animation
            that.typeWriter(dataText[i], 0, function ()
            {
                // after callback (and whole text has been animated), start next text
                that.StartTextAnimation(i + 1);
            });
        }

    }

    attachEvent(elem, event, func)
    {
        if (elem.attachEvent)
        {
            elem.attachEvent("on" + event, func);
        }
        else
        {
            elem.addEventListener(event, func);
        }
    }


    clicked()
    {
        let distance = 50;

        if (!introIsOn && !audioIsPlaying)
        {
            if (currentStep === 5 && !moving)
            {
                toggleAudio();
                canvas = document.createElement("canvas");
                canvas.style.opacity = 1;
                canvas.style.zIndex = 1001;
                document.getElementById("datascroll").remove();
                document.getElementById("container").appendChild(canvas);

                let interval = 360 / steps;
                //canvas.style.opacity = 0;
                ctx = canvas.getContext("2d");
                canvas.width = screen.width;
                canvas.height = screen.height;

                centerX = canvas.width / 2;
                centerY = canvas.height / 2;


// Create points
                for (let angle = 0; angle < 360; angle += interval)
                {
                    let distUp = 1.1;
                    let distDown = 0.9;

                    pointsUp.push({
                        angle: angle + angleExtra,
                        x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
                        y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
                        dist: distUp
                    });

                    pointsDown.push({
                        angle: angle + angleExtra + 5,
                        x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
                        y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
                        dist: distDown
                    });
                }


                dataText = ["Communications channel open", "Signal strength: Strong", "Loading...", "Area Bandwidth: Optimal"];
                this.StartTextAnimation(0);
                audioIsPlaying = true;
                //$("myAudio1").on("ended", );
                let those = this;
                var interval1 = setInterval(function ()
                    {
                        if (localStorage.getItem("selected") === '1')
                        {
                            console.log(audio.currentTime);
                            if (!closeEyes1 && audio.currentTime > 326)//326
                            {
                                closeEyes1 = true;
                                dataText = ["Please close your eyes", "ea6d3435", "c634d86c", "ea6d3435", "c634d86c", "..."];
                                those.StartTextAnimation(0);
                                $('canvas').fadeOut(3000 * Math.random(), function ()
                                {
                                    $('canvas').fadeIn(3000 * Math.random(), function ()
                                    {
                                        $('canvas').fadeOut(3000 * Math.random(), function ()
                                        {
                                            $('canvas').fadeIn(3000 * Math.random(), function ()
                                            {
                                                $('canvas').fadeOut(3000 * Math.random(), function ()
                                                {
                                                    $('h1').fadeOut(3000 * Math.random(), function ()
                                                    {
                                                        $('h1').fadeIn(3000 * Math.random(), function ()
                                                        {
                                                            $('h1').fadeOut(3000 * Math.random(), function ()
                                                            {
                                                                $('h1').fadeIn(3000 * Math.random(), function ()
                                                                {
                                                                    $('h1').fadeOut(3000 * Math.random(), function ()
                                                                    {

                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });

                                //clearInterval(interval1);
                            }
                            if (!rollCredits && audio.currentTime > 1066)//1066
                            {
                                rollCredits = true;
                                dataText = ["Credits:", "Actors-Séamus O Donnell & Órla McGovern", "Photography- Emilia Jefremova www.emjcamera.com", "Sound Design-Niall Clarke", "Web Development/Design- Adrian Flaherty", "Music-Maitiú O Casaide", "Creative Development- Roisín Staic, Darach Mac Con Ionmaire", "Research support- Dr Mary Greene", "Special thanks to Lundahl & Seitl, Alice Keane, Jane Hanberry, Galway 2020 and Galway Theatre Festival team", "Refresh to restart Memory Lies"];
                                those.StartTextAnimation(0);
                                sentenceTimer = 3000;
                                $('h1').fadeIn(1500, function ()
                                {

                                });
                            }
                        }

                        if (localStorage.getItem("selected") === '2')
                        {
                            console.log(audio.currentTime);
                            if (!closeEyes1 && audio.currentTime > 335)//338
                            {
                                closeEyes1 = true;
                                dataText = ["Please close your eyes", "ea6d3435", "c634d86c", "ea6d3435", "c634d86c"];
                                those.StartTextAnimation(0);
                                $('canvas').fadeOut(3000 * Math.random(), function ()
                                {
                                    $('canvas').fadeIn(3000 * Math.random(), function ()
                                    {
                                        $('canvas').fadeOut(3000 * Math.random(), function ()
                                        {
                                            $('canvas').fadeIn(3000 * Math.random(), function ()
                                            {
                                                $('canvas').fadeOut(3000 * Math.random(), function ()
                                                {
                                                    $('h1').fadeOut(3000 * Math.random(), function ()
                                                    {
                                                        $('h1').fadeIn(3000 * Math.random(), function ()
                                                        {
                                                            $('h1').fadeOut(3000 * Math.random(), function ()
                                                            {
                                                                $('h1').fadeIn(3000 * Math.random(), function ()
                                                                {
                                                                    $('h1').fadeOut(3000 * Math.random(), function ()
                                                                    {

                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                            if (!rollCredits && audio.currentTime > 964)//965
                            {
                                rollCredits = true;
                                dataText = ["Credits:", "Actors-Séamus O Donnell & Órla McGovern", "Photography- Emilia Jefremova www.emjcamera.com", "Sound Design-Niall Clarke", "Web Development/Design- Adrian Flaherty", "Music-Maitiú O Casaide", "Creative Development- Roisín Staic, Darach Mac Con Ionmaire", "Research support- Dr Mary Greene", "Special thanks to Lundahl & Seitl, Alice Keane, Jane Hanberry, Galway 2020 and Galway Theatre Festival team", "Refresh to restart Memory Lies"];
                                those.StartTextAnimation(0);
                                sentenceTimer = 3000;
                                clearInterval(interval1);

                                $('h1').fadeIn(1500, function ()
                                {

                                });
                            }
                        }
                    }
                    , 50);
                draw();
                currentStep++;
            }

            if (currentStep === 4 && !moving)
            {
                var that = this;
                moving = true;
                $("#controlsInfo").fadeOut(fadeTimerTrans / 4, function ()
                {
                    $("#info5").fadeOut(fadeTimerTrans / 4, function ()
                    {
                        $("#info4").fadeOut(fadeTimerTrans / 4, function ()
                        {
                            $("#info3").fadeOut(fadeTimerTrans / 4, function ()
                            {
                                $("#info2").fadeOut(fadeTimerTrans / 4, function ()
                                {
                                    $("#info1").fadeOut(fadeTimerTrans / 4, function ()
                                    {
                                        updateVideoTexture(4);
                                        document.getElementById("info1").innerHTML = "How do you hear your inner voice today?";
                                        document.getElementById("info2").innerHTML = "Male voice\t\t\t\t\tFemale voice";
                                        document.getElementById("info3").innerHTML = "Please select an image";
                                        document.getElementById("info4").innerHTML = "";
                                        document.getElementById("info5").innerHTML = "";
                                        $("#info1").fadeIn(fadeTimerTrans, function ()
                                        {
                                            $("#info2").fadeIn(fadeTimerTrans, function ()
                                            {
                                                $("#info3").fadeIn(fadeTimerTrans, function ()
                                                {

                                                    //Add button left
                                                    var buttonl = document.createElement("buttonl");
                                                    var body = document.getElementsByTagName("body")[0];
                                                    body.appendChild(buttonl);
                                                    buttonl.addEventListener("click", function ()
                                                    {
                                                        localStorage.setItem("selected", '1');
                                                        that.selectedOption = 1;
                                                        audio = audio1;
                                                        loadAudio();
                                                        that.startCameraTransitionDecision(80, that.selectedOption);
                                                        that.startTransitionEffect();
                                                        document.getElementById("info1").innerHTML = "";
                                                        document.getElementById("info2").innerHTML = "";
                                                        document.getElementById("info3").innerHTML = "";
                                                        document.getElementById("info4").innerHTML = "";
                                                        document.getElementById("info5").innerHTML = "";

                                                    });

                                                    //Add button right
                                                    var buttonr = document.createElement("buttonr");
                                                    body = document.getElementsByTagName("body")[0];
                                                    body.appendChild(buttonr);
                                                    buttonr.addEventListener("click", function ()
                                                    {
                                                        that.selectedOption = 2;
                                                        localStorage.setItem("selected", '2');
                                                        audio = audio1;
                                                        loadAudio();
                                                        document.getElementById("info1").innerHTML = "";
                                                        document.getElementById("info2").innerHTML = "";
                                                        document.getElementById("info3").innerHTML = "";
                                                        document.getElementById("info4").innerHTML = "";
                                                        document.getElementById("info5").innerHTML = "";
                                                        that.startCameraTransitionDecision(80, that.selectedOption);
                                                        that.startTransitionEffect();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                this.startCameraTransition(distance);
                this.startTransitionEffect();
            }
            if (currentStep === 3 && !moving)
            {
                moving = true;
                $("#controlsInfo").fadeOut(fadeTimerTrans / 4, function ()
                {
                    $("#info5").fadeOut(fadeTimerTrans / 4, function ()
                    {
                        $("#info4").fadeOut(fadeTimerTrans / 4, function ()
                        {
                            $("#info3").fadeOut(fadeTimerTrans / 4, function ()
                            {
                                $("#info2").fadeOut(fadeTimerTrans / 4, function ()
                                {
                                    $("#info1").fadeOut(fadeTimerTrans / 4, function ()
                                    {
                                        updateVideoTexture(3);
                                        var text1, text2, text3, text4, text5;
                                        text1 = "Compliance is a non-negotiable fact";
                                        text2 = "Stability.";
                                        text3 = "Together.";
                                        text4 = "Control.";
                                        text5 = "Apart.";
                                        document.getElementById("info1").innerHTML = text1.italics();
                                        document.getElementById("info2").innerHTML = text2.italics();
                                        document.getElementById("info3").innerHTML = text3.italics();
                                        document.getElementById("info4").innerHTML = text4.italics();
                                        document.getElementById("info5").innerHTML = text5.italics();
                                        $("#info1").fadeIn(fadeTimerTrans, function ()
                                        {
                                            $("#info2").fadeIn(fadeTimerTrans, function ()
                                            {
                                                $("#info3").fadeIn(fadeTimerTrans, function ()
                                                {
                                                    $("#info4").fadeIn(fadeTimerTrans, function ()
                                                    {
                                                        $("#info5").fadeIn(fadeTimerTrans, function ()
                                                        {
                                                            $("#controlsInfo").fadeIn(fadeTimerTrans / 3, function ()
                                                            {
                                                                moving = false;
                                                                currentStep++
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });

                            });
                        });
                    });
                });
                scene.distortValue = 0.1;
                this.startCameraTransition(distance);
                this.startTransitionEffect();

            }
            if (currentStep === 2 && !moving)
            {
                moving = true;
                $("#controlsInfo").fadeOut(fadeTimerTrans / 4, function ()
                {
                    $("#info4").fadeOut(fadeTimerTrans / 4, function ()
                    {
                        $("#info3").fadeOut(fadeTimerTrans / 4, function ()
                        {
                            $("#info2").fadeOut(fadeTimerTrans / 4, function ()
                            {
                                $("#info1").fadeOut(fadeTimerTrans / 4, function ()
                                {
                                    updateVideoTexture(2);
                                    document.getElementById("info1").innerHTML = "Do these images resonate with you somehow?";
                                    document.getElementById("info2").innerHTML = "Please ensure your headphones are on securely.";
                                    document.getElementById("info3").innerHTML = "Are you in a quiet space?";
                                    document.getElementById("info4").innerHTML = "That's good.";
                                    document.getElementById("info5").innerHTML = "Very good.";
                                    $("#info1").fadeIn(fadeTimerTrans, function ()
                                    {
                                        $("#info2").fadeIn(fadeTimerTrans, function ()
                                        {
                                            $("#info3").fadeIn(fadeTimerTrans, function ()
                                            {
                                                $("#info4").fadeIn(fadeTimerTrans, function ()
                                                {
                                                    $("#info5").fadeIn(fadeTimerTrans, function ()
                                                    {

                                                        $("#controlsInfo").fadeIn(fadeTimerTrans / 3, function ()
                                                        {
                                                            moving = false;
                                                            currentStep++
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });

                            });
                        });
                    });
                });
                this.startCameraTransition(distance);
                this.startTransitionEffect();
            }
            if (currentStep === 1 && !moving)
            {
                moving = true;
                $("#controlsInfo").fadeOut(fadeTimerTrans / 4, function ()
                {

                    $("#info4").fadeOut(fadeTimerTrans / 4, function ()
                    {
                        $("#info3").fadeOut(fadeTimerTrans / 4, function ()
                        {
                            $("#info2").fadeOut(fadeTimerTrans / 4, function ()
                            {
                                $("#info1").fadeOut(fadeTimerTrans / 4, function ()
                                {
                                    $("#header_title").fadeOut(fadeTimerTrans / 4, function ()
                                    {
                                        updateVideoTexture(2);
                                        var text = "Finefagael";
                                        document.getElementById("info1").innerHTML = "The country has been in a state of emergency since the year 2020.";
                                        document.getElementById("info2").innerHTML = "A prolonged period of intensive social-distancing has been in place for the last 40 years.";
                                        document.getElementById("info3").innerHTML = "There is no opposition.";
                                        document.getElementById("info4").innerHTML = "There is no dissent.";
                                        document.getElementById("info5").innerHTML = "";
                                        $("#info1").fadeIn(fadeTimerTrans, function ()
                                        {
                                            $("#info2").fadeIn(fadeTimerTrans, function ()
                                            {
                                                $("#info3").fadeIn(fadeTimerTrans, function ()
                                                {
                                                    $("#info4").fadeIn(fadeTimerTrans, function ()
                                                    {

                                                        $("#controlsInfo").fadeIn(fadeTimerTrans / 3, function ()
                                                        {
                                                            moving = false;
                                                            currentStep++
                                                        });

                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });

                });

                this.startCameraTransition(distance);
                this.startTransitionEffect();
            }
            if (currentStep === 0 && !moving)
            {
                moving = true;
                $("#controlsInfo").fadeOut(fadeTimerTrans / 4, function ()
                {
                    $("#info5").fadeOut(fadeTimerTrans / 4, function ()
                    {
                        $("#info4").fadeOut(fadeTimerTrans / 4, function ()
                        {
                            $("#info3").fadeOut(fadeTimerTrans / 4, function ()
                            {
                                $("#info2").fadeOut(fadeTimerTrans / 4, function ()
                                {
                                    $("#info1").fadeOut(fadeTimerTrans / 4, function ()
                                    {
                                        $("#header_title").fadeOut(fadeTimerTrans / 4, function ()
                                        {
                                            document.getElementById("info1").innerHTML = "Don't let anything distract you now.";
                                            document.getElementById("info2").innerHTML = "Enjoy these images you see before you. They are like memories, not entirely clear. Enjoy the silence they conjure up in your mind.";
                                            document.getElementById("info3").innerHTML = "Remember, there should be no distractions in this moment.";
                                            document.getElementById("info4").innerHTML = "Compliance is a non-negotiable fact... in the year 2060.";
                                            document.getElementById("controlsInfo").innerHTML = "Click to Continue";
                                            document.getElementById("info5").innerHTML = "";
                                            $("#info1").fadeIn(fadeTimerTrans, function ()
                                            {
                                                $("#info2").fadeIn(fadeTimerTrans, function ()
                                                {
                                                    $("#info3").fadeIn(fadeTimerTrans, function ()
                                                    {
                                                        $("#info4").fadeIn(fadeTimerTrans, function ()
                                                        {
                                                            $("#controlsInfo").fadeIn(fadeTimerTrans / 3, function ()
                                                            {
                                                                moving = false;
                                                                currentStep++
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                this.startCameraTransition(distance + 50);
                this.startTransitionEffect();
            }
        }


    }


    startTransitionEffect()
    {

        let effectValue = {x: 10000};
        let halfwayValue = effectValue.x / 2;
        let tweenEffect = new TWEEN.Tween(effectValue).to({x: 0}, thisTweenTimer).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(() =>
        {
            this.createTransitionEffect(halfwayValue, effectValue.x);
        }).onComplete(() =>
        {
        }).start();
    }

    createTransitionEffect(halfwayPoint, currValue)
    {
        if (currValue > halfwayPoint)
        {
            scene.distortValue += 0.02;
        }
        else
        {
            scene.distortValue -= 0.02;
        }
    }


    listenMouse()
    {
        document.addEventListener('mousemove', () =>
        {
            this.shouldRender = true;
        })
    }

    setPosition()
    {
        // translates the scrollable element
        if (Math.round(this.renderedStyles.translationY.previous) !== Math.round(this.renderedStyles.translationY.current) || this.renderedStyles.translationY.previous < 10)
        {
            this.shouldRender = true;
            this.DOM.scrollable.style.transform = `translate3d(0,${-1 * this.renderedStyles.translationY.previous}px,0)`;
            for (const item of this.items)
            {
                // if the item is inside the viewport call it's render function
                // this will update the item's inner image translation, based on the document scroll value and the item's position on the viewport
                if (item.isVisible || item.isBeingAnimatedNow)
                {
                    item.render(this.renderedStyles.translationY.previous);
                }
            }
        }
        if (scene.targetSpeed > 0.01)
        {
            this.shouldRender = true;
        }
        if (this.shouldRender)
        {
            this.shouldRender = false;
            scene.render();
        }
    }

    createItems()
    {
        IMAGES.forEach(image =>
        {
            if (image.img.classList.contains("js-image"))
            {
                this.items.push(new Item(image, this));
            }
        });
    }

// createVideos()
// {
//     VIDEOS.forEach(video =>
//     {
//         if (video.video.classList.contains("myVideo"))
//         {
//             this.videos.push(new MyVideo(video, this));
//         }
//     });
// }

    style()
    {
        // the <main> needs to "stick" to the screen and not scroll
        // for that we set it to position fixed and overflow hidden
        this.DOM.main.style.position = "fixed";
        this.DOM.main.style.width = this.DOM.main.style.height = "100%";
        this.DOM.main.style.top = this.DOM.main.style.left = 0;
        this.DOM.main.style.overflow = "hidden";
    }

    render()
    {
        // update the current and interpolated values
        for (const key in this.renderedStyles)
        {
            this.renderedStyles[key].current = this.renderedStyles[key].setValue();
            this.renderedStyles[key].previous = MathUtils.lerp(
                this.renderedStyles[key].previous,
                this.renderedStyles[key].current,
                this.renderedStyles[key].ease
            );
        }
        // and translate the scrollable element
        this.setPosition();
        TWEEN.update();
        update();
        // loop..
        requestAnimationFrame(() => this.render());
    }
}

/***********************************/
/********** Preload stuff **********/

const fontParalucent = new FontFaceObserver("laca-text").load();
const fontStarling = new FontFaceObserver("operetta-12").load();

// Preload images
const preloadImages = new Promise((resolve, reject) =>
{
    imagesLoaded(document.querySelectorAll("img"), {background: true}, resolve);
});


preloadImages.then(images =>
{
    IMAGES = images.images;
});

const preloadEverything = [fontStarling, fontParalucent, preloadImages, videoIntro, video2, video3, video4, video5, audio1, audio2, openAudio];

// And then..
Promise.all(preloadEverything).then(() =>
{    // Remove the loader


    document.body.classList.remove("loading");
    document.body.classList.add("loaded");
    openAudio.loop = true;
    openAudio.autoplay = true;
    openAudio.crossOrigin = "anonymous";
// call `handleCanplay` when it music can be played
    openAudio.load();
    // Get the scroll position
    getPageYScroll();
    // Initialize the Smooth Scrolling
    new SmoothScroll();

    $(".header__title").fadeIn(titleTimer * 2, function ()
    {
        $("#info1").fadeIn(titleTimer, function ()
        {
            $("#info2").fadeIn(titleTimer, function ()
            {
                $("#info3").fadeIn(titleTimer, function ()
                {
                    $("#info4").fadeIn(titleTimer, function ()
                    {
                        $("#controlsInfo").fadeIn(titleTimer / 3, function ()
                        {

                            introIsOn = false;

                        });
                    });
                });
            });
        });
    });
}).catch(console.log);
