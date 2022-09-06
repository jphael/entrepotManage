import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { LoadingManager } from "three/src/loaders/LoadingManager";
import Stats from "three/examples/jsm/libs/stats.module";
import { CustomMesh } from "./CustomMesh";
import { MeshModel } from "./MeshModel";
import { DataResponse } from "./DataResponse";
import * as $ from "jquery";
import * as bootstrap from "bootstrap";
import { Mesh } from "three";
import { Vector3 } from "three/src/math/Vector3";
var myModal: bootstrap.Modal;
var currentSelected: Mesh;
var listRack: Array<CustomMesh>;
var listIdCheckBox: string[] = new Array();
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
const manager = new LoadingManager();
const loader = new GLTFLoader(manager);
manager.itemStart("final");
loader.load(
  "models/final.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        //console.log("" + m.name);
        (m.material as THREE.MeshStandardMaterial).flatShading = true;
        //m.material = new THREE.MeshStandardMaterial({color: 0xffffff * Math.random()});

        if (m.name.includes("PL_")) {
          console.log('newName---'+m.name);
          //rouge
          //m.material = new THREE.MeshStandardMaterial({color: 0xFF0000});
            var tempCustomMesh = new CustomMesh(m);
            listRack.push(tempCustomMesh);
            //console.log('-- taille palette '+listRack.length);
          //m.visible = false;
        } else if (m.name.includes("CR_")) {
          //console.log('--'+m.name);
          var splitted = m.name.split("_", 2);
          var paleteNameToFind = "PL_" + splitted[1];
          listRack.forEach((o: CustomMesh, i) => {
            if (paleteNameToFind === o.mesh.name) {
              //console.log('nahita--');
              o.setCarton(m);
            }
          });
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
      manager.itemEnd("final");
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    //console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

manager.onLoad = function () {
  //console.log("---------------everything is done-- taille palette " + listRack.length);
  getList();
};

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

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
    console.log("name clicked " + intersectedObject.name);
  } else {
    intersectedObject = null;
  }
  //if(!intersectedObject || !(intersectedObject.name.includes("PL_")) || !(intersectedObject.name.includes("CR_"))) return
  listRack.forEach((o: CustomMesh, i) => {
    if (
      (intersectedObject && intersectedObject.name === o.mesh.name) ||
      (intersectedObject && intersectedObject.name === o.carton?.name)
    ) {
      paletteByRack();
      //$("#myIdToShow").hide();
      o.updateColorMaterial();
      if (o.isSelected) {
        // positionClicked(intersectedObject.position, o);
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
  //console.log(o.mesh.name);
  $(".meshe-name").text(o.mesh.name);
  $(".meshe-place").text("Etage : " + o.etage);
  $(".meshe-price").text("rack : " + o.rack);
  $("#myIdToShow").show();
}

//($('#myModal') as any ).show()
//(<any>$('#myModal')).modal('show');
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

$("#btnSend").on("click", (event: JQuery.Event) => {
  var idPaletteSelected: string[] = new Array();
  listIdCheckBox.forEach((idPalette: string) => {
    if ($("#" + idPalette).is(":checked")) {
      idPaletteSelected.push(idPalette);
      listRack.forEach((o: CustomMesh, i) => {
        if (idPalette && idPalette === o.mesh.name) {
          //console.log("---------manao update--" + o.mesh.name);
          //o.updateColorMaterial();
        }
      });
    }
  });
  //console.log("---------list palette  params--" + JSON.stringify(idPaletteSelected));
  myModal.hide();
  updateStatus(idPaletteSelected);
});

async function updateStatus(params : string[]) {
  try {
    var idArray = JSON.stringify(params)
    const response = await fetch(
      "http://127.0.0.1:8003/palette-update-status",
      {
        method: "post",
        headers: {
          accept: "application/json",
        },
        //body: `{idArray["PL_A0001E3C4","PL_A0001E2C4","PL_A0001E1C4"]}`
        body: new URLSearchParams(`idArray=${idArray}`),
        //body: JSON.stringify("idArray":idPaletteSelected),
      }
    );

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }
  } catch (err) {
    console.log(err);
  }
}

function resetAllData() {
  listIdCheckBox = new Array();
  $("#wsresult").html("");
}
async function paletteByRack() {
  resetAllData();
  try {
    const response = await fetch("http://127.0.0.1:8003/palette-rack", {
      method: "post",
      headers: {
        accept: "application/json",
      },
      body: new URLSearchParams("rack=AAA1&colonne=1"),
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();

    let obj: DataResponse = JSON.parse(JSON.stringify(result));
    var listPaletteByRack: Array<MeshModel>;
    listPaletteByRack = obj.list;
    const myMap: Map<number, [MeshModel]> = new Map();

    listPaletteByRack.forEach((itemModel: MeshModel, j) => {
      if (myMap.get(itemModel.etage) && myMap.has(itemModel.etage)) {
        var currentList = myMap.get(itemModel.etage);
        //currentList?.push("Etage "+itemModel.etage + " colonne "+itemModel.palette_position)
        currentList?.push(itemModel);
      } else {
        myMap.set(itemModel.etage, [itemModel]);
      }
    });

    var divPalette = $("#wsresult");
    myMap.forEach((value: [MeshModel], key: number) => {
      var divEtage = `<div class='mb-3 row'>`;
      divPalette.append(divEtage);
      value.forEach((curentValue: MeshModel) => {
        var name: string = curentValue.name;
        var palettePosition = curentValue.palette_position;
        var paleteEtage = curentValue.etage;
        var classColMD3 = `class='col-md-3'`;
        var strPalettePosition = `Etage ${paleteEtage}  position ${palettePosition}`;
        var enableColor = `accent-color: green`;
        var disableColor = `accent-color: red`;
        var checkDiv = "";
        if (curentValue.is_reserved) {
          checkDiv = `<div ${classColMD3}><input disabled type='checkbox' id=${name}  name=${name} /><label for=${name}>${strPalettePosition} </label></div>`;
        } else {
          listIdCheckBox.push(name);
          checkDiv = `<div ${classColMD3}><input  type='checkbox' id=${name}  name=${name} /><label for=${name}>${strPalettePosition} </label></div>`;
        }
        divPalette.append(checkDiv);
      });
      var divEtageEnd = "</div>";
      divPalette.append(divEtageEnd);
    });

    myModal = new bootstrap.Modal("#myModal", {});
    //$('#category').val("testaaaaaaaaaaa");
    myModal.show();
  } catch (err) {
    console.log(err);
  }
}

async function getList() {
  try {
    const response = await fetch("http://127.0.0.1:8003/listPalette", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    //const itemListResponse: MeshModel[] = <MeshModel[]>JSON.parse(result);

    //console.log('result--------'+JSON.stringify(result));
    let obj: DataResponse = JSON.parse(JSON.stringify(result));
    listRackFromDB = obj.list;
    getListeReservedFromDB();
  } catch (err) {
    console.log(err);
  }
}

function getListeReservedFromDB() {
  //recuperation de la liste dans la base
  listRackFromDB.forEach((o: MeshModel, i) => {
    //var result = listRack.filter(e => e.mesh.name === 'Palette_B3503')
    var result = listRack.filter((e) => e.mesh.name === o.name);
    if (result.length > 0) {
      //result[0].mesh.material = new THREE.MeshStandardMaterial({color: 0xDDE70D})
      //result[0].setInfoFromDB(o)
    }
  });
}
