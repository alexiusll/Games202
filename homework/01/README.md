# 任务一

需要实现 shadow map



## step.01

这里首先需要修改 lights/DirectionalLight.js中的 **CalcLightMVP** 函数。这里会用到 **mat4** 这个方法来创建矩阵。

推测应该是使用了 gl-matrix 这个矩阵的库，主要使用了 **mat4**，它的API请看：

https://glmatrix.net/docs/module-mat4.html



这里相当于从光源设置一个 正交投影的虚拟摄像机

**homework\01\src\lights\DirectionalLight.js**

```javascript
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
```



这样就会生成一个 500 * 500 精度的贴图，图例：

![image-20211221205039859](README/image-20211221205039859.png)

实际这里用了 pack 和 unpack的方法，生成的贴图不应该是这样的...这里只展示不使用pack的时候，贴图是这样的



## step.02

需要完善 phongFragment.glsl 中的 

**useShadowMap(sampler2D shadowMap, vec4 shadowCoord)** 函数。

该函数负责查询当前着色点在 ShadowMap 上记录的深度值，并与转换到 light space 的深度值比较后返回 visibility 项（请注意，使用的查询坐标需要先转换到 NDC 标准空间 [0,1]）。



修改后的函数

**homework\01\src\shaders\phongShader\phongFragment.glsl**

```glsl
float useShadowMap(sampler2D shadowMap, vec4 shadowCoord) {
  float bias = Bias();
  vec4 depthpack = texture2D(shadowMap, shadowCoord.xy);
  float depthUnpack = unpack(depthpack);
  // float depthUnpack = depthpack.x;
  // 检查当前片段是否在阴影中
  if (depthUnpack > shadowCoord.z - bias) {
    // 不在阴影中，返回 1.0
    return 1.0;
  }
  // 否则在阴影中，返回 0.5
  return 0.5;
}
```

这里bis也可以直接设置成 0.005 之类的



Bias() 函数为

```glsl
float Bias() {
  //解决shadow bias 因为shadow map的精度有限，当要渲染的fragment在light
  // space中距Light很远的时候，就会有多个附近的fragement会samper shadow
  // map中同一个texel,但是即使这些fragment在camera view
  // space中的深度值z随xy变化是值变化是很大的， 但他们在light space
  // 中的z值(shadow map中的值)却没变或变化很小，这是因为shadow
  // map分辨率低，采样率低导致精度低，不能准确的记录这些细微的变化

  // calculate bias (based on depth map resolution and slope)  vec3 lightDir =
  // normalize(uLightPos);
  vec3 lightDir = normalize(uLightPos);
  vec3 normal = normalize(vNormal);
  float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.005);
  return bias;
}
```

这里如何取bias 不深究，具体可以参考 learnopengl 上面

https://learnopengl-cn.github.io/05%20Advanced%20Lighting/03%20Shadows/01%20Shadow%20Mapping/



main 方法：

```glsl
void main(void) {
  float visibility;
  // perform perspective divide 执行透视划分
  vec3 projCoords = vPositionFromLight.xyz / vPositionFromLight.w;
  // transform to [0,1] range 变换到[0,1]的范围
  vec3 shadowCoord = projCoords * 0.5 + 0.5;
    
  // 计算是否在阴影中
  visibility = useShadowMap(uShadowMap, vec4(shadowCoord, 1.0));
  vec3 phongColor = blinnPhong();
  gl_FragColor = vec4(phongColor * visibility, 1.0);
}
```

**这里不太理解 vPositionFromLight.xyz / vPositionFromLight.w; 是干了什么，不太记得这个投影矩阵了...**



**结果图**

![image-20211221213343879](README/image-20211221213343879.png)
