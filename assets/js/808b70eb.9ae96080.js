"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[717],{3023:(e,n,s)=>{s.d(n,{R:()=>i,x:()=>d});var c=s(3696);const r={},l=c.createContext(r);function i(e){const n=c.useContext(l);return c.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),c.createElement(l.Provider,{value:n},e.children)}},5447:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>t,contentTitle:()=>d,default:()=>h,frontMatter:()=>i,metadata:()=>c,toc:()=>a});const c=JSON.parse('{"id":"API Reference/core/classes/Scene","title":"Scene","description":"@palco-2d/core / Scene","source":"@site/docs/API Reference/core/classes/Scene.md","sourceDirName":"API Reference/core/classes","slug":"/API Reference/core/classes/Scene","permalink":"/Palco2D/docs/API Reference/core/classes/Scene","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"SVGImageEntity","permalink":"/Palco2D/docs/API Reference/core/classes/SVGImageEntity"},"next":{"title":"SceneHandler","permalink":"/Palco2D/docs/API Reference/core/classes/SceneHandler"}}');var r=s(2540),l=s(3023);const i={},d="Class: Scene",t={},a=[{value:"Constructors",id:"constructors",level:2},{value:"new Scene()",id:"new-scene",level:3},{value:"Returns",id:"returns",level:4},{value:"Properties",id:"properties",level:2},{value:"canvas",id:"canvas",level:3},{value:"ctx",id:"ctx",level:3},{value:"mouseHandler",id:"mousehandler",level:3},{value:"render",id:"render",level:3},{value:"Methods",id:"methods",level:2},{value:"addPlugin()",id:"addplugin",level:3},{value:"Parameters",id:"parameters",level:4},{value:"plugin",id:"plugin",level:5},{value:"key",id:"key",level:5},{value:"Returns",id:"returns-1",level:4},{value:"getPlugin()",id:"getplugin",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"key",id:"key-1",level:5},{value:"Returns",id:"returns-2",level:4},{value:"pause()",id:"pause",level:3},{value:"Returns",id:"returns-3",level:4},{value:"removePlugin()",id:"removeplugin",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"key",id:"key-2",level:5},{value:"Returns",id:"returns-4",level:4},{value:"start()",id:"start",level:3},{value:"Returns",id:"returns-5",level:4},{value:"startAllPlugins()",id:"startallplugins",level:3},{value:"Returns",id:"returns-6",level:4},{value:"stop()",id:"stop",level:3},{value:"Returns",id:"returns-7",level:4}];function o(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",...(0,l.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/",children:"@palco-2d/core"})," / Scene"]}),"\n",(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"class-scene",children:"Class: Scene"})}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L12",children:"src/SceneHandler/Scene.ts:12"})]}),"\n",(0,r.jsx)(n.p,{children:"The Scene class serves as the core component of Palco 2D, providing the foundation for creating and managing 2D scenes.\nIt integrates a renderer and mouse handler to enable visual rendering and interactive functionality,\nalong with additional abstractions"}),"\n",(0,r.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,r.jsx)(n.h3,{id:"new-scene",children:"new Scene()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"new Scene"}),"(): ",(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/Scene",children:(0,r.jsx)(n.code,{children:"Scene"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L37",children:"src/SceneHandler/Scene.ts:37"})]}),"\n",(0,r.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/Scene",children:(0,r.jsx)(n.code,{children:"Scene"})})}),"\n",(0,r.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(n.h3,{id:"canvas",children:"canvas"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"canvas"}),": ",(0,r.jsx)(n.code,{children:"HTMLCanvasElement"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L16",children:"src/SceneHandler/Scene.ts:16"})]}),"\n",(0,r.jsx)(n.p,{children:"The HTML canvas element the scene renders to."}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"ctx",children:"ctx"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"ctx"}),": ",(0,r.jsx)(n.code,{children:"CanvasRenderingContext2D"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L20",children:"src/SceneHandler/Scene.ts:20"})]}),"\n",(0,r.jsx)(n.p,{children:"The 2D rendering context of the canvas."}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"mousehandler",children:"mouseHandler"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"mouseHandler"}),": ",(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/MouseHandler",children:(0,r.jsx)(n.code,{children:"MouseHandler"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L30",children:"src/SceneHandler/Scene.ts:30"})]}),"\n",(0,r.jsx)(n.p,{children:"Handles mouse interactions within the scene,\ndetecting when the cursor hovers over an entity and dispatching relevant mouse events to subscribed entities."}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"render",children:"render"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"render"}),": ",(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/RenderHandler",children:(0,r.jsx)(n.code,{children:"RenderHandler"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L25",children:"src/SceneHandler/Scene.ts:25"})]}),"\n",(0,r.jsx)(n.p,{children:"The rendering handler for the scene.\nResponsible for rendering entities and plugins to the canvas."}),"\n",(0,r.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,r.jsx)(n.h3,{id:"addplugin",children:"addPlugin()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"addPlugin"}),"(",(0,r.jsx)(n.code,{children:"plugin"}),", ",(0,r.jsx)(n.code,{children:"key"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L91",children:"src/SceneHandler/Scene.ts:91"})]}),"\n",(0,r.jsx)(n.p,{children:"add the plugin to the scene, to run the custom logic of the plugin, the plugin must be started."}),"\n",(0,r.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsx)(n.h5,{id:"plugin",children:"plugin"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/ScenePlugin",children:(0,r.jsx)(n.code,{children:"ScenePlugin"})})}),"\n",(0,r.jsx)(n.p,{children:"The plugin to add to the scene."}),"\n",(0,r.jsx)(n.h5,{id:"key",children:"key"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"getplugin",children:"getPlugin()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"getPlugin"}),"(",(0,r.jsx)(n.code,{children:"key"}),"): ",(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/ScenePlugin",children:(0,r.jsx)(n.code,{children:"ScenePlugin"})})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L119",children:"src/SceneHandler/Scene.ts:119"})]}),"\n",(0,r.jsx)(n.p,{children:"Returns the plugin with the given key."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n",(0,r.jsx)(n.h5,{id:"key-1",children:"key"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.p,{children:"The key of the plugin to retrieve."}),"\n",(0,r.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.a,{href:"/Palco2D/docs/API%20Reference/core/classes/ScenePlugin",children:(0,r.jsx)(n.code,{children:"ScenePlugin"})})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"pause",children:"pause()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"pause"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L81",children:"src/SceneHandler/Scene.ts:81"})]}),"\n",(0,r.jsx)(n.p,{children:"Pauses the render and mouse handler, without terminating the scene instance or entities.\nStops rendering and calculating any interatction but keep the scene and entities alive, so\non start, a re-creation of the scene is not needed."}),"\n",(0,r.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"removeplugin",children:"removePlugin()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"removePlugin"}),"(",(0,r.jsx)(n.code,{children:"key"}),"): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L104",children:"src/SceneHandler/Scene.ts:104"})]}),"\n",(0,r.jsx)(n.p,{children:"Removes the plugin from the scene."}),"\n",(0,r.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n",(0,r.jsx)(n.h5,{id:"key-2",children:"key"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"string"})}),"\n",(0,r.jsx)(n.p,{children:"The key of the plugin to remove.\non removing, the custom logic of the plugin will be stopped."}),"\n",(0,r.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"start",children:"start()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"start"}),"(): ",(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L55",children:"src/SceneHandler/Scene.ts:55"})]}),"\n",(0,r.jsx)(n.p,{children:"Starts the custom scene logic, here you the code you create will be triggered,\nIt's the perfect place to create all the entities and plugins you need and add them\nto the scene."}),"\n",(0,r.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"Promise"}),"<",(0,r.jsx)(n.code,{children:"void"}),">"]}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"startallplugins",children:"startAllPlugins()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"startAllPlugins"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L127",children:"src/SceneHandler/Scene.ts:127"})]}),"\n",(0,r.jsx)(n.p,{children:"Starts the plugins added to the scene.\nAll Scene plugins start method will be called."}),"\n",(0,r.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})}),"\n",(0,r.jsx)(n.hr,{}),"\n",(0,r.jsx)(n.h3,{id:"stop",children:"stop()"}),"\n",(0,r.jsxs)(n.blockquote,{children:["\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"stop"}),"(): ",(0,r.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Defined in: ",(0,r.jsx)(n.a,{href:"https://github.com/IgorPieruccini/Palco2D/blob/8e276290d4884e641a2aca2ef0ff9fc73f3366b5/packages/core/src/SceneHandler/Scene.ts#L64",children:"src/SceneHandler/Scene.ts:64"})]}),"\n",(0,r.jsxs)(n.p,{children:["Stops render and mouse handler from running.\nIt also stops all the plugins added to the scene.\nWhen creating you custom scene, for best practices, you should call this method\n",(0,r.jsx)(n.code,{children:"super.stop()"})," before adding your custom logic, to ensure that the scene is properly stopped.\nit's the perfect place to remove any window listeners or clear any intervals that you might have created."]}),"\n",(0,r.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"void"})})]})}function h(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(o,{...e})}):o(e)}}}]);