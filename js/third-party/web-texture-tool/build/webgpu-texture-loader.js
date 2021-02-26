var E={"image/jpeg":"rgb8unorm","image/png":"rgba8unorm","image/apng":"rgba8unorm","image/gif":"rgba8unorm","image/bmp":"rgb8unorm","image/webp":"rgba8unorm","image/x-icon":"rgba8unorm","image/svg+xml":"rgba8unorm"},F=typeof createImageBitmap!="undefined",y=class{constructor(){}static supportedMIMETypes(){return Object.keys(E)}async fromUrl(e,t,r){let o=E[r.mimeType];if(e.supportedFormatList.indexOf(o)==-1&&(o="rgba8unorm"),F){let s=await fetch(t),i=await createImageBitmap(await s.blob());return e.fromImageBitmap(i,o,r.mipmaps)}else return new Promise((s,i)=>{let n=new Image;n.addEventListener("load",()=>{s(e.textureFromImageElement(n,o,r.mipmaps))}),n.addEventListener("error",function(d){i(d)}),n.src=t})}async fromBlob(e,t,r){let o=E[t.type];if(e.supportedFormatList.indexOf(o)==-1&&(o="rgba8unorm"),F){let s=await createImageBitmap(t);return e.fromImageBitmap(s,o,r.mipmaps)}else return new Promise((s,i)=>{let n=new Image;n.addEventListener("load",()=>{s(e.fromImageElement(n,o,r.mipmaps))}),n.addEventListener("error",function(m){i(m)});let d=window.URL.createObjectURL(t);n.src=d})}async fromBuffer(e,t,r){let o=new Blob(t,{type:r.mimeType});return this.fromBlob(e,o,r)}destroy(){}};var W=import.meta.url.replace(/[^\/]*$/,""),M=class{constructor(e,t,r,o){this.client=e,this.options=t,this.resolve=r,this.reject=o}},u={},C=1;function z(a){let e=u[a.data.id];if(!e){a.data.error&&console.error(`Texture load failed: ${a.data.error}`),console.error(`Invalid pending texture ID: ${a.data.id}`);return}if(delete u[a.data.id],a.data.error){console.error(`Texture load failed: ${a.data.error}`),e.reject(`${a.data.error}`);return}let t=e.client.fromTextureData(a.data,e.options.mipmaps);e.resolve(t)}var g=class{constructor(e){let t=`${W}${e}`;this.worker=new Worker(t),this.worker.onmessage=z}async fromUrl(e,t,r){let o=C++;return this.worker.postMessage({id:o,url:t,supportedFormats:e.supportedFormats(),mipmaps:r.mipmaps,extension:r.extension}),new Promise((s,i)=>{u[o]=new M(e,r,s,i)})}async fromBlob(e,t,r){let o=await t.arrayBuffer();return this.fromBuffer(e,o,r)}async fromBuffer(e,t,r){let o=C++;return this.worker.postMessage({id:o,buffer:t,supportedFormats:e.supportedFormats(),mipmaps:r.mipmaps,extension:r.extension}),new Promise((s,i)=>{u[o]=new M(e,r,s,i)})}destroy(){if(this.worker){this.worker.terminate();let e=new Error("Texture loader was destroyed.");for(let t of u)t.reject(e)}}};var l=WebGLRenderingContext,G={rgb8unorm:{canGenerateMipmaps:!0,gl:{format:l.RGB,type:l.UNSIGNED_BYTE,sizedFormat:32849}},rgba8unorm:{canGenerateMipmaps:!0,gl:{format:l.RGBA,type:l.UNSIGNED_BYTE,sizedFormat:32856}},"rgb8unorm-srgb":{canGenerateMipmaps:!0,gl:{format:l.RGB,type:l.UNSIGNED_BYTE,sizedFormat:35904}},"rgba8unorm-srgb":{canGenerateMipmaps:!0,gl:{format:l.RGBA,type:l.UNSIGNED_BYTE,sizedFormat:35907}},rgb565unorm:{canGenerateMipmaps:!0,gl:{format:l.RGB,type:l.UNSIGNED_SHORT_5_6_5,sizedFormat:l.RGB565}},rgba4unorm:{canGenerateMipmaps:!0,gl:{format:l.RGBA,type:l.UNSIGNED_SHORT_4_4_4_4,sizedFormat:l.RGBA4}},rgba5551unorm:{canGenerateMipmaps:!0,gl:{format:l.RGBA,type:l.UNSIGNED_SHORT_5_5_5_1,sizedFormat:l.RGB5_A1}},bgra8unorm:{canGenerateMipmaps:!0},"bgra8unorm-srgb":{canGenerateMipmaps:!0},"bc1-rgb-unorm":{gl:{texStorage:!0,sizedFormat:33776},compressed:{blockBytes:8,blockWidth:4,blockHeight:4}},"bc2-rgba-unorm":{gl:{texStorage:!0,sizedFormat:33778},compressed:{blockBytes:16,blockWidth:4,blockHeight:4}},"bc3-rgba-unorm":{gl:{texStorage:!1,sizedFormat:33779},compressed:{blockBytes:16,blockWidth:4,blockHeight:4}},"bc7-rgba-unorm":{gl:{texStorage:!0,sizedFormat:36492},compressed:{blockBytes:16,blockWidth:4,blockHeight:4}},"etc1-rgb-unorm":{gl:{texStorage:!1,sizedFormat:36196},compressed:{blockBytes:8,blockWidth:4,blockHeight:4}},"etc2-rgba8unorm":{gl:{texStorage:!0,sizedFormat:37496},compressed:{blockBytes:16,blockWidth:4,blockHeight:4}},"astc-4x4-rgba-unorm":{gl:{texStorage:!0,sizedFormat:37808},compressed:{blockBytes:16,blockWidth:4,blockHeight:4}},"pvrtc1-4bpp-rgb-unorm":{gl:{texStorage:!1,sizedFormat:35840},compressed:{blockBytes:8,blockWidth:4,blockHeight:4}},"pvrtc1-4bpp-rgba-unorm":{gl:{texStorage:!1,sizedFormat:35842},compressed:{blockBytes:8,blockWidth:4,blockHeight:4}}};var v=class{constructor(e,t={}){this.texture=e,this.width=t.width||1,this.height=t.height||1,this.depth=t.depth||1,this.mipLevels=t.mipLevels||1,this.format=t.format||"rgba8unorm",this.type=t.type||"2d"}},P=class{constructor(e,t,r,o=null,s={}){this.format=e,this.width=Math.max(1,t),this.height=Math.max(1,r),this.levels=[],o&&this.getLevel(0).setSlice(0,o,s)}getLevel(e,t={}){let r=this.levels[e];return r||(r=new _(this,e,t),this.levels[e]=r),r}},_=class{constructor(e,t,r){this.textureData=e,this.levelIndex=t,this.width=Math.max(1,r.width||this.textureData.width>>t),this.height=Math.max(1,r.height||this.textureData.height>>t),this.slices=[]}setSlice(e,t,r={}){if(this.slices[e]!=null)throw new Error("Cannot define an image slice twice.");let o=r.byteOffset||0,s=r.byteLength||0,i;t instanceof ArrayBuffer?(i=t,s||(s=i.byteLength-o)):(i=t.buffer,s||(s=t.byteLength-o),o+=t.byteOffset),this.slices[e]={buffer:i,byteOffset:o,byteLength:s}}},f=class{constructor(e,t){this.mimeTypes=e,this.callback=t,this.loader=null}getLoader(){return this.loader||(this.loader=this.callback()),this.loader}},U={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",apng:"image/apng",gif:"image/gif",bmp:"image/bmp",webp:"image/webp",ico:"image/x-icon",cur:"image/x-icon",svg:"image/svg+xml",basis:"image/basis",ktx:"image/ktx",ktx2:"image/ktx2",dds:"image/vnd.ms-dds"},R=[new f(y.supportedMIMETypes(),()=>new y),new f(["image/basis"],()=>new g("workers/basis/basis-worker.js")),new f(["image/ktx","image/ktx2"],()=>new g("workers/ktx/ktx-worker.js")),new f(["image/vnd.ms-dds"],()=>new g("workers/dds-worker.js"))],c=Symbol("wtt/WebTextureClient"),b=Symbol("wtt/WebTextureLoaders"),T=document.createElement("a"),H=typeof createImageBitmap!="undefined",w={extension:null,mipmaps:!0};function L(a,e){if(!e)throw new Error("A valid MIME type must be specified.");let t=a[b][e];t||(t=a[b]["*"]);let r=t.getLoader();if(!r)throw new Error(`Failed to get loader for MIME type "${e}"`);return r}var k=class{constructor(e){this[c]=e,this[b]={};for(let t of R)for(let r of t.mimeTypes)this[b][r]=t;this[b]["*"]=R[0]}async fromUrl(e,t){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");let r=Object.assign({},w,t);if(T.href=e,!r.mimeType){let s=T.pathname.lastIndexOf("."),i=s>-1?T.pathname.substring(s+1).toLowerCase():"*";r.mimeType=U[i]}return L(this,r.mimeType).fromUrl(this[c],T.href,r)}async fromBlob(e,t){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");let r=Object.assign({},w,t);return L(this,e.type).fromBlob(this[c],e,r)}async fromBuffer(e,t){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");let r=Object.assign({},w,t);if(!r.mimeType&&r.filename){let s=r.filename.lastIndexOf("."),i=s>-1?r.filename.substring(s+1).toLowerCase():null;r.mimeType=U[i]}return L(this,r.mimeType).fromBuffer(this[c],e,r)}async fromElement(e,t){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");let r=Object.assign({},w,t);if(!H)return this[c].textureFromImageElement(e,"rgba8unorm",r.mipmaps);let o=await createImageBitmap(e);return this[c].fromImageBitmap(o,"rgba8unorm",r.mipmaps)}async fromImageBitmap(e,t){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");let r=Object.assign({},w,t);return this[c].fromImageBitmap(e,"rgba8unorm",r.mipmaps)}fromColor(e,t,r,o=1,s="rgba8unorm"){if(!this[c])throw new Error("Cannot create new textures after object has been destroyed.");if(s!="rgba8unorm"&&s!="rgba8unorm-srgb")throw new Error('createTextureFromColor only supports "rgba8unorm" and "rgba8unorm-srgb" formats');let i=new Uint8Array([e*255,t*255,r*255,o*255]);return this[c].fromTextureData(new P(s,1,1,i),!1)}set allowCompressedFormats(e){this[c].allowCompressedFormats=!!e}get allowCompressedFormats(){return this[c].allowCompressedFormats}destroy(){this[c]&&(this[c].destroy(),this[c]=null)}};var I=class{constructor(e){this.device=e,this.sampler=e.createSampler({minFilter:"linear"}),this.pipelines={}}getMipmapPipeline(e){let t=this.pipelines[e];return t||((!this.mipmapVertexShaderModule||!this.mipmapFragmentShaderModule)&&(this.mipmapVertexShaderModule=this.device.createShaderModule({code:`
            var<private> pos : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
              vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0),
              vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0));
            var<private> tex : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
              vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0),
              vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 1.0));

            [[builtin(position)]] var<out> outPosition : vec4<f32>;
            [[builtin(vertex_index)]] var<in> vertexIndex : i32;

            [[location(0)]] var<out> vTex : vec2<f32>;

            [[stage(vertex)]]
            fn main() -> void {
              vTex = tex[vertexIndex];
              outPosition = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
              return;
            }
          `}),this.mipmapFragmentShaderModule=this.device.createShaderModule({code:`
            [[binding(0), group(0)]] var<uniform_constant> imgSampler : sampler;
            [[binding(1), group(0)]] var<uniform_constant> img : texture_2d<f32>;

            [[location(0)]] var<in> vTex : vec2<f32>;
            [[location(0)]] var<out> outColor : vec4<f32>;

            [[stage(fragment)]]
            fn main() -> void {
              outColor = textureSample(img, imgSampler, vTex);
              return;
            }
          `})),t=this.device.createRenderPipeline({vertexStage:{module:this.mipmapVertexShaderModule,entryPoint:"main"},fragmentStage:{module:this.mipmapFragmentShaderModule,entryPoint:"main"},primitiveTopology:"triangle-strip",vertexState:{indexFormat:"uint32"},colorStates:[{format:e}]}),this.pipelines[e]=t),t}generateMipmap(e,t){let r=this.getMipmapPipeline(t.format);if(t.dimension=="3d"||t.dimension=="1d")throw new Error("Generating mipmaps for non-2d textures is currently unsupported!");let o=e,s=t.size.depth||1,i=t.usage&GPUTextureUsage.RENDER_ATTACHMENT;if(!i){let m={size:{width:Math.ceil(t.size.width/2),height:Math.ceil(t.size.height/2),depthOrArrayLayers:s},format:t.format,usage:GPUTextureUsage.COPY_SRC|GPUTextureUsage.SAMPLED|GPUTextureUsage.RENDER_ATTACHMENT,mipLevelCount:t.mipLevelCount-1};o=this.device.createTexture(m)}let n=this.device.createCommandEncoder({}),d=r.getBindGroupLayout(0);for(let m=0;m<s;++m){let h=e.createView({baseMipLevel:0,mipLevelCount:1,dimension:"2d",baseArrayLayer:m,arrayLayerCount:1}),p=i?1:0;for(let B=1;B<t.mipLevelCount;++B){let S=o.createView({baseMipLevel:p++,mipLevelCount:1,dimension:"2d",baseArrayLayer:m,arrayLayerCount:1}),x=n.beginRenderPass({colorAttachments:[{attachment:S,loadValue:[0,0,0,0]}]}),N=this.device.createBindGroup({layout:d,entries:[{binding:0,resource:this.sampler},{binding:1,resource:h}]});x.setPipeline(r),x.setBindGroup(0,N),x.draw(4,1,0,0),x.endPass(),h=S}}if(!i){let m={width:Math.ceil(t.size.width/2),height:Math.ceil(t.size.height/2),depthOrArrayLayers:s};for(let h=1;h<t.mipLevelCount-1;++h)n.copyTextureToTexture({texture:o,mipLevel:h-1},{texture:e,mipLevel:h},m),m.width=Math.ceil(m.width/2),m.height=Math.ceil(m.height/2)}return this.device.queue.submit([n.finish()]),i||o.destroy(),e}};var Y=typeof createImageBitmap!="undefined",$={"texture-compression-bc":["bc1-rgba-unorm","bc2-rgba-unorm","bc3-rgba-unorm","bc7-rgba-unorm"],textureCompressionBC:["bc1-rgba-unorm","bc2-rgba-unorm","bc3-rgba-unorm","bc7-rgba-unorm"]};function j(a,e){return Math.floor(Math.log2(Math.max(a,e)))+1}var O=class extends k{constructor(e,t){super(new A(e),t)}},A=class{constructor(e){this.device=e,this.allowCompressedFormats=!0,this.uncompressedFormatList=["rgba8unorm","rgba8unorm-srgb","bgra8unorm","bgra8unorm-srgb"],this.supportedFormatList=["rgba8unorm","rgba8unorm-srgb","bgra8unorm","bgra8unorm-srgb"];let t=e.features||e.extensions;for(let r of t){let o=$[r];o&&this.supportedFormatList.push(...o)}this.mipmapGenerator=new I(e)}supportedFormats(){return this.allowCompressedFormats?this.supportedFormatList:this.uncompressedFormatList}async fromImageBitmap(e,t,r){if(!this.device)throw new Error("Cannot create new textures after object has been destroyed.");let o=r?j(e.width,e.height):1,s=GPUTextureUsage.COPY_DST|GPUTextureUsage.SAMPLED,i={size:{width:e.width,height:e.height},format:t,usage:s,mipLevelCount:o},n=this.device.createTexture(i);return this.device.queue.copyImageBitmapToTexture({imageBitmap:e},{texture:n},i.size),r&&this.mipmapGenerator.generateMipmap(n,i),new v(n,{width:e.width,height:e.height,mipLevels:o,format:t})}async fromImageElement(e,t,r){if(!this.device)throw new Error("Cannot create new textures after object has been destroyed.");if(!Y)throw new Error("Must support ImageBitmap to use WebGPU. (How did you even get to this error?)");let o=await createImageBitmap(e);return this.textureFromImageBitmap(o,t,r)}fromTextureData(e,t){if(!this.device)throw new Error("Cannot create new textures after object has been destroyed.");let r=G[e.format];if(!r)throw new Error(`Unknown format "${e.format}"`);let o=r.compressed||{blockBytes:4,blockWidth:1,blockHeight:1};t=t&&r.canGenerateMipmaps;let s=e.levels.length>1?e.levels.length:t?j(e.width,e.height):1,i=GPUTextureUsage.COPY_DST|GPUTextureUsage.SAMPLED,n={size:{width:Math.ceil(e.width/o.blockWidth)*o.blockWidth,height:Math.ceil(e.height/o.blockHeight)*o.blockHeight,depthOrArrayLayers:e.depth},format:e.format,usage:i,mipLevelCount:s},d=this.device.createTexture(n);for(let m of e.levels){let h=Math.ceil(m.width/o.blockWidth)*o.blockBytes;for(let p of m.slices)this.device.queue.writeTexture({texture:d,mipLevel:m.levelIndex,origin:{z:p.sliceIndex}},p.buffer,{offset:p.byteOffset,bytesPerRow:h},{width:Math.ceil(m.width/o.blockWidth)*o.blockWidth,height:Math.ceil(m.height/o.blockHeight)*o.blockHeight})}return t&&this.mipmapGenerator.generateMipmap(d,n),new v(d,{width:e.width,height:e.height,depth:e.depth,mipLevels:s,format:e.format,type:e.type})}destroy(){this.device=null}};export{O as WebGPUTextureLoader};
//# sourceMappingURL=webgpu-texture-loader.js.map
