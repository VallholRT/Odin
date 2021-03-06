import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ArcRotateCamera, BoundingBox, Light, Mesh, Vector3 } from 'babylonjs';
import { PlugGeometry } from 'src/app/engine/plugs/plug-geometry';
import { PlugSpotLight } from 'src/app/engine/plugs/plug-light/plug-spot-light';
import { EngineService } from 'src/app/services/engine.service';
import { Container } from 'src/app/shared/container/container';
import { LIGHT } from '../configuration/app-constants';
import { PlugCamera } from '../engine/plugs/plug-camera';
import { PlugPointLight } from '../engine/plugs/plug-light/plug-point-light';
import { PlugMaterial } from '../engine/plugs/plug-material';
import { PlugTransform } from '../engine/plugs/plug-transform';
import { Utils } from '../engine/Utils/Utils';
import { SceneSettings } from '../models/SceneSettings.model';
import { AppState } from '../store/app.reducer';
import { PlugDirectionalLight } from './../engine/plugs/plug-light/plug-directional-light';
import { PlugHemisphericLight } from './../engine/plugs/plug-light/plug-hemispheric-light';
import { PlugText } from './../engine/plugs/plug-text';

@Injectable({ providedIn: 'root' })
export class AppService {

  sceneSettings: SceneSettings;

  // References Containers
  public plugToContainer = new Map<Node | PlugGeometry | Light, Container>();
  public uuidToContainer = new Map<string, Container>();
  public uuidToBBox = new Map<string, BoundingBox>();
  public uuidToCamera = new Map<string, ArcRotateCamera>();

  private selectedUuidContainers: string[];

  constructor(
    public engineServ: EngineService,
    public store: Store<AppState>,
  ) {
    this.sceneSettings = new SceneSettings();
    this.loadSceneSettings();
    store.select('engine').subscribe(en => {
      this.selectedUuidContainers = [...en.uuidCsSelected];
    });
  }

  /** Default Scene */
  public createDefaultScene() {
    let container = this.newContainer();
    container.setPlugLight(new PlugDirectionalLight(container));
    container.name = "Light";

    let x = Utils.degreeToRadians(-15);
    let y = Utils.degreeToRadians(-30);
    let z = Utils.degreeToRadians(-30);
    container.getPlugTransform().rotation = new Vector3(Utils.precision(x, 3), Utils.precision(y, 3), Utils.precision(z, 3));

    container = this.newContainer();
    let defaultPlugCamera = new PlugCamera(container);
    defaultPlugCamera.active = true;
    container.setPlugCamera(defaultPlugCamera);
    container.name = "Camera"
    this.engineServ.setCamera(defaultPlugCamera);
  }

  /** Settings */
  loadSceneSettings() {
    // TODO Load from firebase

    //Default Settings
    this.loadDefaultSceneSettings();
  }

  loadDefaultSceneSettings() {
    this.sceneSettings.backgroundColor = "#000000";
  }

  getSceneSettings(): SceneSettings {
    return { ... this.sceneSettings };
  }

  setSceneSettings(settings: SceneSettings): void {
    this.sceneSettings = { ...settings };
  }

  /** Generate Containers and Plugs */
  newContainer(): Container {
    let container = new Container();
    container.setPlugTransform(new PlugTransform());
    this.addContainerToMapScene(container);

    this.engineServ.emitNewContainerTreeNode$.next(container);
    return container;
  }

  addPlugGeometry(geomType: any): void {
    if (this.noSelected()) return;
    let container = this.getFirstSelected();
    let pg = new PlugGeometry(container, geomType);
    container.setPlugGeometry(pg);
    this.addPlugGeometryToMapScene(container);
  }

  addDefaultMaterial() {
    if (this.noSelected()) return;
    let container = this.getFirstSelected();
    container.setPlugMaterial(new PlugMaterial(container));
  }

  addPlugLight(lightType: any) {
    if (this.noSelected()) return;
    let container = this.getFirstSelected();
    let pl;
    switch (lightType) {
      case LIGHT.DIRECTIONAL:
        container.setPlugLight(pl = new PlugDirectionalLight(container));
        break;
      case LIGHT.SPOT:
        container.setPlugLight(pl = new PlugSpotLight(container));
        break;
      case LIGHT.POINT:
        container.setPlugLight(pl = new PlugPointLight(container));
        break;
      case LIGHT.HEMISPHERIC:
        container.setPlugLight(pl = new PlugHemisphericLight(container));
        break;
    }
    this.addContainerToMapScene(container);
  }

  addPlugCamera() {
    if (this.noSelected()) return;
    let container = this.getFirstSelected();
    container.setPlugCamera(new PlugCamera(container));
    this.addContainerToMapScene(container);
  }

  async addPlugText() {
    if (this.noSelected()) return;
    let container = this.getFirstSelected();
    container.setPlugGeometry(new PlugText(container));
    container.name = "Text"
    this.addPlugGeometryToMapScene(container);
  }

  /** References Containers */
  public getContainerFromUuid(uuid: string): Container { return this.uuidToContainer.get(uuid) }
  public getContainerFromPlugGeometry(type: Node | PlugGeometry): Container { return this.plugToContainer.get(type) }

  // Get Selections methods
  public noSelected(): boolean { return this.selectedUuidContainers.length < 1 }
  public getSelectedContainers(): string[] { return this.selectedUuidContainers }
  public getFirstSelected(): Container { return this.getContainerFromUuid(this.selectedUuidContainers[0]); }

  /** Map object in Scene */
  addContainerToMapScene(c: Container) {
    this.uuidToContainer.set(c.uuid, c);
  }

  addPlugGeometryToMapScene(c: Container) {
    this.plugToContainer.set(c.getPlugGeometry(), c);
    this.uuidToBBox.set(c.uuid, (c.getPlugGeometry()).getBoundingInfo().boundingBox);
  }

  addCameraToMapScene(c: Container, camera: ArcRotateCamera) { this.uuidToCamera.set(c.uuid, camera); }
}