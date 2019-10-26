/*! */
W.define("GlParticlesClass",["GlObj","glShaders","store","broadcast","render"],function(l,e,u,t,i){return L.CanvasLayer.extend({_canvas:null,glo:new l,failed:!1,ratioScale:1,needUpdateParams:!1,alpha:0,needClear:!0,bcastRedrawLayersId:-1,isOk:function(){return 0===this.errorCount},reinitParticleType:function(t){"wind"===t?this.prepareAlphaLUT(.2,.9,.3,.8):"waves"===t?this.prepareAlphaLUT(.7,1.2,.3,1.4):"currents"===t&&this.prepareAlphaLUT(.2,1.2,.3,1.4),this.particlesIdentLast=t},createGlStuff:function(t){this.resetGlStuff();this.errorCount=0;this.glo.create(t,{antialias:!1,depth:!1,stencil:!1,alpha:!0,premultipliedAlpha:!0,preserveDrawingBuffer:!1},"GlParticlesContext")?this.initParamsAndShaders():++this.errorCount},resetGlStuff:function(){this.vertexBuffer=null,this.indexBuffer=null,this.lastClientWidth=0,this.lastClientHeight=0,this.backTexture=null,this.backTextureWidth=0,this.backTextureHeight=0,this.textureState0=null,this.textureState1=null,this.stateRandBlocks=null},initParamsAndShaders:function(){var t=this.glo;this.stateBlocksCount=16,this.blockTimeSegmentSize=8,this.totalTimeFrames=this.stateBlocksCount*this.blockTimeSegmentSize,this.stateResX=256,this.stateResY=256,this.lastTimeS=0,this.frames60timer=0,this.frames60=0,this.frameCounter=0,this.frameCounter60=0,this.blockTimeSegment=0,this.framebuffer=t.createFramebuffer(),this.shWindParticleDraw=this.compileShader(e.shParticleDrawVS,e.shParticleDrawFS,[],"WindParticleDraw"),this.shWaveParticleDraw=this.compileShader(e.shParticleDrawVS,e.shParticleDrawFS,["WAVES"],"WaveParticleDraw"),this.shScreen=this.compileShader(e.shScreenVS,e.shScreenFS,[],"Screen"),this.shCopy=this.compileShader(e.shScreenVS,e.shCopyFS,[],"Copy"),this.shParticleUpdate=this.compileShader(e.shScreenVS,e.shParticleUpdateFS,[],"ParticleUpdate"),this.vertexBufferRect=t.createBuffer(new Float32Array([-1,-1,1,-1,1,1,-1,1])),this.initParticleDataStructures(this.stateResX,this.stateResY),this.windTexture=null},compileShader:function(t,e,i,a){var r;try{r=this.glo.createProgramObj(t,e,i,a)}catch(t){0,window.wError("GlParticles","Unable to create programObj",t),++this.errorCount,r=null}return r},checkSizesAndReinit:function(){var t=this.glo;if(t&&t.gl&&t.canvas){var e=t.get(),i=t.getCanvas();if(this.lastClientWidth!==i.width||this.lastClientHeight!==i.height){this.lastClientWidth=i.width,this.lastClientHeight=i.height;var a=Math.min(e.getParameter(e.MAX_TEXTURE_SIZE),2048),r=1.5<this.ratioScale?.8:1,s=Math.min(l.getNextPowerOf2Size(r*this.lastClientWidth),a),n=Math.min(l.getNextPowerOf2Size(r*this.lastClientHeight),a);if(this.backTextureWidth!==s||this.backTextureHeight!==n){this.backTextureWidth=s,this.backTextureHeight=n;var o=new Uint8Array(this.backTextureWidth*this.backTextureHeight*4);this.backTexture=t.createTexture2D(e.LINEAR,e.LINEAR,e.REPEAT,o,this.backTextureWidth,this.backTextureHeight)}}}},prepareAlphaLUT:function(t,e,i,a){this.alphaLut=new Float32Array(this.totalTimeFrames);var r,s,n=Math.round(t*this.totalTimeFrames),o=Math.round(i*this.totalTimeFrames);for(r=0;r<this.totalTimeFrames;r++)s=1,r<n?s=Math.pow(1*r/n,e):r>=this.totalTimeFrames-o&&(s=Math.pow(1*(this.totalTimeFrames-r)/o,a)),this.alphaLut[r]=s},initParticleDataStructures:function(t,e){var i,a,r,s,n,o=this.glo,l=o.get();this.particlesCount=t*e,this.vertsPerParticle=4,this.vertexStride=4,this.stateBlock=0,this.stateBlockDY=e/this.stateBlocksCount;var h=new Uint8Array(4*this.particlesCount);for(i=0;i<h.length;i++)h[i]=Math.floor(256*Math.random());this.textureState0=o.createTexture2D(l.NEAREST,l.NEAREST,l.REPEAT,h,t,e),this.textureState1=o.createTexture2D(l.NEAREST,l.NEAREST,l.REPEAT,h,t,e);var u=t*this.stateBlockDY*this.vertsPerParticle*this.vertexStride,c=new Uint8Array(u),d=[0,0,255,0,255,255,0,255];for(i=n=0;i<t;i++)for(a=0;a<this.stateBlockDY;a++)for(r=0;r<this.vertsPerParticle;r++)c[n++]=i,c[n++]=a,c[n++]=d[2*r],c[n++]=d[2*r+1];this.vertexBuffer=o.createBuffer(c);var m=[0,1,2,0,2,3];this.indsPerParticle=m.length,this.particlesPerBlock=t*this.stateBlockDY,this.indexCount=this.particlesPerBlock*this.indsPerParticle;var f=new Uint16Array(this.indexCount);for(i=s=a=0;i<this.indexCount;i++)f[i]=s+m[a],++a>=m.length&&(a=0,s+=this.vertsPerParticle);this.indexBuffer=o.createIndexBuffer(f)},reinitStateBlock:function(t){for(var e=this.glo,i=e.get(),a=this.stateBlockDY*t,r=this.stateResX*this.stateBlockDY*4,s=new Uint8Array(r),n=0;n<r;n++)s[n]=Math.floor(256*Math.random());e.bindTexture2D(this.textureState0),i.texSubImage2D(i.TEXTURE_2D,0,0,a,this.stateResX,this.stateBlockDY,i.RGBA,i.UNSIGNED_BYTE,s),e.bindTexture2D(this.textureState1),i.texSubImage2D(i.TEXTURE_2D,0,0,a,this.stateResX,this.stateBlockDY,i.RGBA,i.UNSIGNED_BYTE,s)},setGlobalAlpha:function(t){this.alpha=t},fadeOut:function(){var t=this.glo,e=t.get(),i=this.shScreen;e.useProgram(i.program),t.bindAttribute(this.vertexBufferRect,i.aPos,2,e.FLOAT,0,8,0),e.uniform4f(i.uVPars0,1,1,0,0),e.enable(e.BLEND);var a=this.fadeScale;e.blendColor(a,a,a,a),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ZERO,e.CONSTANT_ALPHA),e.drawArrays(e.TRIANGLE_FAN,0,4),e.disable(e.BLEND)},drawParticles:function(){var t=this.glo,e=t.get(),i=this.mapParams.partObj,a="waves"===this.mapParams.particlesIdent?this.shWaveParticleDraw:this.shWindParticleDraw;e.useProgram(a.program),t.bindAttribute(this.vertexBuffer,a.aVecA,4,e.UNSIGNED_BYTE,0,this.vertexStride,0),t.bindTexture2D(this.textureState0,0,a.sState0),t.bindTexture2D(this.textureState1,1,a.sState1);var r=this.transformParams.widthFactor+1,s=r/this.lastClientWidth,n=r/this.lastClientHeight,o=i.glParticleLengthEx/this.lastClientWidth,l=i.glParticleLengthEx/this.lastClientHeight;e.uniform4f(a.uVPars1,2*s/255,2*n/255,-s,-n),e.uniform4f(a.uVPars2,2*o/255,2*l/255,-o,-l);var h=Math.max(1,.8*this.transformParams.widthFactor);e.uniform4f(a.uVPars3,0,0,2*h/255,-h),e.uniform4f(a.uPars1,h,0,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.indexBuffer),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE_MINUS_DST_ALPHA,e.ONE);for(var u=Math.max(1,Math.min(Math.round(this.transformParams.relativeAmount*this.particlesPerBlock),this.particlesPerBlock))*this.indsPerParticle,c=1/this.stateBlocksCount,d=this.timeFrame0,m=0;m<this.stateBlocksCount;m++){e.uniform4f(a.uVPars0,1/this.stateResX,1/this.stateResY,0,m*c);var f=this.alphaLut[d];e.uniform4f(a.uPars0,f,f,f,f),e.drawElements(e.TRIANGLES,u,e.UNSIGNED_SHORT,0),(d-=this.blockTimeSegmentSize)<0&&(d+=this.totalTimeFrames)}e.disable(e.BLEND)},copyToCanvas:function(){var t=this.glo,e=t.get();t.bindFramebuffer(null),e.viewport(0,0,t.getCanvas().width,t.getCanvas().height),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE);var i,a=this.shCopy;if(e.useProgram(a.program),t.bindAttribute(this.vertexBufferRect,a.aPos,2,e.FLOAT,0,8,0),t.bindTexture2D(this.backTexture,0,a.sTex0),e.uniform4f(a.uVPars0,1,1,0,0),e.uniform4f(a.uVPars1,1,1,0,0),12<=this.mapParams.zoom)i=[.5,0,.4,this.transformParams.mulAZoomed];else{var r=.4*this.transformParams.mulRGB;i=[r,r,r,.4*this.transformParams.mulA]}for(var s=0;s<4;s++)i[s]*=this.alpha;e.uniform4fv(a.uPars0,i);e.uniform4fv(a.uPars1,[-.1,-.1,-.1,-.1]),e.drawArrays(e.TRIANGLE_FAN,0,4),e.disable(e.BLEND)},updateParticles:function(t){var e=this.glo,i=e.get();e.bindFramebuffer(this.framebuffer,this.textureState1),i.viewport(0,0,this.stateResX,this.stateResY);var a=this.shParticleUpdate;i.useProgram(a.program),e.bindAttribute(this.vertexBufferRect,a.aPos,2,i.FLOAT,0,8,0),e.bindTexture2D(this.textureState0,0,a.sState),e.bindTexture2D(this.windTexture,3,a.sWind);var r=Math.min(Math.floor(256*this.transformParams.relativeAmount+1),256)/256;i.uniform4f(a.uVPars0,r,1,r-1,0),i.uniform4f(a.uVPars1,r,1,0,0),i.uniform4f(a.uPars0,this.windTextureMulX,-this.windTextureMulY,this.windTextureAddX,this.windTextureMulY+this.windTextureAddY);var s=this.frameTime*this.transformParams.timeScale,n=s/this.lastClientWidth,o=s/this.lastClientHeight;i.uniform4f(a.uPars1,2*n,2*o,-n,-o),i.drawArrays(i.TRIANGLE_FAN,0,4),e.bindFramebuffer(null),0<=t&&this.reinitStateBlock(t);var l=this.textureState0;this.textureState0=this.textureState1,this.textureState1=l},updateFrame:function(){if(this.frameCounter60++,this.frameCounter60%2==0){var t=this.glo,e=t.get(),i=.001*Date.now();if(this.frameTime=Math.min(i-this.lastTimeS,.1),this.lastTimeS=i,this.frames60timer+=this.frameTime,this.frames60=Math.max(1,Math.round(60*this.frames60timer)),this.frames60timer-=.0166667*this.frames60,this.windTexture&&this.transformParams){var a=-1;this.timeFrame0=this.stateBlock*this.blockTimeSegmentSize,this.blockTimeSegment+=this.frames60,this.blockTimeSegment>=this.blockTimeSegmentSize&&(this.blockTimeSegment-=this.blockTimeSegmentSize,a=this.stateBlock,++this.stateBlock>=this.stateBlocksCount&&(this.stateBlock=0)),this.timeFrame0=(this.stateBlock-1)*this.blockTimeSegmentSize,this.timeFrame0+=this.blockTimeSegment,this.timeFrame0<0&&(this.timeFrame0+=this.totalTimeFrames),this.needUpdateParams&&(this.updateParamsFromConfig(),this.needUpdateParams=!1),this.relParticleShiftX=this.shiftX/this.lastClientWidth,this.relParticleShiftY=this.shiftY/this.lastClientHeight,t.bindFramebuffer(this.framebuffer,this.backTexture),e.viewport(0,0,this.backTextureWidth,this.backTextureHeight),this.needClear&&(e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),this.needClear=!1,this.animationStopped&&this.copyToCanvas()),this.animationStopped||(this.drawParticles(),this.fadeOut(),this.copyToCanvas(),this.updateParticles(a),this.alpha<1&&(this.alpha+=1.8*this.frameTime,1<this.alpha&&(this.alpha=1)),this.frameCounter++,this.showCanvas(!0))}}},setNewWindData:function(t){this.reset(),this.transformParams=t.transformParams,this.mapParams=t.mapParams;var e=this.glo,i=e.get(),a=i.LUMINANCE_ALPHA;if(this.windTextureResX=t.sizeX,this.windTextureResY=t.sizeY,this.windTexture?(e.bindTexture2D(this.windTexture),i.texImage2D(i.TEXTURE_2D,0,a,this.windTextureResX,this.windTextureResY,0,a,i.UNSIGNED_BYTE,null)):this.windTexture=e.createTexture2D(i.LINEAR,i.LINEAR,i.CLAMP_TO_EDGE,null,this.windTextureResX,this.windTextureResY,a),t.textureTiles){var r=t.textureTiles,s=t.textureTilesPos,n=r.length;e.bindTexture2D(this.windTexture);for(var o=0;o<n;o++){var l=r[o],h=s[o];i.texSubImage2D(i.TEXTURE_2D,0,h.x,h.y,l.tileSize,l.tileSize,a,i.UNSIGNED_BYTE,l.data)}}this.newWindData=null;var u=this.transformParams;this.windTextureMulX=1*u.relativeDX*u.width/(u.tilesDX*u.trans),this.windTextureMulY=1*u.relativeDY*u.height/(u.tilesDY*u.trans),this.windTextureAddX=u.offsetX/(this.windTextureResX*u.trans)+.48/this.windTextureResX,this.windTextureAddY=u.offsetY/(this.windTextureResY*u.trans)+.48/this.windTextureResY,this.needUpdateParams=!0},updateParamsFromConfig:function(){var t=this.transformParams,e=this.mapParams,i=u.get("particles");if(t&&e){var a,r,s,n=e.partObj;e.particlesIdent!==this.particlesIdentLast&&this.reinitParticleType(e.particlesIdent),s=n.configurable?(a=i.velocity||1,r=i.opacity||1,i.blending||1):(a=n.glVelocity,r=n.glOpacity,n.glBlending);var o=n.getAmount.call(n,e),l=n.getAmountMultiplier.call(n);t.relativeAmount=o/65536,l<1&&(t.relativeAmount*=1+7*(1-l)),t.relativeAmount*=n.glCountMul,t.widthFactor=Math.max(1,n.getLineWidth.call(n,e)*n.glParticleWidth*this.ratioScale),t.timeScale=a*n.glSpeedPx*t.zoomWindFactor*this.ratioScale,t.mulRGB=.7*r+.4,t.mulA=r,t.mulAZoomed=.44*r+.3,1<t.mulA&&(t.mulA=2-t.mulA),t.mulA+=.1;var h=s-.92;this.fadeScale=Math.min(.9+.5*h,.98)}},onInit:function(){this.errorCount=0},onCreateCanvas:function(){this.bcastRedrawLayersId=t.on("redrawLayers",function(){this.needUpdateParams=!0}.bind(this));try{this.createGlStuff(this.getCanvas()),this.checkSizesAndReinit()}catch(t){0,window.wError("GlParticles","unspecified error in createGlStuff",t),++this.errorCount}return this.isOk()},onCanvasFailed:function(){this.glo.release(),i.emit("glParticlesFailed")},onRemoveCanvas:function(){this.glo.release(),this.resetGlStuff(),-1!==this.bcastRedrawLayersId&&(t.off(this.bcastRedrawLayersId),this.bcastRedrawLayersId=-1)},onResizeCanvas:function(t,e){var i=Math.min(window.devicePixelRatio||1,2),a=this.getCanvas();(1200<t||1200<e)&&(i=Math.min(i,1.5)),this.ratioScale=i,a.width=t*i,a.height=e*i,a.style.width=t+"px",a.style.height=e+"px",this.checkSizesAndReinit()},onReset:function(){this.alpha=0,this.needClear=!0,this.showCanvas(!1)}})}),
/*! */
W.define("glAnimation",["store"],function(t){var e,i=null,a=!1,r="off"===t.get("particlesAnim"),s=!1;function n(){e._canvas.style.opacity=0,e.animationStopped=!0,e.needClear=!0,e.updateFrame()}function o(){e._canvas.style.opacity=1,e.animationStopped=!1,e.needClear=!0}function l(){cancelAnimationFrame(i)}function h(){i=requestAnimationFrame(h),e.updateFrame()}function u(){cancelAnimationFrame(i),r||(o(),s||h())}return{init:function(t){e=t},suspend:function(){a=!0,l(),n()},enable:function(){a=!1,u()},run:u,stop:l,pause:function(){s=!0,l()},resume:function(){s=!1,u()},toggle:function(t){"off"===t?(l(),n(),r=!0):r&&(o(),r=!1,a||u())}}}),
/*! */
W.define("glShaders",[],function(){return{shScreenVS:"\n\tattribute vec2 aPos;\n\tuniform vec4 uVPars0;\n\tuniform vec4 uVPars1;\n\tvarying vec4 vTc0;\n\n\tvoid main(void) {\n\t\tgl_Position = vec4( aPos * uVPars0.xy + uVPars0.zw, 0.0, 1.0 );\n\t\tvec2 tc0 = aPos.xy * 0.5 + 0.5;\n\t\tvTc0 = vec4( tc0 * uVPars1.xy + uVPars1.zw, aPos.xy );\n\t}\n",shScreenFS:"\n\tprecision mediump float;\n\tuniform vec4 uPars0;\n\tvarying vec4 vTc0;\n\n\tvoid main(void) {\n\t\tgl_FragColor = uPars0;\n\t}\n",shCopyFS:"\n\tprecision mediump float;\n\n\tuniform vec4 uPars0; // mul color\n\tuniform vec4 uPars1; // add color\n\n\tuniform sampler2D sTex0;\n\n\tvarying vec4 vTc0;\n\n\tvoid main(void) {\n\t\tgl_FragColor = texture2D( sTex0, vTc0.xy ) * uPars0 + uPars1;\n\t}\n",shParticleDrawVS:"\n\tprecision mediump float;\n\n\tattribute vec4 aVecA; // xy ..position in state texture <0,255>; zw .. vertex position in particle flags\n\n\tuniform sampler2D sState0; // actual particle position\n\tuniform sampler2D sState1; // last position\n\n\tuniform vec4 uVPars0; // xy .. tc mul, zw ..tc add\n\tuniform vec4 uVPars1;\n\tuniform vec4 uVPars2;\n\tuniform vec4 uVPars3; // xy .. relative shift, zw..antialiasing MAD\n\n\tvarying vec4 vTc0;\n\n\tvoid main() {\n\t\tvec2 tc = aVecA.xy * uVPars0.xy + uVPars0.zw;\n\t\tvec4 tex0 = texture2D( sState0, tc );\n\t\tvec4 tex1 = texture2D( sState1, tc );\n\t\tvec2 posA = fract( tex0.ba + tex0.rg / 255.5 + uVPars3.xy ) * 2.0 - 1.0; // particle position in <-1.0,1.0> space\n\t\tvec2 posB = fract( tex1.ba + tex1.rg / 255.5 + uVPars3.xy ) * 2.0 - 1.0; // last particle position <-1.0,1.0> space\n\n\t\tvec2 dirF = posA - posB;\n\t\tvec2 dirFN = normalize( dirF ); // normalized forward direction ( from B to A )\n\t\tfloat d = length( dirF ); // d can be used for alpha from speed\n\t\tvec2 dirRN = vec2( dirFN.y, -dirFN.x ); // perpendicular direction (right from dirFN)\n\n\t\tvec2 pos = mix( posB, posA, aVecA.w * 0.003921569 ); // select posA or posB\n\t\tpos += dirRN * ( aVecA.zz * uVPars1.xy + uVPars1.zw ); // add width\n#ifdef WAVES\n\t\tpos += dirFN * ( aVecA.ww * uVPars2.xy + uVPars2.zw ); // add extra length\n\t\tif( d > 0.5 || d < 0.00005 ) {\n\t\t\tpos.x += 10.0; // bad particle! move away!\n\t\t}\n#else\n\t\tif( d > 0.5 ) {\n\t\t\tpos.x += 10.0;\n\t\t}\n#endif\n\t\tgl_Position = vec4( pos.xy, 0, 1 );\n\t\tvTc0.x = uVPars3.z * aVecA.z + uVPars3.w;\n\t}\n",shParticleDrawFS:"\n\tprecision mediump float;\n\tuniform vec4 uPars0;\n\tuniform vec4 uPars1;\n\n\tvarying vec4 vTc0;\n\n\tvoid main(void) {\n\t\tfloat aa = clamp( uPars1.x - abs( vTc0.r ), 0.0, 1.0 );\n\t\tgl_FragColor = uPars0 * vec4( aa );\n\t}\n",shParticleUpdateFS:"\n\tprecision mediump float; // highp\n\n\tuniform vec4 uPars0; // wind texture coords MAD\n\tuniform vec4 uPars1; // particle velocity params (computed per frame)\n\n\tuniform sampler2D sState; // last particle position\n\tuniform sampler2D sWind; // composited wind direction texture\n\n\tvarying vec4 vTc0;\n\n\tvoid main(void) {\n\t\tvec4 tex0 = texture2D( sState, vTc0.xy );\n\t\tvec2 pos = tex0.ba + tex0.rg / 255.5; // decode position from last state texture\n\t\tvec2 tc = fract( pos ) * uPars0.xy + uPars0.zw; // texture coordinates to wind vectors texture // pos + uPars2.xy\n\t\tvec2 dpos = texture2D( sWind, tc ).ra * uPars1.xy + uPars1.zw; // delta position from wind\n\t\tpos = fract( pos + dpos ); // new position and wrap in interval <0.0, 1.0)\n\t\t// output new position\n\t\tgl_FragColor.rg = fract( pos * 255.0 + 0.25 / 255.0 ); // encode lo bits\n\t\tgl_FragColor.ba = pos - gl_FragColor.rg / 255.0; // encode hi bits\n\t}\n"}}),
/*! */
W.define("glVectors",["render","glAnimation","particles","utils","GlObj","lruCache","DataTiler"],function(v,P,r,s,g,t,e){return e.instance({glCanvas:null,syncCounter:0,cancelRqstd:!1,latestParams:null,enabled:!0,tileSize:256,tileCache:new t(16),cancelTasks:function(){this.syncCounter++},tilesReady:function(t,e,i){s.include(e,i),e.partObj=r[i.particlesIdent];var a={width:this.width,height:this.height,offsetX:this.offsetX,offsetY:this.offsetY,trans:this.trans};this.processTiles(t,e,a)},redrawVectors:function(){this.mapMoved=!0,this.latestParams&&this.getTiles(this.latestParams)},init:function(t,e){this.glCanvas=t,this.latestParams=s.clone(e),this.redrawVectors()},paramsChanged:function(t){this.latestParams&&this.latestParams.fullPath===t.fullPath&&this.latestParams.overlay===t.overlay?v.emit("rendered","particles"):(this.latestParams=s.clone(t),this.getTiles(this.latestParams))},getTexture:function(t,e){var i=e.partObj,a=this.tileSize*this.tileSize*2,r=new Uint8ClampedArray(a),s=t.data,n=i.level2reduce[e.level]/i.glMaxSpeedParam,o=n*i.glMinSpeedParam,l=o*o,h=e.JPGtransparency,u=8224,c=128,d=0,m=.5*i.glSpeedCurvePowParam;if(h)for(var f=0;f<256;f++){for(var p=0;p<256;p++){if(s[u+2]>c)r[d++]=c,r[d++]=c;else{var v=t.decodeR(s[u])*n,P=t.decodeG(s[u+1])*n,g=v*v+P*P;if(l<g){var x=c*Math.pow(g,m)/Math.sqrt(g);v*=x,P*=x}else if(1e-6<g){var S=c*o/Math.sqrt(g);v*=S,P*=S}else P=v=0;r[d++]=c+Math.round(v),r[d++]=c+Math.round(P)}u+=4}u+=4}else for(var T=0;T<256;T++){for(var w=0;w<256;w++){if(s[u+3]<c)r[d++]=c,r[d++]=c;else{var b=t.decodeR(s[u])*n,A=t.decodeG(s[u+1])*n,C=b*b+A*A;if(l<C){var D=c*Math.pow(C,m)/Math.sqrt(C);b*=D,A*=D}else if(1e-6<C){var y=c*o/Math.sqrt(C);b*=y,A*=y}else A=b=0;r[d++]=c+Math.round(b),r[d++]=c+Math.round(A)}u+=4}u+=4}return{url:t.url,tileSize:this.tileSize,data:new Uint8Array(r)}},processTiles:function(t,e,i){var a=t.length,r=a?t[0].length:0;if(0!==a&&0!==a){for(var s=e.partObj.zoom2speed[e.zoom],n=[],o=[],l=0;l<a;l++)for(var h=0;h<r;h++){var u=t[l][h];if(u){var c=this.tileCache.get(u.url,null);c||(c=this.getTexture(u,e),this.tileCache.put(u.url,c)),n.push(c),o.push({x:h*this.tileSize,y:l*this.tileSize})}}if(1===n.length){var d=n[0],m=o[0];n.push({url:d.url,tileSize:d.tileSize,data:d.data}),o.push({x:m.x+d.tileSize,y:m.y}),r++}var f=g.getNextPowerOf2Size(r)*this.tileSize,p=g.getNextPowerOf2Size(a)*this.tileSize;i.tilesDX=r*this.tileSize,i.tilesDY=a*this.tileSize,i.relativeDX=1*r*this.tileSize/f,i.relativeDY=1*a*this.tileSize/p,i.zoomWindFactor=s,this.glCanvas&&(this.glCanvas.setNewWindData({sizeX:f,sizeY:p,textureTiles:n,textureTilesPos:o,transformParams:i,mapParams:e}),P.run()),v.emit("rendered","particles")}}})}),
/*! */
W.define("gl-particles",["glVectors","glAnimation","broadcast","storage","rootScope","map","store","GlParticlesClass"],function(e,i,a,r,s,n,o,t){var l=new t({disableAutoReset:!0});i.init(l);var h=function(t){return t?e.redrawVectors.call(e):e.cancelTasks.call(e)};return{open:function(t){return l.addTo(n),l.failed?(r.put("webGLtest3",{status:"initFailed",ua:window.navigator.userAgent}),a.emit("log","particles/status/initFailed"),!1):(s.glParticlesOn=!0,l.getCanvas().classList.add("particles-layer"),n.on("moveend",e.redrawVectors,e),n.on("movestart",e.cancelTasks,e),n.on("zoomstart",i.pause),n.on("zoomend",i.resume),o.on("particlesAnim",i.toggle),o.on("visibility",h),i.enable(),e.init(l,t),!0)},close:function(){i.suspend(),o.off("particlesAnim",i.toggle),o.off("visibility",h),n.off("moveend",e.redrawVectors,e),n.off("movestart",e.cancelTasks,e),n.off("zoomstart",i.pause),n.off("zoomend",i.resume),n.removeLayer(l)},redraw:e.redrawVectors.bind(e),paramsChanged:e.paramsChanged.bind(e)}});