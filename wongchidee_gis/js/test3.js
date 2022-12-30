require([
    "esri/Map",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Legend",
    "esri/layers/TileLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
"esri/layers/GroupLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/VectorTileLayer",
    "dojo/dom",
    "dojo/on",
    "dojo/domReady!",
"esri/WebScene",
        "esri/views/SceneView",
 "esri/renderers/UniqueValueRenderer",
    "esri/config",
    "esri/Basemap",
    "esri/core/watchUtils",
    "esri/PopupTemplate",
],(Map, WebMap,mapview,Legend, TileLayer, FL, GeoJSONLayer, Graphic,GroupLayer,GraphicsLayer,
       VectorTileLayer,dom, on, domReady,WebScene, SceneView, UniqueValueRenderer,esriConfig, Basemap, watchUtils, PopupTemplate) => {
    esriConfig.apiKey = "AAPKd8b9057a61a24b738ad21d4ec6401ee6q9_Kkpwk5p-vCs85zsCvv1dLorKqBenU7xKvppuC2E8aZRjR74FJOYG6nOGFmxxZ";
 const switchButton = document.getElementById("switch-btn");
        const appConfig = {
          mapview: null,
          SceneView: null,
          activeView: null,
          container: "viewDiv" // 存放视图器的div容器id
        };

    
    
    
    //左侧view视图初始的底图
    const map = new WebMap({
        basemap: {
            portalItem: {
              id: "f35ef07c9ed24020aadd65c8a65d3754" // modern antique vector tiles
            }
          }
    });
    const scene = new WebScene({
          portalItem: {
            // autocasts as new PortalItem()
            id: "a4b92ff2bdbb44c5969f97c0da00d911"
          }
        });
        //初始化地图层级和中心点 中心点在西安附近 div容器 就是 <div id="viewDiv"></div>
        const initialViewParams = {
          zoom: 3,
          center: [109, 39],
          container: appConfig.container
        };
        // 创建二维视图器，并设置为当前视图器
        appConfig.mapview = createView(initialViewParams, "2d");
        appConfig.mapview.map = map;
        appConfig.activeView = appConfig.mapview;
 
        // 创建三维视图器 但是不要初始化视图器的容器
        initialViewParams.container = null;
        initialViewParams.map = scene;
        appConfig.SceneView = createView(initialViewParams, "3d");
 
        // switch the view between 2D and 3D each time the button is clicked
        switchButton.addEventListener("click", () => {
          switchView();
            
           const options = {
          profile: "quad",
          cap: "round",
          join: "miter",
          width: 5,
          height: 30,
          color: [200, 200, 200],
          profileRotation: "all"
        };

        /* The colors used for the each transit line */
        const colors = {
          '地铁1号线_buslines': [237, 81, 81],
          '地铁2号线_buslines': [20, 158, 206],
          '地铁3号线_buslines': [167,98,54],
          '地铁4号线_buslines': [158, 85, 156],
          '地铁5号线_buslines': [252,146,31],
          '地铁6号线_buslines': [255, 222, 62],
          '地铁7号线_buslines': [247,137,216],
          '地铁8号线_buslines': "#b7814a",
          '地铁10号线_buslines': "#3caf99",
          '地铁9号线_buslines': "#6b6bd6",
          '地铁11号线_buslines': "#149ece",
          '地铁12号线_buslines': "#ed5151",
          '地铁13号线_buslines': "#b54779",
          '地铁14号线_buslines': [0, 170, 227],
          
        };

        /* Create layer with the transit lines */
        const transitLayer = new FL({
          url: "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/guangzhoumetro/FeatureServer/0",
          copyright:
            "Data from <a href='https://data.beta.grandlyon.com/en/datasets/lignes-metro-funiculaire-reseau-transports-commun-lyonnais/info'>Data Grand Lyon - Sytral</a>",
          elevationInfo: {
            mode: "relative-to-ground",
            offset: 10
          },
          title: "Transit lines in Lyon",
          
        });
        scene.add(transitLayer);

        /****************************************
         * Function that sets a renderer with a
         * unique path symbol for each transit line.
         * The path symbol uses the properties from
         * the options object, which are set everytime
         * the user modifies the settings in the menu.
         * **************************************/
        function renderTransitLayer() {
          const renderer = new UniqueValueRenderer({
            field: "layer"
          });

          for (let property in colors) {
            if (colors.hasOwnProperty(property)) {
              renderer.addUniqueValueInfo({
                value: property,
                symbol: {
                  type: "line-3d",
                  symbolLayers: [
                    {
                      type: "path",
                      profile: options.profile,
                      material: {
                        color: colors[property]
                      },
                      width: options.width,
                      height: options.height,
                      join: options.join,
                      cap: options.cap,
                      anchor: "bottom",
                      profileRotation: options.profileRotation
                    }
                  ]
                }
              });
            }
          }

          transitLayer.renderer = renderer;
        }

        renderTransitLayer();

        /*************************************************
         * The rest of the sample adds event listeners
         * on the input elements in the menu, to modify
         * the path properties in the options object and
         * rerender the layer.
         *************************************************/

        const styleSelect = document.getElementById("style");
        styleSelect.addEventListener("change", (event) => {
          const value = event.target.value;
          switch (value) {
            case "round-tube":
              options.profile = "circle";
              options.height = 30;
              options.width = 30;
              break;
            case "square-tube":
              options.profile = "quad";
              options.height = 30;
              options.width = 30;
              break;
            case "wall":
              options.profile = "quad";
              options.height = 30;
              options.width = 5;
              break;
            case "strip":
              options.profile = "quad";
              options.height = 5;
              options.width = 30;
              break;
          }
          renderTransitLayer();
        });

        const capSelect = document.getElementById("cap");
        capSelect.addEventListener("change", (event) => {
          options.cap = event.target.value;
          renderTransitLayer();
        });

        const joinSelect = document.getElementById("join");
        joinSelect.addEventListener("change", (event) => {
          options.join = event.target.value;
          renderTransitLayer();
        });

        const rotationSelect = document.getElementById("profileRotation");
        rotationSelect.addEventListener("change", (event) => {
          options.profileRotation = event.target.value;
          renderTransitLayer();
        });  
           
            
            
        });
 
        // 切换二三维视图方法
        function switchView() {
          const is3D = appConfig.activeView.type === "3d";
          //首先克隆当前视图器的视点信息 
          const activeViewpoint = appConfig.activeView.viewpoint.clone();
 
          // 把当前视图器的容易移除
          appConfig.activeView.container = null;
 
          if (is3D) {
            // if the input view is a SceneView, set the viewpoint on the
            // mapView instance. Set the container on the mapView and flag
            // it as the active view
            appConfig.mapview.viewpoint = activeViewpoint;
            appConfig.mapview.container = appConfig.container;
            appConfig.activeView = appConfig.mapview;
            switchButton.value = "3D";
              
              
              
              
              
              
              
              
              
              
              
              
          } else {
            appConfig.SceneView.viewpoint = activeViewpoint;
            appConfig.SceneView.container = appConfig.container;
            appConfig.activeView = appConfig.SceneView;
            switchButton.value = "2D";
              
          }
        }
 
        // 根据参数创建视图器
        function createView(params, type) {
          let view;
          if (type === "2d") {
            view = new mapview(params);
            return view;
          } else {
            view = new SceneView({
          
          map: scene,
          qualityProfile: "high",
          environment: {
            lighting: {
              directShadowsEnabled: true,
              ambientOcclusionEnabled: true
            },
            atmosphere: {
              quality: "high"
            }
          }
        });
           
          }
            
          return view;
        }
    
    
    
    
    
    
    
    
    const vtLayer = new VectorTileLayer({
          portalItem: {
            id: "2afe5b807fa74006be6363fd243ffb30" // gray vector tiles canvas
          }
        });
        const countries = new FL({
          portalItem: {
            id: "f13b57676e214477ac05614da707cfdb" // boundaries of countries
          }
        });
    const re = new FL({
          portalItem: {
            id: "f13b57676e214477ac05614da707cfdb" // boundaries of countries
          }
        });
     map.add(re);
    const groupLayer = new GroupLayer({
          layers: [vtLayer, countries],
          blendMode: "destination-over"
        });
        map.add(groupLayer);
    const view = new mapview({
        container: "viewDiv",
        map: map,
         zoom: 8,
          center: [114, 23],
          constraints: {
            snapToZoom: false,
            minScale: 147914381
          }
        
    });
    
    let layerView, animation;
        // countryGraphicsLayer is added to the view's basemap.
        // It will contain black polygon covering the extent of the world
        // the country graphic will also be added to this layer when user clicks a country.
        // With destination-in blend mode, the contents of background layer is
        // kept where it overlaps with top layer. Everything else is made transparent.
        // In this case, the countryGraphicsLayer will be displayed underneath
        // modern antique vector tiles basemap.
        // The bloom effect will add a glow around the selected country.
        const countryGraphicsLayer = new GraphicsLayer({
          blendMode: "destination-in",
          effect: "bloom(200%)"
        });
        map.loadAll().then(async () => {
          addWorld();
          map.basemap.baseLayers.getItemAt(1).blendMode = "multiply";
          // add the buffer graphicslayer to the basemap
          map.basemap.baseLayers.add(countryGraphicsLayer);
          // get a reference ot the countries featurelayer's layerview
          // layerview will be queried to get the intersecting country
          // when user clicks on the map
          layerView = await view.whenLayerView(countries);
        });
        view.ui.add("messageDiv", "top-right");
        const symbol = {
          type: "simple-fill",
          color: "white",
          outline: null
        };
     view.on("click", async (event) => {
          // query the countries featurelayer for a country that intersects the point
          // user clicked on
          const {
            features: [feature]
          } = await layerView.queryFeatures({
            geometry: view.toMap(event),
            returnGeometry: true,
            maxAllowableOffset: 1000,
            outFields: ["*"]
          });
          countryGraphicsLayer.graphics.removeAll();
          animation && animation.remove();
          let world = addWorld();
          // add the clicked country feature to the graphicslayer
          if (feature) {
            feature.symbol = symbol;
            countryGraphicsLayer.graphics.add(feature);
            // add a fade animation to show the highlight effect
            // for the selected country
            animation = fadeWorld(world);
            // zoom to the highlighted country
            view.goTo(
              {
                target: view.toMap(event),
                extent: feature.geometry.extent.clone().expand(1.8)
              },
              { duration: 1000 }
            );
          }
        });
        function addWorld(world) {
          world = new Graphic({
            geometry: {
              type: "extent",
              xmin: -180,
              xmax: 180,
              ymin: -90,
              ymax: 90
            },
            symbol: {
              type: "simple-fill",
              color: "rgba(0, 0, 0, 1)",
              outline: null
            }
          });
          countryGraphicsLayer.graphics.add(world);
          return world;
        }
    function fadeWorld(world) {
          let timer;
          // requestAnimationFrame method specifies "frame" function
          // to perform an animation where the opacity of the world polygon graphic
          // decreased by 0.1 until it is 0 or completely transparent
          // then the animation is cancelled
          function frame() {
            const symbol = world.symbol.clone();
            symbol.color.a = Math.max(0, symbol.color.a - 0.1);
            world.symbol = symbol;
            if (symbol.color.a > 0) {
              timer = requestAnimationFrame(frame);
            }
          }
          frame();
          return {
            remove() {
              cancelAnimationFrame(timer);
            }
          };
        }
    
    //右侧view2视图初始的底图
    const map2 = new Map({
        basemap: "arcgis-colored-pencil"
    });
    var view2 = new mapview({
        id: 'view2',
        container: 'view2Div',
        map: map2,
        zoom: 3,
        center: [114, 31],
        constraints: {
            // Disable zoom snapping to get the best synchonization
            snapToZoom: false
        }
    });

    //-----------------------------要求一：切换底图，可视化的形式。（可供切换的Basemaps）-----------------------------
    url1_ = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer";
    url2_ = "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer";
    url3_ = "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer";
    var Layer1 = new TileLayer({ url: url1_ });
    var Layer2 = new TileLayer({ url: url2_ });
    var Layer3 = new TileLayer({ url: url3_ });
    on(dom.byId("DeLorme_World"), "click", btn1);
    on(dom.byId("StreetPurplishBlue"), "click", btn2);
    on(dom.byId("ChinaOnlineStreetWarm"), "click", btn3);
    function btn1() { map.add(Layer1) }
    function btn2() { map.add(Layer2) }
    function btn3() { map.add(Layer3) }

    
    //---------------要求二：能够动态加载专题图层。可以显示图层的数量，控制图层的显示与关闭。能够删除图层。--------------
    //添加动物的图层
    const template = {
        // autocasts as new PopupTemplate()
        title: "name",
        content: [
            {
                // It is also possible to set the fieldInfos outside of the content
                // directly in the popupTemplate. If no fieldInfos is specifically set
                // in the content, it defaults to whatever may be set within the popupTemplate.
                type: "fields",
                fieldInfos: [
                    {
                        fieldName: "stateProvi",
                        label: "所在省份"
                    },
                    {
                        fieldName: "longitude",
                        label: "经度",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "latitude",
                        label: "纬度",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "kingdom",
                        label: "界",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "phylum",
                        label: "门",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "class",
                        label: "肛"
                    },
                    {
                        fieldName: "order",
                        label: "目",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "family",
                        label: "科",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "genus",
                        label: "属",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "species",
                        label: "种",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },

                ]
            }
        ]
    };
    
    const url2 = "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/guangzhoumetro/FeatureServer/1";
   
    const url4 = "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/foshanm/FeatureServer/0";
    const url5 = "https://wffgithub666.github.io/json/dongyafeihuang.geojson";
    const url6 = "https://wffgithub666.github.io/json/niuwa.geojson";
    const url7 = "https://wffgithub666.github.io/json/zhonghuaxun.geojson";
    const url8 = "https://wffgithub666.github.io/json/xiangyu.geojson";
    const renderer1 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "image/xg1.png",
            width: "12px",
            height: "12px"
        }
    };
    const renderer2 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "image/sz.png",
            width: "12px",
            height: "12px"
        }
    };
    const renderer3 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/bigpanda.png",
            width: "40px",
            height: "40px"
        }
    };
    const renderer4 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/chuanshanjia.png",
            width: "40px",
            height: "30px"
        }
    };
    const renderer5 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/dongyafeihuang.png",
            width: "50px",
            height: "50px"
        }
    };
    const renderer6 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/niuwa.png",
            width: "40px",
            height: "40px"
        }
    };
    const renderer7 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/zhonghuaxun.png",
            width: "60px",
            height: "20px"
        }
    };
    const renderer8 = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "https://wffgithub666.github.io/image/xiangyu.png",
            width: "50px",
            height: "20px"
        }
    };
    const qiushaya_geojsonLayer = new FL({
        portalItem: {
            id: "3fb99028d847431ab1c1dc8d798da628" // gray vector tiles canvas
          }
    });
    const baitouhe_geojsonLayer = new FL({
        url: url2,
        
    });
    const bigpanda_geojsonLayer = new FL({
        portalItem: {
            id: "e47b69ee7bed44e0adfdc2d99b833dca" // gray vector tiles canvas
          }
    });
    const chuanshanjia_geojsonLayer = new FL({
        url: url4,
       
    });
    const dongyafeihuang_geojsonLayer = new FL({
        portalItem: {
            id: "8e3ac4bb15b746699af4d7608b1c68db" // gray vector tiles canvas
          }
    });
    const niuwa_geojsonLayer = new FL({
        url: "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/dongguanmp/FeatureServer/0"
    });
    const zhonghuaxun_geojsonLayer = new FL({
        
        portalItem: {
            id: "eae3d5b6121546288e3c6b901fee485f" // gray vector tiles canvas
          }
    });
    const xiangyu_geojsonLayer = new FL({
        url: "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/shenzhenmp/FeatureServer/0",
        renderer: renderer2,
        popupTemplate: template
    });
    const xianggangML = new FL({
        portalItem: {
            id: "5c98b86a92314d78abfafadc6a831ede" // gray vector tiles canvas
          }
    });
    const xianggangMP = new FL({
        url: "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/xianggangmp/FeatureServer/0",
        renderer: renderer1,
        popupTemplate: template
    });
    const aomenML = new FL({
        portalItem: {
            id: "da13070815c44f7082b9d4817b730be8" // gray vector tiles canvas
          }
    });
    const aomenMP = new FL({
        url: "https://services7.arcgis.com/g7I97qbDkn2UccIE/arcgis/rest/services/aomenmp/FeatureServer/0"
    });
    const transport = new FL({
        portalItem: {
            id: "dddaac76baea48ed8f0eaa6e6ec2f27a" // gray vector tiles canvas
          }
    });
    const dp = new FL({
        portalItem: {
            id: "6b5b75bb5f1e4e1d9471964f7d1c249f" // gray vector tiles canvas
          }
    });
     const dp2 = new FL({
        portalItem: {
            id: "ba7f22b9da5f4dfcad57142dcb43c7d3" // gray vector tiles canvas
          }
    });
    //秋沙鸭图层标签
    var qiushayaToggle = document.getElementById("qiushaya_geojsonLayer");
    qiushayaToggle.addEventListener("change", function () {
        qiushaya_geojsonLayer.visible = qiushayaToggle.checked;
        console.log(qiushaya_geojsonLayer.visible,baitouhe_geojsonLayer.visible);
        
        if (qiushayaToggle.checked == true) {
            view.map.add(qiushaya_geojsonLayer);
            view.map.add(baitouhe_geojsonLayer);
            alert("广州地铁（Guangzhou Metro）是指服务于中国广东省广州市和珠江三角洲的城市轨道交通系统，广州地铁是国际地铁联盟（CoMET）的成员之一 ，其第一条线路广州地铁1号线于1997年6月28日正式开通运营，使广州成为中国内地第四座、广东省首座开通轨道交通的城市。截至2022年5月，广州地铁运营里程为621公里 ，位列中国内地第三名 。截至2022年5月，广州地铁运营线路共16条，分别为1号线、2号线、3号线（含3号线北延段）、4号线、5号线、6号线、7号线、8号线、9号线、13号线、14号线（含知识城线）、18号线、21号线、22号线、APM线和广佛地铁，共设车站302座，共有换乘站40座，运营里程621公里。");
            qiushaya_geojsonLayer.when(function(){
          view.goTo(qiushaya_geojsonLayer.fullExtent,{duration: 5000});
            
                
        });
            
        } else {
            view.map.remove(qiushaya_geojsonLayer);
            view.map.remove(baitouhe_geojsonLayer);
        }
    });
    
    //白头鹤图层标签
    var baitouheToggle = document.getElementById("baitouhe_geojsonLayer");
    baitouheToggle.addEventListener("change", function () {
        bigpanda_geojsonLayer.visible = baitouheToggle.checked;
        console.log(bigpanda_geojsonLayer.visible);
        if (baitouheToggle.checked == true) {
            view.map.add(bigpanda_geojsonLayer);
            view.map.add(chuanshanjia_geojsonLayer);
            alert("佛山地铁（Foshan Metro）是指服务中国广东省佛山市及广州市的城市轨道交通系统，其第一条线路广佛地铁（佛山地铁1号线）于2010年11月3日正式开通运营，使佛山成为中国内地第十三座开通轨道交通的城市。据2022年12月佛山地铁官网信息显示，佛山地铁共运营地铁线路4条，即广佛地铁（佛山地铁1号线）、佛山地铁2号线、佛山地铁3号线、广州地铁7号线（西延段）。里程总长为124.49千米，共设车站72座。其中，佛山市境内94.6千米，车站61座；广州市境内17.03千米，车站11座。");
             bigpanda_geojsonLayer.when(function(){
          view.goTo(bigpanda_geojsonLayer.fullExtent,{duration: 5000});
        });
        } else {
            view.map.remove(bigpanda_geojsonLayer);
            view.map.remove(chuanshanjia_geojsonLayer);
        }
    });
   
    //大熊猫图层标签
    var bigpandaToggle = document.getElementById("bigpanda_geojsonLayer");
    bigpandaToggle.addEventListener("change", function () {
        dongyafeihuang_geojsonLayer.visible = bigpandaToggle.checked;
        console.log(dongyafeihuang_geojsonLayer.visible);
        if (bigpandaToggle.checked == true) {
            view.map.add(dongyafeihuang_geojsonLayer);
            view.map.add(niuwa_geojsonLayer);
            alert("东莞轨道交通（Dongguan Rail Transit）是指服务于中国广东省东莞市的城市轨道交通系统，包括东莞地铁系统、单轨系统等。其第一条线路于2016年5月27日正式开通运营，使东莞成为中国内地第27座开通轨道交通的城市。据2017年8月东莞轨道交通官网信息显示，东莞轨道交通运营线路共有1条，即东莞轨道交通2号线，该线覆盖7个镇区，运营里程37.8千米，共设车站15座，采用地铁系统。");
                dongyafeihuang_geojsonLayer.when(function(){
          view.goTo(dongyafeihuang_geojsonLayer.fullExtent,{duration: 5000});
        });
        } else {
            view.map.remove(dongyafeihuang_geojsonLayer);
            view.map.remove(niuwa_geojsonLayer);
        }
    });
    
    //穿山甲图层标签
    var chuanshanjiaToggle = document.getElementById("chuanshanjia_geojsonLayer");
    chuanshanjiaToggle.addEventListener("change", function () {
        zhonghuaxun_geojsonLayer.visible = chuanshanjiaToggle.checked;
        console.log(zhonghuaxun_geojsonLayer.visible);
        if (chuanshanjiaToggle.checked == true) {
            view.map.add(zhonghuaxun_geojsonLayer);
            view.map.add(xiangyu_geojsonLayer);
            alert("深圳地铁（Shenzhen Metro）是指服务于中国广东省深圳市的城市轨道交通，其第一条线路于2004年12月28日开通运营，为中国内地第八座开通轨道交通的城市。截至2022年12月28日，深圳地铁运营里程为547.418千米 。截至2022年12月，深圳地铁已开通运营线路共有16条，分别为：1号线、2号线、3号线、4号线、5号线、6号线、6号线支线、7号线、8号线、9号线、10号线、11号线、12号线、14号线、16号线、20号线。全市地铁运营线路总长547.418千米，车站370座（含换乘站58座），构成覆盖深圳市罗湖区、福田区、南山区、盐田区、宝安区、龙华区、龙岗区、坪山区、光明区9个市辖行政区的城市轨道网络.");
                     zhonghuaxun_geojsonLayer.when(function(){
          view.goTo(zhonghuaxun_geojsonLayer.fullExtent,{duration: 5000});
        });
            
        } else {
            view.map.remove(zhonghuaxun_geojsonLayer);
            view.map.remove(xiangyu_geojsonLayer);
        }
    });

    //东亚飞蝗图层标签
    var dongyafeihuangToggle = document.getElementById("dongyafeihuang_geojsonLayer");
    dongyafeihuangToggle.addEventListener("change", function () {
        xianggangML.visible = dongyafeihuangToggle.checked;
        console.log(xianggangML.visible);
        if (dongyafeihuangToggle.checked == true) {
            view.map.add(xianggangML);
            view.map.add(xianggangMP);
            alert("港铁（Mass Transit Railway）是指服务于中国香港特别行政区的轨道交通系统（含缆车和接驳巴士），由九广铁路与香港地铁合并而成，是国际地铁联盟（CoMET）的成员之一，其第一条线路东铁线于清宣统二年（1910年）10月1日正式运营.据2019年2月香港铁路有限公司官网显示，港铁运营线路共11条，其中包括铁路线路及地铁线路10条、机场快线1条。 截至2018年，港铁运营里程共230.9千米（包括市区线、机场快线和轻铁线路）。其中，市区线（不含机场快线）共设车站91座，运营里程共约187.4千米；机场快线共设车站5座（其中3座与港铁东涌线共用），运营里程共35.2千米；轻铁线路共设车站68座，运营里程共约36.2千米。据2022年5月香港铁路有限公司官网显示，港铁在建线路共1条，为沙田至中环线（港铁沙中线）。2021年6月27日，港铁屯马线全线通车。");
            xianggangML.when(function(){
          view.goTo(xianggangML.fullExtent,{duration: 5000});
        });
        } else {
            view.map.remove(xianggangMP);
            view.map.remove(xianggangML);
        }
    });
     
    //牛蛙图层标签
    var niuwaToggle = document.getElementById("niuwa_geojsonLayer");
    niuwaToggle.addEventListener("change", function () {
        aomenML.visible = niuwaToggle.checked;
        console.log(aomenML.visible);
        if (niuwaToggle.checked == true) {
            view.map.add(aomenML);
            view.map.add(aomenMP);
            alert("澳门轻轨（葡萄牙语：Sistema de Metro Ligeiro de Macau；英语：Macao LRT System），是服务于中华人民共和国澳门特别行政区的旅客捷运系统。截至2019年12月，澳门轻轨运营线路共有一条，即澳门轻轨氹仔线（海洋站至氹仔码头站区间），运营里程为9.3千米，共设11座车站，均为高架站。");
            aomenML.when(function(){
          view.goTo(aomenML.fullExtent,{duration: 8000});
        });
        } else {view.map.remove(aomenMP);
            view.map.remove(aomenML);
        }
    });
    
    //中华鲟图层标签
    var zhonghuaxunToggle = document.getElementById("zhonghuaxun_geojsonLayer");
    zhonghuaxunToggle.addEventListener("change", function () {
        transport.visible = zhonghuaxunToggle.checked;
        console.log(transport.visible);
        if (zhonghuaxunToggle.checked == true) {
            view.map.add(transport);
            transport.when(function(){
          view.goTo(transport.fullExtent,{duration: 8000});
        });
        } else {
            view.map.remove(transport);
        }
    });
    //香鱼图层标签
    var xiangyuToggle = document.getElementById("xiangyu_geojsonLayer");
    xiangyuToggle.addEventListener("change", function () {
        dp.visible = xiangyuToggle.checked;
        console.log(dp.visible);
        if (xiangyuToggle.checked == true) {
            view.map.add(dp);
            view.map.remove(dp2);
            transport.when(function(){
          view.goTo(transport.fullExtent,{duration: 8000});
        });
        } else {
            view.map.remove(dp);
            
        }
    });
    var xinToggle = document.getElementById("xin");
    xinToggle.addEventListener("change", function () {
        dp2.visible = xinToggle.checked;
        console.log(dp2.visible);
        if (xinToggle.checked == true) {
            view.map.add(dp2);
            view.map.remove(dp);
            transport.when(function(){
          view.goTo(transport.fullExtent,{duration: 8000});
        });
        } else {
            view.map.remove(dp2);
            
        }
    });
      let legend = new Legend({
  view: view
});

          // Add widget to the bottom right corner of the view
          view.ui.add(legend, "bottom-left");
      
    //显示图层数量
    view.map.allLayers.on("change", function (event) {
        var num = event.target.length - 1;
        document.getElementById("layerNum").textContent = "图层数量： " + num;
    });

    //查询
    view.on("click", function (evt) {
        if (evt.button != 2) return;
        var query = qiushaya_geojsonLayer.createQuery();
        query.geometry = view.toMap(evt);
        query.distance = 200;
        query.units = "miles";
        query.spatialRelationship = "intersects"; // this is the default
        query.returnGeometry = true;
        query.outFields = ["gbifID"];

        qiushaya_geojsonLayer.queryFeatureCount(query).then(function (obj) {
            alert("ʹ该图层要素数量为" + obj);
        });

        view.graphics.removeAll();

        qiushaya_geojsonLayer.queryFeatures(query).then(function (fset) {

            fset.features.forEach(function (item) {
                //view.graphics.add(item);
                var g = new Graphic({
                    geometry: item.geometry,
                    attributes: item.attributes,
                    symbol: {
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        style: "square",
                        color: [128, 128, 128, 0.5],
                        size: 10,  // pixels
                    }
                });
                //aret
                view.graphics.add(g);

            });

        });

    });

    
    
    
    
    
    //--------------------------------要求三：显示比例尺、鼠标对应的地理坐标--------------------------------
    view.watch(["stationary"], function () {
        showInfo(view.center);
    });
    view.on(["pointer-move"], function (evt) {
        showInfo(view.toMap({
            x: evt.x,
            y: evt.y
        }));
    });
    function showInfo(pt) {
        document.getElementById("scaleDisplay").textContent = "比例尺：1 : " + Math.round(view.scale * 1) / 1;
        document.getElementById("coordinateDisplay").textContent = "经纬度：" + pt.latitude.toFixed(2) + "°，" + pt.longitude.toFixed(2) + "°";
    }


    //-------------------------------------要求四：地图联动功能-------------------------------------
    var synchronizeView = function (view, others) {

        others = Array.isArray(others) ? others : [others];
        var viewpointWatchHandle;//视点观察
        var viewStationaryHandle;//静止
        var otherInteractHandlers;//其他交互式操作
        var scheduleId;

        //清除Handles
        var clear = function () {
            if (otherInteractHandlers) {
                otherInteractHandlers.forEach(function (handle) {
                    handle.remove();
                });
            }
            viewpointWatchHandle && viewpointWatchHandle.remove();
            viewStationaryHandle && viewStationaryHandle.remove();
            scheduleId && clearTimeout(scheduleId);
            otherInteractHandlers = viewpointWatchHandle =
                viewStationaryHandle = scheduleId = null;
        };

        var interactWatcher = view.watch('interacting,animation',
            function (newValue) {
                if (!newValue) {
                    return;
                }
                if (viewpointWatchHandle || scheduleId) {
                    return;
                }
                // 在下一帧开始更新其他视图
                scheduleId = setTimeout(function () {
                    scheduleId = null;
                    viewpointWatchHandle = view.watch('viewpoint',
                        function (newValue) {
                            others.forEach(function (otherView) {
                                otherView.viewpoint = newValue;
                            });
                        });
                }, 0);
                // 一旦另一个视图开始交互，就会停止（就像用户开始平移一样）
                otherInteractHandlers = others.map(function (otherView) {
                    return watchUtils.watch(otherView,
                        'interacting,animation',
                        function (
                            value) {
                            if (value) {
                                clear();
                            }
                        });
                });
                // 当视图再次静止时停止
                viewStationaryHandle = watchUtils.whenTrue(view,
                    'stationary', clear);
            });
        return {
            remove: function () {
                this.remove = function () { };
                clear();
                interactWatcher.remove();
            }
        }
    };

    // 同步多个视图的视点
    var synchronizeViews = function (views) {
        var handles = views.map(function (view, idx, views) {
            var others = views.concat();
            others.splice(idx, 1);
            return synchronizeView(view, others);
        });
        return {
            remove: function () {
                this.remove = function () { };
                handles.forEach(function (h) {
                    h.remove();
                });
                handles = null;
            }
        }
    }
    // 绑定视图
    synchronizeViews([view, view2]);

})

//-------------------------------动态加载图层————下拉菜单包含checkbox的外观设计------------------------------
var nextState = 1;
function change(obj) {
    var liArray = document.getElementsByTagName("LI");
    var i = 1;
    var length = liArray.length;
    switch (nextState) {
        case 1:
            for (; i < length; i++) {
                liArray[i].className = "liShow";
            }
            nextState = 0;
            break;
        case 0:
            for (; i < length; i++) {
                liArray[i].className = "liHide";
            }
            nextState = 1;
    }
}