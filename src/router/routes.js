/**
 * 在主框架内显示
 * 路由配置说明
 * {
      path: '/dir-demo-info',    // 页面地址（唯一）
      name: 'dir-demo-info',     // 页面名称（唯一）
      hidden: false,              // 隐藏（不展示在侧边栏菜单）
      meta: {
          title: '用户管理',       // 页面标题
          icon: 'yonghuguanli',  // 页面图标
          cache: true,          // 页面是否进行缓存 默认true
          link: false,           // 页面是否是外链 默认false
          frameSrc: false,       // 页面是否是内嵌 默认false
          requiresAuth: true,   // 页面是否是需要登录 默认true
          perms: [               // 页面的操作的权限列表
              'sys:users:list',   // 查询
              'sys:users:create', // 增加
              'sys:users:update', // 更新
              'sys:users:delete', // 删除
          ],
      },
      component: () => import('@/views/sys/users/dir-users-info.vue'),// 懒加载页面组件
   }
 *
 */
import Todos from '@/views/apps/todos.vue'
   const frameIn = [
    {
      path: "/",
      redirect: { name: "index" },
      component: () => import("@/layout/index.vue"),
      /*************************************************************************************/
      /********************children 建议最多 再加一级children  否则侧边栏体验不好*********************/
      /*************************************************************************************/
      children: [
        {
          path: "/index",
          name: "index",
          meta: {
            cache: true,
            title: "首页",
            icon: "shouye",
            requiresAuth: true,
          },
          component: () => import("@/views/home/index.vue"),
        },
        {
          path: "/dev",
          name: "dev",
          meta: {
            cache: false,
            title: "应用",
            icon: "caidanguanli",
            requiresAuth: true,
          },
          children: [
            {
              path: "/five-in-a-row",
              name: "five-in-a-row",
              meta: {
                cache: false,
                title: "五子棋",
                icon: "a-thecode",
                requiresAuth: false,
                perms: [
                  // "dev:codes:list",
                  // "dev:codes:delete",
                  // "dev:codes:deleteAll",
                  // "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: () => import("@/views/apps/FiveInARow.vue"),
            },
            {
              path: "/loginG",
              name: "loginG",
              meta: {
                cache: false,
                title: "登录/注册",
                icon: "a-thecode",
                requiresAuth: false,
                perms: [
                  // "dev:codes:list",
                  // "dev:codes:delete",
                  // "dev:codes:deleteAll",
                  // "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: () => import("@/views/apps/login.vue"),
            },
            {
              path: "/chat",
              name: "chat",
              meta: {
                cache: false,
                title: "聊天室",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [
                  // "dev:codes:list",
                  // "dev:codes:delete",
                  // "dev:codes:deleteAll",
                  // "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: () => import("@/views/apps/WebSocket.vue"),
            },{
              path: "/chat/001",
              name: "chat-pro",
              meta: {
                cache: false,
                title: "聊天室Pro",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [
                  // "dev:codes:list",
                  // "dev:codes:delete",
                  // "dev:codes:deleteAll",
                  // "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: () => import("@/views/apps/websocket_pro.vue"),
            },
            {
              path: "/img",
              name: "img",
              meta: {
                cache: false,
                title: "图片工具",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [],
              },
              component: () => import("@/views/apps/ImgTools.vue"),
            },{
              path: "/photo",
              name: "photo",
              meta: {
                cache: false,
                title: "证件照",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [],
              },
              component: () => import("@/views/apps/IDPhoto.vue"),
            },
            {
              path: "/mp3",
              name: "mp3",
              meta: {
                cache: false,
                title: "铃声制作",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [],
              },
              component: () => import("@/views/apps/audio.vue"),
            },{
              path: "/qr",
              name: "qr",
              meta: {
                cache: false,
                title: "二维码工具",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [],
              },
              component: () => import("@/views/apps/QR.vue"),
            },
            {
              path: "/todos",
              name: "todos",
              meta: {
                cache: false,
                title: "待办事项",
                icon: "a-thecode",
                // requiresAuth: false,
                perms: [
                  // "dev:codes:list",
                  // "dev:codes:delete",
                  // "dev:codes:deleteAll",
                  // "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: Todos,
            },
            {
              path: "/dir-codes-info",
              name: "dir-codes-info",
              meta: {
                cache: false,
                title: "代码生成",
                icon: "a-thecode",
                requiresAuth: true,
                perms: [
                  "dev:codes:list",
                  "dev:codes:delete",
                  "dev:codes:deleteAll",
                  "dev:codes:singleCurdFrontAndBack",
                ],
              },
              component: () => import("@/views/dev/code/dir-codes-info.vue"),
            },
            {
              path: "/dir-icon-info",
              name: "dir-icon-info",
              meta: {
                title: "图标列表",
                requiresAuth: true,
                icon: "hot-for-ux",
                perms: ["dev:icon"],
              },
              component: () => import("@/views/dev/icon/dir-icon-info.vue"),
            },
          ],
        },
  
        {
          path: "/components",
          name: "components",
          meta: {
            cache: true,
            title: "组件示例",
            icon: "bim",
            requiresAuth: true,
            perms: ["components"],
          },
          children: [
            {
              path: "/editor",
              name: "editor",
              meta: {
                cache: true,
                title: "富文本",
                icon: "wodewenzhang",
                requiresAuth: true,
                perms: ["components:editor"],
              },
              children: [
                {
                  path: "/Tinymce",
                  name: "Tinymce",
                  meta: {
                    cache: true,
                    title: "Tinymce",
                    icon: "daiban",
                    requiresAuth: true,
                    perms: ["components:editor:Tinymce"],
                  },
                  component: () => import("@/components/Tinymce/index.vue"),
                },
                {
                  path: "/Vditor",
                  name: "Vditor",
                  meta: {
                    cache: true,
                    title: "Vditor",
                    icon: "xieboke",
                    requiresAuth: true,
                    perms: ["components:editor:Vditor"],
                  },
                  component: () => import("@/components/Vditor/index.vue"),
                },
                {
                  path: "/VMdEditor",
                  name: "VMdEditor",
                  meta: {
                    cache: true,
                    title: "Markdown",
                    icon: "title",
                    requiresAuth: true,
                    perms: ["components:editor:VMdEditor"],
                  },
                  component: () => import("@/components/VMdEditor/index.vue"),
                },
              ],
            },
          ],
        },
  
        {
          path: "https://www.gcqweb.cn",
          meta: {
            link: true,
            title: "博客",
            requiresAuth: true,
            icon: "flow-others",
          },
        },
        // 重定向页面 必须保留
        {
          path: "/redirect/:path(.*)/:_origin_params(.*)?",
          name: "Redirect",
          hidden: true, //不展示在侧边栏菜单
          meta: {
            title: "重定向",
          },
          component: () => import("@/views/sys/function/redirect"),
        },
      ],
    },
  ];
  
  /**
   * 在主框架之外显示
   */
  const frameOut = [
    // 登录
    {
      path: "/login",
      name: "login",
      meta: {
        title: "登录",
      },
      component: () => import("@/views/sys/login/dir-login-info.vue"),
    },
    {
      path: "/dataCenter",
      name: "dataCenter",
      meta: {
        title: "大屏展示",
      },
      component: () => import("@/views/demo/dataCenter/index.vue"),
    },
  ];
  
  /**
   * 错误页面
   */
  const errorPage = [
    {
      path: "/401",
      name: "401",
      component: () => import("@/views/error/401.vue"),
      meta: {
        title: "401",
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("@/views/error/404.vue"),
      meta: {
        title: "404",
      },
    },
  ];
  
  // 导出需要显示菜单的
  export const frameInRoutes = frameIn;
  
  // 重新组织后导出
  export default [...frameIn, ...frameOut, ...errorPage];
  