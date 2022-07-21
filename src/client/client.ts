
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { CustomMesh } from "./CustomMesh";
import { MeshModel } from "./MeshModel";
import { DataResponse } from "./DataResponse";
import * as $ from "jquery";
import { Mesh } from "three";
import { Vector3 } from "three/src/math/Vector3";

var currentSelected: Mesh;
var listRack: Array<CustomMesh>;
listRack = new Array();
var listRackFromDB: Array<MeshModel>;
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));
scene.background = new THREE.Color(0xccffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
// const points = new Array()
// points.push( new THREE.Vector3( 0, 0, 0 ) )
// points.push( new THREE.Vector3( 0, 0, .25 ) )
// const geometry = new THREE.BufferGeometry().setFromPoints( points )
// const line = new THREE.Line( geometry, material )
// scene.add( line )

const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(),
  new THREE.Vector3(),
  0.25,
  0xffff00
);
scene.add(arrowHelper);

const material = new THREE.MeshNormalMaterial();

const boxGeometry = new THREE.BoxGeometry(1, 0.3, 1);
const coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);

const raycaster = new THREE.Raycaster();
const sceneMeshes: THREE.Object3D[] = [];
let intersectedObject: THREE.Object3D | null;

const loader = new GLTFLoader();
loader.load(
  "models/final.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        //console.log(m.name);
        (m.material as THREE.MeshStandardMaterial).flatShading = true;
        //m.material = new THREE.MeshStandardMaterial({color: 0xffffff * Math.random()});

        if (m.name.includes("Palette_")) {
          //console.log(m.name);
          //rouge
          //m.material = new THREE.MeshStandardMaterial({color: 0xFF0000});
          //console.log('hitany ilay batiment-----'+m.name);
          var tempCustomMesh = new CustomMesh(m);
          listRack.push(tempCustomMesh);
        } else {
          //console.log(m.name);
        }
        sceneMeshes.push(m);
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 2048;
        l.shadow.mapSize.height = 2048;
      }
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    if(xhr.loaded == xhr.total){
      getList()
    }
  },
  (error) => {
    console.log(error);
  },
  
);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

//renderer.domElement.addEventListener('dblclick', onDoubleClick, false)
renderer.domElement.addEventListener("dblclick", onMouseMove, false);

function onMouseMove(event: MouseEvent) {
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };

  // console.log(mouse)

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
  } else {
    intersectedObject = null;
  }

  listRack.forEach((o: CustomMesh, i) => {
    if (intersectedObject && intersectedObject.name === o.mesh.name) {
      if (o.carton == null) {
        const cube = new THREE.Mesh(
          boxGeometry,
          new THREE.MeshStandardMaterial({ color: 0xad8762 })
        );
        const n = new THREE.Vector3();
        n.copy((intersects[0].face as THREE.Face).normal);
        n.copy((intersects[0].face as THREE.Face).normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        cube.lookAt(n);
        cube.rotateX(Math.PI / 2);
        cube.position.copy(intersects[0].point);
        cube.position.addScaledVector(n, 0.1);
        o.carton = cube;
        scene.add(o.carton);
        sceneMeshes.push(o.carton);
      }
      $("#myIdToShow").hide();
      o.updateColorMaterial();
      if (o.isSelected) {
        positionClicked(intersectedObject.position, o);
      }
    }
  });
}
function positionClicked(position: Vector3, o: CustomMesh) {
  var v = position.project(camera);
  var width: number = 0;
  var height: number = 0;
  height = $(window).height()!;
  width = $(window).width()!;
  var left = (width * (v.x + 1)) / 2;
  var top = (height * (-v.y + 1)) / 2;

  $("#myIdToShow").css({ left: left, top: top });
  console.log(o.mesh.name);
  $(".meshe-name").text(o.mesh.name);
  $(".meshe-place").text("Place : Exterme à droite");
  $(".meshe-price").text("Prix : 12 €");
  $("#myIdToShow").show();
}

var hemiLight = new THREE.HemisphereLight(0xffffff, 0x0000ff);
hemiLight.position.set(0, 300, 0);
scene.add(hemiLight);
var dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(75, 300, -75);
scene.add(dirLight);
const light = new THREE.PointLight(0xffffff, 2, 200);
light.position.set(5, 10, 5);
scene.add(light);
const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // if (sceneMeshes.length > 1) {
  //     sceneMeshes[1].rotation.x += .002
  // }

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();

$("#validate").on("click", (event: JQuery.Event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  };

  const request = new Request(
    "https://dummy.restapiexample.com/api/v1/employees",
    { headers: headers }
  );

  const URL = request.url;
  const method = request.method;
  const credentials = request.credentials;
  fetch(request)
    .then((response) => {
      if (response.status === 200) {
        console.log(response.json());
        return response.json();
      } else {
        throw new Error("Something went wrong on api server!");
      }
    })
    .then((response) => {
      console.debug(response);
      // ...
    })
    .catch((error) => {
      console.error(error);
    });
});

$("#icClose").on("click", (event: JQuery.Event) => {
  //getListeReserved()
  $("#myIdToShow").hide();
});


async function getList() {
  try {
    const response = await fetch('http://127.0.0.1:8003/listPalette', {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });
 

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json()
    //const itemListResponse: MeshModel[] = <MeshModel[]>JSON.parse(result);

    //console.log('result--------'+JSON.stringify(result));
   // console.log
   let obj: DataResponse = JSON.parse(JSON.stringify(result));
   listRackFromDB = obj.list;
   getListeReservedFromDB()
  } catch (err) {
    console.log(err);
  }
}


function getListeReservedFromDB() {
  //recuperation de la liste dans la base
  console.log('niantso tato-----'+listRackFromDB.length)
  listRackFromDB.forEach((o: MeshModel, i) => {
    console.log('boucle-----'+o.name)
    //var result = listRack.filter(e => e.mesh.name === 'Palette_B3503')
    var result = listRack.filter((e) => e.mesh.name === o.name);
    if (result.length > 0) {
      console.log('nahita-----'+o.name)
      result[0].mesh.material = new THREE.MeshStandardMaterial({color: 0xDDE70D})
    }
  });
}
