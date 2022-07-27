
import * as THREE from 'three'
import { MeshModel } from './MeshModel'
export class CustomMesh {
    customName: string
    isSelected: boolean
    mesh: THREE.Mesh
    carton?: THREE.Mesh
    etage?:number
    colonne? :number
    rack? : string
    constructor(mesh:THREE.Mesh) {
        this.customName = mesh.name
        this.isSelected = false
        this.mesh = mesh      
      }
    getSelected(){
        return this.isSelected;
    }
    setSelected(state:boolean){
        this.isSelected = state;
    }
    setCarton(carton:THREE.Mesh){
      carton.visible = false;
      this.carton = carton;
  }
  setInfoFromDB(meshModel :MeshModel)
  {
    this.etage = meshModel.etage
    this.colonne = meshModel.colonne
    this.rack = meshModel.rack

  }
   
    showName() {
        console.log('----------niantso constructeur---------'); 
      return "Voici le nom de cette custom mesh, " + this.customName;
    }
    updateColorMaterial()
    {
        this.isSelected = !this.isSelected;
        this.isSelected ? this.mesh.material = new THREE.MeshStandardMaterial({color: 0xE70D2B}) : this.mesh.material = new THREE.MeshStandardMaterial({color: 0x0DE74C})
        if(this.carton != null)this.carton.visible = this.isSelected
    }
  }