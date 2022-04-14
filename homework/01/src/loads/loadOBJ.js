/*
 * @Author: linkenzone
 * @Date: 2021-12-13 19:57:10
 * @Descripttion: Do not edit
 */
async function loadOBJ(renderer, path, name, objMaterial, transform) {

	const manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};

	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
		}
	}
	function onError(err) {
		console.error( 'An error happened:' , err);
	 }

	function sleep(ms) { // 异步方法
		return new Promise(function(resolve, reject) {
			setTimeout(resolve,ms);
		})
	}

	let materials;

    new THREE.MTLLoader(manager)
		.setPath(path)
		.load(name + '.mtl', async (_materials) => {
			materials = _materials;
			materials.preload();

			await sleep(100); // 一个折衷的解决方案...

			const obj_loader = new THREE.OBJLoader();
			obj_loader.setMaterials(materials);
			obj_loader.setPath(path);

			obj_loader.load(name + '.obj',  (object) => {
				object.traverse(function (child) {
					if (child.isMesh) {
						let geo = child.geometry;
						let mat;
						if (Array.isArray(child.material)) mat = child.material[0];
						else mat = child.material;
		
						var indices = Array.from({ length: geo.attributes.position.count }, (v, k) => k);
						let mesh = new Mesh({ name: 'aVertexPosition', array: geo.attributes.position.array },
							{ name: 'aNormalPosition', array: geo.attributes.normal.array },
							{ name: 'aTextureCoord', array: geo.attributes.uv.array },
							indices, transform);
						
						let colorMap = new Texture();
						if (mat.map != null) {
							if(mat.map.image !== null && mat.map.image !== undefined){
								colorMap.CreateImageTexture(renderer.gl, mat.map.image);
							}
						}
						else {
							colorMap.CreateConstantTexture(renderer.gl, mat.color.toArray());
						}
		
						let material, shadowMaterial;
						let Translation = [transform.modelTransX, transform.modelTransY, transform.modelTransZ];
						let Scale = [transform.modelScaleX, transform.modelScaleY, transform.modelScaleZ];
		
						let light = renderer.lights[0].entity;
						switch (objMaterial) {
							case 'PhongMaterial':
								material = buildPhongMaterial(colorMap, mat.specular.toArray(), light, Translation, Scale, "./src/shaders/phongShader/phongVertex.vs", "./src/shaders/phongShader/phongFragment.fs");
								shadowMaterial = buildShadowMaterial(light, Translation, Scale, "./src/shaders/shadowShader/shadowVertex.glsl", "./src/shaders/shadowShader/shadowFragment.glsl");
								break;
						}
		
						material.then((data) => {
							let meshRender = new MeshRender(renderer.gl, mesh, data);
							renderer.addMeshRender(meshRender);
						});
						shadowMaterial.then((data) => {
							let shadowMeshRender = new MeshRender(renderer.gl, mesh, data);
							renderer.addShadowMeshRender(shadowMeshRender);
						});
					}
				});
			}, onProgress, onError);
		});
}
