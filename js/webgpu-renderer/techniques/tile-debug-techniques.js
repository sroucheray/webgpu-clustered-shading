// Copyright 2020 Brandon Jones
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { WebGPURenderTechnique } from './webgpu-render-technique.js';
import { FrameUniforms, SimpleVertexSource, UNIFORM_SET, ATTRIB_MAP } from '../shaders/common.js';
import { TileFunctions, ClusterStructs, ClusterLightsStructs, MAX_LIGHTS_PER_CLUSTER } from '../shaders/clustered-compute.js';

/**
 * Technique visualizes simple depth info as greyscale range.
 */
export class DepthTechnique extends WebGPURenderTechnique {
  constructor(device, renderBundleDescriptor, bindGroupLayouts) {
    super(device, renderBundleDescriptor, bindGroupLayouts);
  }

  getVertexSource(defines) { return SimpleVertexSource; }

  getFragmentSource(defines) { return `
    ${FrameUniforms}

    [[builtin(frag_coord)]] var<in> fragCoord : vec4<f32>;

    [[location(0)]] var<out> outColor : vec4<f32>;

    [[stage(fragment)]]
    fn main() -> void {
      outColor = vec4<f32>(fragCoord.zzz, 1.0);
      return;
    }
  `; }
}

/**
 * Technique visualizes which depth slice a given fragment would be assigned to.
 */
export class DepthSliceTechnique extends WebGPURenderTechnique {
  constructor(device, renderBundleDescriptor, bindGroupLayouts) {
    super(device, renderBundleDescriptor, bindGroupLayouts);
  }

  getVertexSource(defines) { return SimpleVertexSource; }

  getFragmentSource(defines) { return `
    ${FrameUniforms}
    ${TileFunctions}

    var<private> colorSet : array<vec3<f32>, 9> = array<vec3<f32>, 9>(
      vec3<f32>(1.0, 0.0, 0.0),
      vec3<f32>(1.0, 0.5, 0.0),
      vec3<f32>(0.5, 1.0, 0.0),
      vec3<f32>(0.0, 1.0, 0.0),
      vec3<f32>(0.0, 1.0, 0.5),
      vec3<f32>(0.0, 0.5, 1.0),
      vec3<f32>(0.0, 0.0, 1.0),
      vec3<f32>(0.5, 0.0, 1.0),
      vec3<f32>(1.0, 0.0, 0.5)
    );

    [[builtin(frag_coord)]] var<in> fragCoord : vec4<f32>;

    [[location(0)]] var<out> outColor : vec4<f32>;

    [[stage(fragment)]]
    fn main() -> void {
      var tile : vec3<i32> = getTile(fragCoord);
      outColor = vec4<f32>(colorSet[tile.z % 9], 1.0);
      return;
    }
  `; }
}

/**
 * Technique visualizes distance to the center of each cluster.
 */
export class ClusterDistanceTechnique extends WebGPURenderTechnique {
  constructor(device, renderBundleDescriptor, bindGroupLayouts, clusterBuffer) {
    super(device, renderBundleDescriptor, bindGroupLayouts);

    this.clusterBindGroup = this.device.createBindGroup({
      layout: bindGroupLayouts.cluster,
      entries: [{
        binding: 0,
        resource: {
          buffer: clusterBuffer,
        },
      }],
    });
  }

  createPipelineLayout(bindGroupLayouts) {
    this.clusterBindGroupLayout = this.device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        type: 'readonly-storage-buffer'
      }]
    });

    // Override per-technique if needed
    return this.device.createPipelineLayout({
      bindGroupLayouts: [
        bindGroupLayouts.frame,
        bindGroupLayouts.material,
        bindGroupLayouts.primitive,
        bindGroupLayouts.cluster,
      ]
    });
  }

  createRenderBundle(primitives, frameBindGroups) {
    frameBindGroups[3] = this.clusterBindGroup;
    return super.createRenderBundle(primitives, frameBindGroups);
  }

  getVertexSource(defines) { return `
    ${FrameUniforms}

    [[block]] struct PrimitiveUniforms {
      [[offset(0)]] modelMatrix : mat4x4<f32>;
    };
    [[set(${UNIFORM_SET.Primitive}), binding(0)]] var<uniform> primitive : PrimitiveUniforms;

    [[location(${ATTRIB_MAP.POSITION})]] var<in> POSITION : vec3<f32>;

    [[location(0)]] var<out> viewPosition : vec4<f32>;
    [[builtin(position)]] var<out> outPosition : vec4<f32>;

    [[stage(vertex)]]
    fn main() -> void {
      viewPosition = frame.viewMatrix * primitive.modelMatrix * vec4<f32>(POSITION, 1.0);
      outPosition = frame.projectionMatrix * viewPosition;
      return;
    }
  `}

  getFragmentSource(defines) { return `
    ${FrameUniforms}
    ${TileFunctions}
    ${ClusterStructs}
    [[set(3), binding(0)]] var<storage_buffer> clusters : [[access(read)]] Clusters;

    [[builtin(frag_coord)]] var<in> fragCoord : vec4<f32>;

    [[location(0)]] var<in> viewPosition : vec4<f32>;
    [[location(0)]] var<out> outColor : vec4<f32>;

    [[stage(fragment)]]
    fn main() -> void {
      var clusterIndex : i32 = getClusterIndex(fragCoord);

      # THIS CRASHES:
      # var clusterBounds : ClusterBounds = clusters.bounds[clusterIndex];

      const midPoint : vec3<f32> = (clusters.bounds[clusterIndex].maxAABB - clusters.bounds[clusterIndex].minAABB) / vec3<f32>(2.0, 2.0, 2.0);
      const center : vec3<f32> = clusters.bounds[clusterIndex].minAABB + midPoint;
      const radius : f32 = length(midPoint);

      var fragToBoundsCenter : vec3<f32> = viewPosition.xyz - center;
      var distToBoundsCenter : f32 = length(fragToBoundsCenter);
      var normDist : f32 = distToBoundsCenter / radius;

      # FILE BUG: Why does this come out white?
      #outColor = vec4<f32>(1.0, 0, 0, 1.0);
      outColor = vec4<f32>(normDist, normDist, normDist, 1.0);
      return;
    }
  `; }
}

/**
 * Technique visualizes how many lights are affecting any given cluster.
 */
export class LightsPerClusterTechnique extends WebGPURenderTechnique {
  constructor(device, renderBundleDescriptor, bindGroupLayouts) {
    super(device, renderBundleDescriptor, bindGroupLayouts);
  }

  getVertexSource(defines) { return SimpleVertexSource; }

  getFragmentSource(defines) { return `
    ${FrameUniforms}
    ${ClusterLightsStructs}
    ${TileFunctions}

    [[builtin(frag_coord)]] var<in> fragCoord : vec4<f32>;

    [[location(0)]] var<out> outColor : vec4<f32>;

    [[stage(fragment)]]
    fn main() -> void {
      var clusterIndex : i32 = getClusterIndex(fragCoord);
      var lightCount : i32 = clusterLights.lights[clusterIndex].count;
      outColor = vec4<f32>(f32(lightCount) / f32(${MAX_LIGHTS_PER_CLUSTER}), 0.0, 0.0, 1.0);
      return;
    }
  `; }
}