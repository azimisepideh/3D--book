import BaseMathUtils from './BaseMathUtils';

export default class ThreeUtils {

  static vertices2UVs(vertices, indeces, first, last, converClb) {
    const r = [];
    for(let i = first; i<last; ++i) {
      const vis = [indeces[i].a,indeces[i].b,indeces[i].c];
      for(let j = 0; j<vis.length; ++j) {
        if(!r[vis[j]]) {
          r[vis[j]] = converClb(vertices[vis[j]]);
        }
      }
    }
    return r;
  }

  static computeFaceVertexUvs(geometry, faces) {
    const uvs = [
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, 0, faces[0], (p)=>new THREE.Vector2(p.x, 1-p.z)),
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, faces[0], faces[1], (p)=>new THREE.Vector2(1-p.x, 1-p.z)),
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, faces[1], faces[2], (p)=>new THREE.Vector2(p.x, p.y)),
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, faces[2], faces[3], (p)=>new THREE.Vector2(1-p.x, p.y)),
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, faces[3], faces[4], (p)=>new THREE.Vector2(p.z, p.y)),
                ThreeUtils.vertices2UVs(geometry.vertices, geometry.faces, faces[4], geometry.faces.length, (p)=>new THREE.Vector2(1-p.z, p.y))
    ];

    let uvsi = 0;
    for(let i = 0; i<geometry.faces.length; ++i) {
      uvsi += faces[uvsi] === i;
      const f = geometry.faces[i];
      f.materialIndex = uvsi;
      geometry.faceVertexUvs[0][i] = [uvs[uvsi][f.a], uvs[uvsi][f.b], uvs[uvsi][f.c]];
    }
  }

  static createMarker(p, c, size) {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshPhongMaterial({ color: c }));
    marker.position.set(p.x,p.y,p.z);
    return marker;
  }

  static findUvTris(geometry, ps, first, last) {
    const res = [];
    for(let p of ps) {
      let found = false;
      for(let i=first; i<last && !found; ++i) {
        const tri = geometry.faceVertexUvs[0][i];
        if(BaseMathUtils.isInsideConvPoly(tri, p)) {
          res.push({
            coefs: BaseMathUtils.computeInterpCoefs(tri, p),
            i
          });
          found = true;
        }
      }
      if(!found) {
        console.error('Bad point');
        res.push(undefined);
      }
    }
    return res;
  }

  static findInternalVertices(geometry, ps, first, last) {
    const res = {};
    for(let i=first; i<last; ++i) {
      const tri = geometry.faceVertexUvs[0][i], f = geometry.faces[i], vs = [f.a, f.b, f.c];
      for(let j=0; j<tri.length; ++j) {
        if(res[vs[j]]===undefined && BaseMathUtils.isInsidePoly(ps, tri[j])) {
          res[vs[j]] = {
            p: tri[j],
            i: vs[j],
            n: f.vertexNormals[j]
          };
        }
      }
    }
    return Object.values(res);
  }

}
