
import * as THREE from 'three'
export class CustomMesh {
    customName: string;
    isSelected: boolean;
    mesh: THREE.Mesh;
    constructor(mesh:THREE.Mesh) {
        this.customName = ""
        this.isSelected = false
        this.mesh = mesh
        
      }
    getSelected(){
        return this.isSelected;
    }
    setSelected(state:boolean){
        this.isSelected = state;
    }
   
    showName() {
        console.log('----------niantso constructeur---------'); 
      return "Voici le nom de cette custom mesh, " + this.customName;
    }
    updateColorMaterial()
    {
        this.isSelected = !this.isSelected;
        this.isSelected ? this.mesh.material = new THREE.MeshStandardMaterial({color: 0xE70D2B}) : this.mesh.material = new THREE.MeshStandardMaterial({color: 0x0DE74C})
    }
  }