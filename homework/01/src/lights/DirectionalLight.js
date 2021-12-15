/*
 * @Author: linkenzone
 * @Date: 2021-12-13 19:57:10
 * @Descripttion: Do not edit
 */
class DirectionalLight {
  constructor(
    lightIntensity,
    lightColor,
    lightPos,
    focalPoint,
    lightUp,
    hasShadowMap,
    gl
  ) {
    this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
    this.mat = new EmissiveMaterial(lightIntensity, lightColor);
    this.lightPos = lightPos;
    this.focalPoint = focalPoint;
    this.lightUp = lightUp;

    this.hasShadowMap = hasShadowMap;
    this.fbo = new FBO(gl);
    if (!this.fbo) {
      console.log("无法设置帧缓冲区对象");
      return;
    }
  }

  // 作业 1 修改处
  // 它会在 ShadowMaterial 中被调用，并将返回光源处的 MVP 矩阵绑定从而完成参数传递过程。
  CalcLightMVP(translate, scale) {
    let lightMVP = mat4.create();
    let modelMatrix = mat4.create();
    let viewMatrix = mat4.create();
    let projectionMatrix = mat4.create();

    // Model transform
    // * translate(out, a, v)
    mat4.translate(modelMatrix, modelMatrix, translate); //平移

    // * scale(out, a, v)
    mat4.scale(modelMatrix, modelMatrix, scale); //缩放

    // View transform
    // * lookAt(out, eye, center, up)
    mat4.lookAt(viewMatrix, this.lightPos, this.focalPoint, this.lightUp); //Camera的lookup矩阵

    // Projection transform
    // * ortho(out, left, right, bottom, top, near, far)
    mat4.ortho(projectionMatrix, -500, 500, -500, 500, 0.1, 1000); //正交投影

    // * 这里的转换方程为 projectionMatrix * viewMatrix * modelMatrix
    mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
    mat4.multiply(lightMVP, lightMVP, modelMatrix);

    return lightMVP;
  }
}
